import { type Id } from "../../../convex/_generated/dataModel";
import { Elysia, t } from "elysia";
import { convex, api } from "../../lib/convex";
import {
	rateLimiter,
	RateLimitPresets,
	getClientIdentifier,
} from "../../lib/rateLimiter";
import { env } from "../../../src/lib/env";

// Verify admin secret middleware
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

export const adminRoutes = new Elysia({ prefix: "/admin" })
	.get("/payments/pending", async ({ request, set }) => {
		try {
			if (!verifyAdmin(request)) {
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

			const payments = await convex.query(api.registrations.getPendingPayments);
			return { success: true, data: payments };
		} catch (error: any) {
			set.status = 500;
			return {
				success: false,
				error: error.message || "Failed to fetch pending payments",
			};
		}
	})
	.post(
		"/payments/verify",
		async ({ body, request, set }) => {
			try {
				if (!verifyAdmin(request)) {
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

				const { paymentId, status, verifiedBy } = body;
				const result = await convex.mutation(
					api.registrations.updatePaymentStatus,
					{
						paymentId: paymentId as Id<"payments">,
						status,
						verifiedBy,
					},
				);

				return result;
			} catch (error: any) {
				set.status = 500;
				return {
					success: false,
					error: error.message || "Failed to verify payment",
				};
			}
		},
		{
			body: t.Object({
				paymentId: t.String(),
				status: t.String(),
				verifiedBy: t.Optional(t.String()),
			}),
		},
	);
