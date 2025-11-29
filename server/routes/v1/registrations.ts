import { type Id } from "../../../convex/_generated/dataModel";
import { Elysia, t } from "elysia";
import { convex, api } from "../../lib/convex";
import { imagekit } from "../../lib/imagekit";
import {
	rateLimiter,
	RateLimitPresets,
	getClientIdentifier,
} from "../../lib/rateLimiter";
import { logger } from "../../lib/logger";

export const registrationsRoutes = new Elysia({ prefix: "/registrations" })
	.post(
		"/register",
		async ({ body, set, request }) => {
			// Rate limiting for registration endpoint
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`register:${clientId}`,
				RateLimitPresets.REGISTRATION.maxRequests,
				RateLimitPresets.REGISTRATION.windowMs,
			);

			// Set rate limit headers
			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.REGISTRATION.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();
			set.headers["X-RateLimit-Reset"] = new Date(
				rateLimit.resetTime,
			).toISOString();

			if (!rateLimit.allowed) {
				logger.warn("Rate limit exceeded for registration", {
					clientId,
					retryAfter: rateLimit.retryAfter,
				});
				set.status = 429;
				set.headers["Retry-After"] = rateLimit.retryAfter?.toString() || "300";
				return {
					success: false,
					error: "Too many registration attempts. Please try again later.",
					retryAfter: rateLimit.retryAfter,
				};
			}
			const {
				name,
				roll,
				phone,
				email,
				department,
				year,
				questions,
				eventSlug,
				eventTitle,
				transactionId,
				amount,
				image,
			} = body;

			let registrationResult:
				| { userId: Id<"users">; paymentId: Id<"payments"> }
				| undefined;
			let uploadData: { fileId: string; url: string } | undefined;

			try {
				// Validate image file
				if (!image || image.size === 0) {
					logger.warn("Registration failed: Missing payment screenshot", {
						email,
						eventSlug,
					});
					set.status = 400;
					return {
						success: false,
						message: "Payment screenshot is required",
					};
				}

				// Validate image size (max 5MB)
				const maxSize = 5 * 1024 * 1024;
				if (image.size > maxSize) {
					logger.warn("Registration failed: Image too large", {
						email,
						eventSlug,
						size: image.size,
					});
					set.status = 400;
					return {
						success: false,
						message: "Image size must be less than 5MB",
					};
				}

				// Validate image type
				const allowedTypes = [
					"image/jpeg",
					"image/jpg",
					"image/png",
					"image/webp",
				];
				if (!allowedTypes.includes(image.type)) {
					logger.warn("Registration failed: Invalid image type", {
						email,
						eventSlug,
						type: image.type,
					});
					set.status = 400;
					return {
						success: false,
						message: "Only JPEG, PNG, and WebP images are allowed",
					};
				}

				// 1. Create pending registration
				logger.info("Creating registration", {
					email: email.trim().toLowerCase(),
					eventSlug,
					transactionId: transactionId.trim(),
				});

				registrationResult = await convex.mutation(
					api.registrations.createPendingRegistration,
					{
						name: name.trim(),
						roll: roll.trim(),
						phone: phone.trim(),
						email: email.trim().toLowerCase(),
						department: department.trim(),
						year: year.trim(),
						questions: questions.trim(),
						eventSlug,
						eventTitle,
						transactionId: transactionId.trim(),
						amount: Number(amount),
					},
				);

				// 2. Upload to ImageKit
				logger.debug("Uploading payment screenshot to ImageKit", {
					eventSlug,
					fileName: image.name,
				});

				const arrayBuffer = await image.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, "-");
				const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

				const response = await imagekit.upload({
					file: buffer,
					fileName: uniqueFileName,
					folder: `/event-registrations/${eventSlug}`,
					useUniqueFileName: true,
					tags: ["event-registration", eventSlug, transactionId],
				});

				uploadData = {
					fileId: response.fileId,
					url: response.url,
				};

				logger.debug("Payment screenshot uploaded successfully", {
					fileId: uploadData.fileId,
				});

				// 3. Update registration with payment info
				await convex.mutation(api.registrations.updateRegistrationWithPayment, {
					paymentId: registrationResult.paymentId,
					paymentScreenshotUrl: uploadData.url,
					paymentScreenshotStorageId: uploadData.fileId,
				});

				logger.info("Registration completed successfully", {
					email: email.trim().toLowerCase(),
					eventSlug,
					paymentId: registrationResult.paymentId,
				});

				return {
					success: true,
					message:
						"Registration successful! Your payment is pending verification.",
				};
			} catch (error: any) {
				logger.error("Registration error", error);

				// Cleanup on failure
				if (uploadData?.fileId) {
					try {
						await imagekit.deleteFile(uploadData.fileId);
						logger.debug("Cleaned up ImageKit file", {
							fileId: uploadData.fileId,
						});
					} catch (cleanupError) {
						logger.error("Failed to cleanup ImageKit file", cleanupError);
					}
				}

				if (registrationResult?.userId && registrationResult?.paymentId) {
					try {
						await convex.mutation(api.registrations.deleteRegistration, {
							userId: registrationResult.userId,
							paymentId: registrationResult.paymentId,
						});
						logger.debug("Cleaned up registration", {
							userId: registrationResult.userId,
							paymentId: registrationResult.paymentId,
						});
					} catch (cleanupError) {
						logger.error("Failed to cleanup registration", cleanupError);
					}
				}

				set.status = 400;

				// Return user-friendly error messages
				let userMessage = "Registration failed. Please try again.";
				if (error.message) {
					const errorMsg = error.message.toLowerCase();
					if (
						errorMsg.includes("already registered") ||
						errorMsg.includes("transaction id")
					) {
						userMessage = error.message;
					} else if (
						errorMsg.includes("imagekit") ||
						errorMsg.includes("upload")
					) {
						userMessage =
							"Failed to upload payment screenshot. Please try again.";
					}
				}

				return {
					success: false,
					message: userMessage,
				};
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				roll: t.String({ minLength: 1 }),
				phone: t.String({ minLength: 10 }),
				email: t.String({ format: "email" }),
				department: t.String({ minLength: 1 }),
				year: t.String({ minLength: 1 }),
				questions: t.String(),
				eventSlug: t.String({ minLength: 1 }),
				eventTitle: t.String({ minLength: 1 }),
				transactionId: t.String({ minLength: 1 }),
				amount: t.Numeric({ minimum: 0 }),
				image: t.File(),
			}),
		},
	)
	.get("/:eventSlug", async ({ params: { eventSlug }, set, request }) => {
		try {
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`read:${clientId}`,
				RateLimitPresets.RELAXED.maxRequests,
				RateLimitPresets.RELAXED.windowMs,
			);

			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.RELAXED.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			const registrations = await convex.query(
				api.registrations.getEventRegistrations,
				{
					eventSlug,
				},
			);
			return { success: true, data: registrations };
		} catch (error: any) {
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch registrations",
			};
		}
	})
	.get("/check", async ({ query: { email, eventSlug }, set, request }) => {
		try {
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`read:${clientId}`,
				RateLimitPresets.RELAXED.maxRequests,
				RateLimitPresets.RELAXED.windowMs,
			);

			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.RELAXED.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			if (!email || !eventSlug) {
				return { success: true, data: { isRegistered: false } };
			}
			const result = await convex.query(
				api.registrations.checkEmailRegistration,
				{
					email,
					eventSlug,
				},
			);
			return { success: true, data: result };
		} catch (error: any) {
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to check registration",
			};
		}
	})
	.get("/user", async ({ query: { email, eventSlug }, set, request }) => {
		try {
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`read:${clientId}`,
				RateLimitPresets.RELAXED.maxRequests,
				RateLimitPresets.RELAXED.windowMs,
			);

			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.RELAXED.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			if (!email || !eventSlug) {
				return { success: true, data: null };
			}
			const user = await convex.query(api.registrations.getUserRegistration, {
				email,
				eventSlug,
			});
			return { success: true, data: user };
		} catch (error: any) {
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch user registration",
			};
		}
	});
