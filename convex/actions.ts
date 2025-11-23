"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const registerUserWithImage = action({
	args: {
		name: v.string(),
		roll: v.string(),
		phone: v.string(),
		email: v.string(),
		department: v.string(),
		year: v.string(),
		questions: v.string(),
		eventSlug: v.string(),
		eventTitle: v.string(),
		transactionId: v.string(),
		amount: v.number(),
		imageBuffer: v.string(), // base64 encoded
		fileName: v.string(),
	},
	handler: async (ctx, args) => {
		// Validate environment variables
		const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
		const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

		if (!publicKey || !privateKey || !urlEndpoint) {
			throw new Error(
				"ImageKit credentials not configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT in Convex dashboard.",
			);
		}

		// Import ImageKit functions
		const ImageKit = (await import("imagekit")).default;

		const imagekit = new ImageKit({
			publicKey,
			privateKey,
			urlEndpoint,
		});

		let registrationResult;
		let uploadData;

		try {
			// Create pending registration in DB
			registrationResult = await ctx.runMutation(
				api.registrations.createPendingRegistration,
				{
					name: args.name,
					roll: args.roll,
					phone: args.phone,
					email: args.email,
					department: args.department,
					year: args.year,
					questions: args.questions,
					eventSlug: args.eventSlug,
					eventTitle: args.eventTitle,
					transactionId: args.transactionId,
					amount: args.amount,
				},
			);

			// Upload to ImageKit
			const uniqueFileName = `${Date.now()}-${args.fileName.replace(/\s+/g, "-")}`;

			const response = await imagekit.upload({
				file: args.imageBuffer,
				fileName: uniqueFileName,
				folder: `/event-registrations/${args.eventSlug}`,
				useUniqueFileName: true,
				tags: ["event-registration", args.eventSlug],
			});

			uploadData = {
				fileId: response.fileId,
				url: response.url,
			};

			// Update registration with image URLs
			await ctx.runMutation(api.registrations.updateRegistrationWithPayment, {
				paymentId: registrationResult.paymentId,
				paymentScreenshotUrl: uploadData.url,
				paymentScreenshotStorageId: uploadData.fileId,
			});

			return {
				success: true,
				message:
					"Registration successful! Your payment is pending verification.",
			};
		} catch (error: any) {
			// console.error("Registration action error:", error);

			// Cleanup on failure
			if (uploadData?.fileId) {
				try {
					await imagekit.deleteFile(uploadData.fileId);
				} catch (deleteError) {
					// console.error("Failed to cleanup uploaded image:", deleteError);
				}
			}

			if (registrationResult?.userId && registrationResult?.paymentId) {
				try {
					await ctx.runMutation(api.registrations.deleteRegistration, {
						userId: registrationResult.userId,
						paymentId: registrationResult.paymentId,
					});
				} catch (cleanupError) {
					// console.error("Failed to cleanup registration:", cleanupError);
				}
			}

			let userMessage = "Registration failed. Please try again.";

			if (error.message) {
				const errorMsg = error.message.toLowerCase();

				if (
					errorMsg.includes("already registered") ||
					errorMsg.includes("transaction id")
				) {
					userMessage = error.message;
				} else if (errorMsg.includes("imagekit")) {
					userMessage =
						"Failed to upload payment screenshot. Please try again.";
				}
			}

			throw new Error(userMessage);
		}
	},
});
