import mongoose from "mongoose";
import { connectDb } from "./db.ts";
import {
	models,
	Setting,
	contentData,
	Media,
	Event,
	Registration,
	Payment,
	plain,
} from "./models.ts";
import {
	schemas,
	imageReferences,
	publicEvent,
	type ContentKind,
} from "../content-schemas.ts";
import { HttpError } from "./http.ts";
import { missingEventId, registrationEventFilter } from "./event-links.ts";

export async function getSite() {
	await connectDb();
	const site = contentData(await Setting.findById("site").lean());
	if (!site)
		throw new Error(
			"Website settings are missing. Run the database initialization command first.",
		);
	return site;
}
export async function listContent(kind: ContentKind, admin = false) {
	await connectDb();
	const filter = admin
		? {}
		: kind === "members"
			? { active: true }
			: kind === "settings"
				? { _id: "site" }
				: { published: true };
	const values = await models[kind]
		.find(filter)
		.sort(kind === "members" ? { order: 1, _id: 1 } : { date: -1, _id: 1 })
		.lean();
	return values
		.map(contentData)
		.map((value) => (kind === "events" && !admin ? publicEvent(value) : value));
}
export async function saveContent(kind: ContentKind, input: unknown) {
	const value = schemas[kind].parse(input);
	await connectDb();
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			const previous = contentData(
				await models[kind].findById(value._id).session(session).lean(),
			);
			if (kind === "events" && previous) {
				if (
					previous.slug !== (value as any).slug &&
					((await Registration.exists({
						eventId: missingEventId,
						eventSlug: previous.slug,
					}).session(session)) ||
						(await Payment.exists({
							eventId: missingEventId,
							eventSlug: previous.slug,
						}).session(session)))
				)
					throw new HttpError(
						409,
						"Run the event ID migration before changing this event's slug",
					);
				const site = (await Setting.findById("site")
					.session(session)
					.lean()) as any;
				if (
					site?.eventOnlySlug === previous.slug &&
					(!(value as any).published || previous.slug !== (value as any).slug)
				)
					throw new HttpError(
						409,
						"Disable event-only mode before changing this event's visibility or slug",
					);
			}
			if (kind === "settings" && (value as any).eventOnlySlug) {
				const target = await Event.findOneAndUpdate(
					{ slug: (value as any).eventOnlySlug, published: true },
					{ $set: { updatedAt: new Date() } },
					{ session },
				);
				if (!target)
					throw new HttpError(
						400,
						"Event-only mode requires an existing published event",
					);
			}
			const previousImages = new Set(
				previous ? imageReferences(kind, previous) : [],
			);
			for (const url of imageReferences(kind, value)) {
				if (
					!previousImages.has(url) &&
					!(await Media.exists({
						url,
						private: false,
						ownerKind: kind,
						ownerId: value._id,
					}).session(session))
				)
					throw new HttpError(
						400,
						"Upload new images through the media uploader",
					);
			}
			const { _id, ...fields } = value;
			await models[kind].findOneAndUpdate(
				{ _id },
				{ $set: fields },
				{ upsert: true, runValidators: true, session },
			);
		});
	} finally {
		await session.endSession();
	}
	return value;
}
export async function removeContent(kind: ContentKind, id: string) {
	await connectDb();
	if (kind === "settings")
		throw new HttpError(400, "Website settings cannot be deleted");
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			const record = (await models[kind]
				.findById(id)
				.session(session)
				.lean()) as any;
			if (kind === "events" && record) {
				if (
					(await Registration.exists(
						registrationEventFilter(record._id, record.slug),
					).session(session)) ||
					(await Payment.exists(
						registrationEventFilter(record._id, record.slug),
					).session(session))
				)
					throw new HttpError(
						409,
						"Events with registrations must be unpublished instead",
					);
				const site = (await Setting.findById("site")
					.session(session)
					.lean()) as any;
				if (site?.eventOnlySlug === record.slug)
					throw new HttpError(
						409,
						"Disable event-only mode before deleting this event",
					);
			}
			await models[kind].deleteOne({ _id: id }, { session });
		});
	} finally {
		await session.endSession();
	}
	// Keep detached media for rollback and explicit reference-checked cleanup.
}
export async function getEventForRegistration(slug?: string, eventId?: string) {
	await connectDb();
	if (!slug && !eventId) return null;
	const site = await getSite();
	const event = contentData(
		await Event.findOne({
			...(eventId ? { _id: eventId } : { slug }),
			published: true,
		}).lean(),
	);
	if (
		site.maintenance ||
		site.eventOnlySlug ||
		!event ||
		event.registrationMode !== "internal" ||
		!event.payment
	)
		return null;
	return event;
}
