import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { Registration, Payment, Media, Event, plain } from "./models.ts";
import { connectDb } from "./db.ts";
import { getEventForRegistration } from "./content.ts";
import { HttpError } from "./http.ts";

export const registrationInput = z
	.object({
		name: z
			.string()
			.trim()
			.min(2)
			.max(100)
			.regex(/^[a-zA-Z\s.'-]+$/),
		roll: z
			.string()
			.trim()
			.min(3)
			.max(20)
			.regex(/^[a-zA-Z0-9/-]+$/)
			.transform((value) => value.toUpperCase()),
		phone: z
			.string()
			.trim()
			.min(10)
			.max(15)
			.regex(/^[0-9+\-\s()]+$/)
			.refine((value) => value.replace(/[^0-9]/g, "").length >= 10),
		email: z.string().trim().toLowerCase().email().max(100),
		department: z.string().min(1).max(50),
		year: z.string().min(1).max(20),
		questions: z.string().trim().min(1).max(1000),
		transactionId: z
			.string()
			.trim()
			.min(5)
			.max(100)
			.regex(/^[a-zA-Z0-9]+$/)
			.transform((value) => value.toUpperCase()),
		eventSlug: z.string().min(1).max(120),
	})
	.strict();
export async function completeRegistration(
	input: unknown,
	mediaId: string,
	registrationId: string,
) {
	const value = registrationInput.parse(input);
	const event = await getEventForRegistration(value.eventSlug);
	if (!event) throw new HttpError(403, "Registration is closed for this event");
	const media = (await Media.findOne({
		_id: mediaId,
		ownerKind: "registrations",
		ownerId: registrationId,
		private: true,
	}).lean()) as any;
	if (!media) throw new HttpError(400, "Verified payment screenshot required");
	const paymentId = randomUUID();
	const { transactionId, ...registrationFields } = value;
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			const currentEvent = await Event.updateOne(
				{
					_id: event._id,
					slug: event.slug,
					published: true,
					registrationMode: "internal",
					"payment.amount": event.payment.amount,
				},
				{ $set: { updatedAt: new Date() } },
				{ session },
			);
			if (!currentEvent.matchedCount)
				throw new HttpError(
					409,
					"Event registration settings changed. Reload before registering.",
				);
			await Registration.create(
				[
					{
						...registrationFields,
						_id: registrationId,
						eventTitle: event.title,
						registeredAt: Date.now(),
						paymentId,
					},
				],
				{ session },
			);
			await Payment.create(
				[
					{
						_id: paymentId,
						userId: registrationId,
						transactionId,
						transactionKey: transactionId,
						eventSlug: event.slug,
						eventTitle: event.title,
						amount: event.payment.amount,
						status: "pending",
						paymentScreenshotUrl: media.url,
						paymentScreenshotStorageId: media.fileId,
					},
				],
				{ session },
			);
		});
	} catch (error: any) {
		if (error.code === 11000)
			throw new HttpError(
				409,
				"Email already registered or transaction ID already used",
			);
		throw error;
	} finally {
		await session.endSession();
	}
	return {
		success: true,
		message: "Registration successful! Your payment is pending verification.",
	};
}
export async function eventRegistrations(eventSlug: string, email?: string) {
	await connectDb();
	const users = await Registration.find({
		eventSlug,
		...(email ? { email: email.trim().toLowerCase() } : {}),
	})
		.limit(500)
		.lean();
	const payments = await Payment.find({
		userId: { $in: users.map((user) => user._id) },
	}).lean();
	return plain(
		users.map((user: any) => ({
			...user,
			payment:
				payments.find((payment: any) => payment._id === user.paymentId) || null,
		})),
	);
}
