import { Elysia } from "elysia";
import { z } from "zod";
import { convex, api } from "../../lib/convex";
import { imagekit } from "../../lib/imagekit";
import {
	rateLimiter,
	RateLimitPresets,
	getClientIdentifier,
} from "../../lib/rateLimiter";
import { logger } from "../../lib/logger";
import { env } from "../../lib/env";

// Zod validation schemas
const ValidationRuleSchema = z.object({
	minLength: z.number().optional(),
	maxLength: z.number().optional(),
	pattern: z.string().optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	required: z.boolean().optional(),
	fileTypes: z.array(z.string()).optional(), // For file uploads
	maxFileSize: z.number().optional(), // In bytes
});

const FieldSchema = z.object({
	id: z.string().min(1),
	type: z.enum([
		"text",
		"email",
		"tel",
		"textarea",
		"select",
		"radio",
		"checkbox",
		"file",
		"number",
		"date",
	]),
	label: z.string().min(1),
	placeholder: z.string().optional(),
	required: z.boolean(),
	options: z.array(z.string()).optional(),
	validation: ValidationRuleSchema.optional(),
});

const PaymentConfigSchema = z.object({
	enabled: z.boolean(),
	amount: z.number().min(0),
	qrCodeUrl: z.string().url({ message: "Invalid URL format" }).optional(),
	upiId: z.string().optional(),
	instructions: z.string().optional(),
});

const StylingSchema = z.object({
	theme: z.enum(["light", "dark"]),
	primaryColor: z.string().optional(),
	backgroundColor: z.string().optional(),
});

const FormConfigSchema = z.object({
	eventSlug: z
		.string()
		.min(1)
		.regex(
			/^[a-z0-9-]+$/,
			"Event slug must contain only lowercase letters, numbers, and hyphens",
		),
	eventTitle: z.string().min(1),
	formType: z.enum(["simple", "payment", "custom"]),
	isActive: z.boolean(),
	fields: z.array(FieldSchema).min(1),
	paymentConfig: PaymentConfigSchema.optional(),
	styling: StylingSchema.optional(),
});

// Admin authentication middleware
const requireAdmin = (request: Request) => {
	const adminSecret = request.headers.get("X-Admin-Secret");
	if (!adminSecret || adminSecret !== env.ADMIN_SECRET) {
		throw new Error("Unauthorized: Invalid admin secret");
	}
};

// Form admin authentication middleware (for form CRUD operations)
const requireFormAdmin = (request: Request) => {
	const formAdminSecret = request.headers.get("X-Form-Admin-Secret");
	if (!formAdminSecret || formAdminSecret !== env.FORM_ADMIN_SECRET) {
		throw new Error("Unauthorized: Invalid form admin secret");
	}
};

export const formsRoutes = new Elysia({ prefix: "/forms" })
	// Get form configuration
	.get(
		"/:eventSlug/config",
		async ({ params: { eventSlug }, set, request }) => {
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

				const config = await convex.query(api.formConfigs.getFormConfig, {
					eventSlug,
				});

				if (!config) {
					set.status = 404;
					return {
						success: false,
						error: "Form configuration not found",
					};
				}

				return { success: true, data: config };
			} catch (error: any) {
				logger.error("Error fetching form config", error);
				set.status = 500;
				return {
					success: false,
					error: error.message || "Failed to fetch form configuration",
				};
			}
		},
	)

	// Submit dynamic form
	.post(
		"/:eventSlug/submit",
		async ({ params: { eventSlug }, body, set, request }) => {
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`register:${clientId}`,
				RateLimitPresets.REGISTRATION.maxRequests,
				RateLimitPresets.REGISTRATION.windowMs,
			);

			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.REGISTRATION.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();
			set.headers["X-RateLimit-Reset"] = new Date(
				rateLimit.resetTime,
			).toISOString();

			if (!rateLimit.allowed) {
				logger.warn("Rate limit exceeded for form submission", {
					clientId,
					retryAfter: rateLimit.retryAfter,
				});
				set.status = 429;
				set.headers["Retry-After"] = rateLimit.retryAfter?.toString() || "300";
				return {
					success: false,
					error: "Too many submission attempts. Please try again later.",
					retryAfter: rateLimit.retryAfter,
				};
			}

			try {
				// Get form configuration
				const formConfig = await convex.query(api.formConfigs.getFormConfig, {
					eventSlug,
				});

				if (!formConfig) {
					set.status = 404;
					return {
						success: false,
						error: "Form configuration not found",
					};
				}

				if (!formConfig.isActive) {
					set.status = 400;
					return {
						success: false,
						error: "Registration is currently closed for this event",
					};
				}

				// Parse form data from multipart/form-data
				const formDataRaw = body as any;
				let formData: Record<string, any> = {};
				let transactionId = "";
				let uploadedFiles: Record<string, { fileId: string; url: string }> = {};

				// Extract form data
				if (formDataRaw.formData) {
					try {
						formData = JSON.parse(formDataRaw.formData);
					} catch (e) {
						set.status = 400;
						return {
							success: false,
							error: "Invalid form data format",
						};
					}
				}

				if (formDataRaw.transactionId) {
					transactionId = formDataRaw.transactionId;
				}

				// Validate and process form fields
				for (const field of formConfig.fields) {
					const value = formData[field.id];

					// Check required fields
					if (
						field.required &&
						(!value || (typeof value === "string" && value.trim() === ""))
					) {
						set.status = 400;
						return {
							success: false,
							error: `${field.label} is required`,
						};
					}

					// Validate field based on type and validation rules
					if (value && field.validation) {
						const validation = field.validation;

						if (validation.minLength && value.length < validation.minLength) {
							set.status = 400;
							return {
								success: false,
								error: `${field.label} must be at least ${validation.minLength} characters`,
							};
						}

						if (validation.maxLength && value.length > validation.maxLength) {
							set.status = 400;
							return {
								success: false,
								error: `${field.label} must be no more than ${validation.maxLength} characters`,
							};
						}

						if (
							validation.pattern &&
							!new RegExp(validation.pattern).test(value)
						) {
							set.status = 400;
							return {
								success: false,
								error: `${field.label} format is invalid`,
							};
						}
					}

					// Handle file uploads for file type fields
					if (field.type === "file") {
						const fileKey = `file_${field.id}`;
						const file = formDataRaw[fileKey];

						if (field.required && !file) {
							set.status = 400;
							return {
								success: false,
								error: `${field.label} is required`,
							};
						}

						if (file) {
							// Validate file
							const validation = field.validation || ({} as any);
							const maxSize = validation.maxFileSize || 5 * 1024 * 1024; // 5MB default
							const allowedTypes = validation.fileTypes || [
								"image/jpeg",
								"image/jpg",
								"image/png",
								"image/webp",
							];

							if (file.size > maxSize) {
								set.status = 400;
								return {
									success: false,
									error: `${field.label} size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
								};
							}

							if (!allowedTypes.includes(file.type)) {
								set.status = 400;
								return {
									success: false,
									error: `${field.label} must be one of: ${allowedTypes.join(", ")}`,
								};
							}

							// Upload to ImageKit
							try {
								const arrayBuffer = await file.arrayBuffer();
								const buffer = Buffer.from(arrayBuffer);
								const sanitizedFileName = file.name.replace(
									/[^a-zA-Z0-9.-]/g,
									"-",
								);
								const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

								const response = await imagekit.upload({
									file: buffer,
									fileName: uniqueFileName,
									folder: `/form-uploads/${eventSlug}/${field.id}`,
									useUniqueFileName: true,
									tags: ["form-upload", eventSlug, field.id],
								});

								uploadedFiles[field.id] = {
									fileId: response.fileId,
									url: response.url,
								};

								// Store the URL in form data
								formData[field.id] = response.url;
							} catch (uploadError) {
								logger.error("File upload error", uploadError);
								set.status = 500;
								return {
									success: false,
									error: `Failed to upload ${field.label}`,
								};
							}
						}
					}
				}

				let registrationResult: { userId: any; paymentId?: any } | undefined;

				// Handle payment if enabled
				if (formConfig.paymentConfig?.enabled) {
					if (!transactionId) {
						set.status = 400;
						return {
							success: false,
							error: "Transaction ID is required for paid events",
						};
					}

					// Create registration with payment
					registrationResult = await convex.mutation(
						api.registrations.createDynamicRegistration,
						{
							eventSlug,
							eventTitle: formConfig.eventTitle,
							formData,
							transactionId: transactionId.trim(),
							amount: formConfig.paymentConfig.amount,
						},
					);

					// Handle payment screenshot if provided
					const paymentScreenshot = formDataRaw.paymentScreenshot;
					if (paymentScreenshot && registrationResult.paymentId) {
						try {
							const arrayBuffer = await paymentScreenshot.arrayBuffer();
							const buffer = Buffer.from(arrayBuffer);
							const sanitizedFileName = paymentScreenshot.name.replace(
								/[^a-zA-Z0-9.-]/g,
								"-",
							);
							const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;

							const response = await imagekit.upload({
								file: buffer,
								fileName: uniqueFileName,
								folder: `/event-registrations/${eventSlug}`,
								useUniqueFileName: true,
								tags: ["event-registration", eventSlug, transactionId],
							});

							await convex.mutation(
								api.registrations.updateRegistrationWithPayment,
								{
									paymentId: registrationResult.paymentId,
									paymentScreenshotUrl: response.url,
									paymentScreenshotStorageId: response.fileId,
								},
							);
						} catch (uploadError) {
							logger.error("Payment screenshot upload error", uploadError);
						}
					}

					logger.info("Registration with payment completed successfully", {
						email: formData.email,
						eventSlug,
						paymentId: registrationResult.paymentId,
					});

					return {
						success: true,
						message:
							"Registration successful! Your payment is pending verification.",
						data: {
							registrationId: registrationResult.userId,
							uploadedFiles: Object.keys(uploadedFiles),
						},
					};
				} else {
					// Simple registration without payment
					registrationResult = await convex.mutation(
						api.registrations.createDynamicRegistration,
						{
							eventSlug,
							eventTitle: formConfig.eventTitle,
							formData,
						},
					);

					logger.info("Simple registration completed successfully", {
						email: formData.email,
						eventSlug,
						userId: registrationResult.userId,
					});

					return {
						success: true,
						message: "Registration successful!",
						data: {
							registrationId: registrationResult.userId,
							uploadedFiles: Object.keys(uploadedFiles),
						},
					};
				}
			} catch (error: any) {
				logger.error("Form submission error", error);
				set.status = 400;

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
						userMessage = "Failed to upload files. Please try again.";
					}
				}

				return {
					success: false,
					error: userMessage,
				};
			}
		},
	)

	// Admin: Create/Update form configuration
	.post("/admin/config", async ({ body, set, request }) => {
		try {
			// Check admin authentication
			requireAdmin(request);
			// Check form admin authentication
			requireFormAdmin(request);

			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`admin:${clientId}`,
				RateLimitPresets.ADMIN.maxRequests,
				RateLimitPresets.ADMIN.windowMs,
			);

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			// Validate request body with Zod
			const validationResult = FormConfigSchema.safeParse(body);
			if (!validationResult.success) {
				set.status = 400;
				return {
					success: false,
					error: "Invalid form configuration",
					details: validationResult.error.issues,
				};
			}

			const formConfig = validationResult.data;

			// Additional validation for payment forms
			if (
				formConfig.formType === "payment" &&
				(!formConfig.paymentConfig || !formConfig.paymentConfig.enabled)
			) {
				set.status = 400;
				return {
					success: false,
					error: "Payment configuration is required for payment forms",
				};
			}

			// Validate field combinations
			for (const field of formConfig.fields) {
				if (
					(field.type === "select" ||
						field.type === "radio" ||
						field.type === "checkbox") &&
					!field.options?.length
				) {
					set.status = 400;
					return {
						success: false,
						error: `Field "${field.label}" of type "${field.type}" requires options`,
					};
				}
			}

			const configId = await convex.mutation(api.formConfigs.upsertFormConfig, {
				eventSlug: formConfig.eventSlug,
				eventTitle: formConfig.eventTitle,
				formType: formConfig.formType,
				isActive: formConfig.isActive,
				fields: formConfig.fields,
				paymentConfig: formConfig.paymentConfig,
				styling: formConfig.styling,
				createdBy: "admin",
			});

			logger.info("Form configuration updated", {
				eventSlug: formConfig.eventSlug,
				configId,
				createdBy: "admin",
			});

			return {
				success: true,
				message: "Form configuration saved successfully",
				data: {
					configId,
					eventSlug: formConfig.eventSlug,
				},
			};
		} catch (error: any) {
			logger.error("Error saving form config", error);

			if (error.message === "Unauthorized: Invalid admin secret") {
				set.status = 401;
				return {
					success: false,
					error: "Unauthorized: Invalid admin secret",
				};
			}

			if (error.message === "Unauthorized: Invalid form admin secret") {
				set.status = 401;
				return {
					success: false,
					error: "Unauthorized: Invalid form admin secret",
				};
			}

			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to save form configuration",
			};
		}
	})

	// Admin: Get all form configurations
	.get("/admin/configs", async ({ set, request }) => {
		try {
			// Check admin authentication
			requireAdmin(request);

			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`admin:${clientId}`,
				RateLimitPresets.ADMIN.maxRequests,
				RateLimitPresets.ADMIN.windowMs,
			);

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			const configs = await convex.query(api.formConfigs.getAllFormConfigs, {});

			return {
				success: true,
				data: configs,
				count: configs.length,
			};
		} catch (error: any) {
			logger.error("Error fetching form configs", error);

			if (error.message === "Unauthorized: Invalid admin secret") {
				set.status = 401;
				return {
					success: false,
					error: "Unauthorized: Invalid admin secret",
				};
			}

			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch form configurations",
			};
		}
	})

	// Admin: Toggle form status
	.patch(
		"/admin/:eventSlug/status",
		async ({ params: { eventSlug }, body, set, request }) => {
			try {
				// Check admin authentication
				requireAdmin(request);
				// Check form admin authentication
				requireFormAdmin(request);

				const clientId = getClientIdentifier(request);
				const rateLimit = rateLimiter.check(
					`admin:${clientId}`,
					RateLimitPresets.ADMIN.maxRequests,
					RateLimitPresets.ADMIN.windowMs,
				);

				if (!rateLimit.allowed) {
					set.status = 429;
					return {
						success: false,
						error: "Too many requests. Please try again later.",
					};
				}

				// Validate request body
				const statusSchema = z.object({
					isActive: z.boolean(),
				});

				const validationResult = statusSchema.safeParse(body);
				if (!validationResult.success) {
					set.status = 400;
					return {
						success: false,
						error: "Invalid request body",
						details: validationResult.error.issues,
					};
				}

				const { isActive } = validationResult.data;

				const success = await convex.mutation(
					api.formConfigs.toggleFormStatus,
					{
						eventSlug,
						isActive,
					},
				);

				if (!success) {
					set.status = 404;
					return {
						success: false,
						error: "Form configuration not found",
					};
				}

				logger.info("Form status toggled", { eventSlug, isActive });

				return {
					success: true,
					message: `Form ${isActive ? "activated" : "deactivated"} successfully`,
					data: {
						eventSlug,
						isActive,
					},
				};
			} catch (error: any) {
				logger.error("Error toggling form status", error);

				if (error.message === "Unauthorized: Invalid admin secret") {
					set.status = 401;
					return {
						success: false,
						error: "Unauthorized: Invalid admin secret",
					};
				}

				if (error.message === "Unauthorized: Invalid form admin secret") {
					set.status = 401;
					return {
						success: false,
						error: "Unauthorized: Invalid form admin secret",
					};
				}

				set.status = 500;
				return {
					success: false,
					error: error.message || "Failed to update form status",
				};
			}
		},
	)

	// Admin: Delete form configuration
	.delete(
		"/admin/:eventSlug",
		async ({ params: { eventSlug }, set, request }) => {
			try {
				// Check admin authentication
				requireAdmin(request);
				// Check form admin authentication
				requireFormAdmin(request);

				const clientId = getClientIdentifier(request);
				const rateLimit = rateLimiter.check(
					`admin:${clientId}`,
					RateLimitPresets.ADMIN.maxRequests,
					RateLimitPresets.ADMIN.windowMs,
				);

				if (!rateLimit.allowed) {
					set.status = 429;
					return {
						success: false,
						error: "Too many requests. Please try again later.",
					};
				}

				const success = await convex.mutation(
					api.formConfigs.deleteFormConfig,
					{
						eventSlug,
					},
				);

				if (!success) {
					set.status = 404;
					return {
						success: false,
						error: "Form configuration not found",
					};
				}

				logger.info("Form configuration deleted", { eventSlug });

				return {
					success: true,
					message: "Form configuration deleted successfully",
					data: {
						eventSlug,
					},
				};
			} catch (error: any) {
				logger.error("Error deleting form config", error);

				if (error.message === "Unauthorized: Invalid admin secret") {
					set.status = 401;
					return {
						success: false,
						error: "Unauthorized: Invalid admin secret",
					};
				}

				if (error.message === "Unauthorized: Invalid form admin secret") {
					set.status = 401;
					return {
						success: false,
						error: "Unauthorized: Invalid form admin secret",
					};
				}

				set.status = 500;
				return {
					success: false,
					error: error.message || "Failed to delete form configuration",
				};
			}
		},
	);
