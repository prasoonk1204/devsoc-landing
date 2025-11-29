import { Elysia, t } from "elysia";
import { convex, api } from "../../lib/convex";
import {
	rateLimiter,
	RateLimitPresets,
	getClientIdentifier,
} from "../../lib/rateLimiter";
import { env } from "../../lib/env";
import { logger } from "../../lib/logger";

// Verify admin secret for protected routes
const verifyAdmin = (request: Request) => {
	const adminSecret = env.ADMIN_SECRET;

	if (!adminSecret) {
		throw new Error("ADMIN_SECRET is not configured");
	}

	const authHeader = request.headers.get("authorization");
	const providedSecret = request.headers.get("x-admin-secret");

	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7) === adminSecret;
	}

	if (providedSecret) {
		return providedSecret === adminSecret;
	}

	return false;
};

export const settingsRoutes = new Elysia({ prefix: "/settings" })
	.get("/", async ({ request, set }) => {
		try {
			if (!verifyAdmin(request)) {
				logger.warn("Unauthorized admin access attempt", {
					endpoint: "/settings",
				});
				set.status = 401;
				return {
					success: false,
					error: "Unauthorized. Invalid or missing admin secret.",
				};
			}

			// Rate limiting for admin
			const clientId = getClientIdentifier(request);
			const rateLimit = rateLimiter.check(
				`admin:${clientId}`,
				RateLimitPresets.ADMIN.maxRequests,
				RateLimitPresets.ADMIN.windowMs,
			);

			set.headers["X-RateLimit-Limit"] =
				RateLimitPresets.ADMIN.maxRequests.toString();
			set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();

			if (!rateLimit.allowed) {
				set.status = 429;
				return {
					success: false,
					error: "Too many requests. Please try again later.",
				};
			}

			const settings = await convex.query(api.settings.getAllSettings);
			return { success: true, data: settings };
		} catch (error: any) {
			logger.error("Failed to fetch settings", error);
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch settings",
			};
		}
	})
	.get("/community-links", async ({ set, request }) => {
		try {
			// Rate limiting for public endpoint
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

			const links = await convex.query(api.settings.getCommunityLinks);
			return { success: true, data: links };
		} catch (error: any) {
			logger.error("Failed to fetch community links", error);
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch community links",
			};
		}
	})
	.get("/payment", async ({ query: { eventSlug }, set, request }) => {
		try {
			// Rate limiting for public endpoint
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

			const settings = await convex.query(api.settings.getPaymentSettings, {
				eventSlug,
			});
			return { success: true, data: settings };
		} catch (error: any) {
			logger.error("Failed to fetch payment settings", error);
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch payment settings",
			};
		}
	})
	.post(
		"/",
		async ({ body, request, set }) => {
			try {
				if (!verifyAdmin(request)) {
					logger.warn("Unauthorized admin access attempt", {
						endpoint: "POST /settings",
					});
					set.status = 401;
					return {
						success: false,
						error: "Unauthorized. Invalid or missing admin secret.",
					};
				}

				// Rate limiting for admin
				const clientId = getClientIdentifier(request);
				const rateLimit = rateLimiter.check(
					`admin:${clientId}`,
					RateLimitPresets.ADMIN.maxRequests,
					RateLimitPresets.ADMIN.windowMs,
				);

				set.headers["X-RateLimit-Limit"] =
					RateLimitPresets.ADMIN.maxRequests.toString();
				set.headers["X-RateLimit-Remaining"] = rateLimit.remaining.toString();

				if (!rateLimit.allowed) {
					set.status = 429;
					return {
						success: false,
						error: "Too many requests. Please try again later.",
					};
				}

				const { key, value, description, updatedBy } = body;
				logger.info("Updating setting", { key, updatedBy });

				const result = await convex.mutation(api.settings.updateSetting, {
					key,
					value,
					description,
					updatedBy,
				});

				logger.info("Setting updated successfully", { key });
				return result;
			} catch (error: any) {
				logger.error("Failed to update setting", error);
				set.status = 500;
				return {
					success: false,
					error: error.message || "Failed to update setting",
				};
			}
		},
		{
			body: t.Object({
				key: t.String(),
				value: t.String(),
				description: t.Optional(t.String()),
				updatedBy: t.Optional(t.String()),
			}),
		},
	);
