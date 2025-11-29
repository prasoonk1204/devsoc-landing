import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { v1Routes } from "./routes/v1";
import { env } from "./lib/env";
import { logger } from "./lib/logger";

const PORT = env.PORT || 3001;
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS?.split(",") || [
	"http://localhost:3000",
	"http://localhost:3001",
];

logger.debug("Allowed Origins:", { origins: ALLOWED_ORIGINS });
logger.debug("Convex URL:", {
	url: env.NEXT_PUBLIC_CONVEX_URL || env.CONVEX_URL,
});

const app = new Elysia()
	.use(
		cors({
			origin: (request) => {
				const origin = request.headers.get("origin");
				if (!origin) return true;

				// Allow configured origins
				if (ALLOWED_ORIGINS.includes(origin)) return true;

				// Allow localhost in development
				if (env.NODE_ENV !== "production" && origin.includes("localhost")) {
					return true;
				}

				return false;
			},
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowedHeaders: [
				"Content-Type",
				"Authorization",
				"X-Admin-Secret",
				"X-RateLimit-Limit",
				"X-RateLimit-Remaining",
				"X-RateLimit-Reset",
			],
			exposeHeaders: [
				"X-RateLimit-Limit",
				"X-RateLimit-Remaining",
				"X-RateLimit-Reset",
				"Retry-After",
			],
			maxAge: 86400, // 24 hours
		}),
	)
	.use(v1Routes)
	.get("/", () => ({
		status: "ok",
		message: "Elysia Server is Running",
		version: "1.0.0",
		api: "/api/v1",
	}))
	.get("/health", () => ({ status: "healthy", timestamp: Date.now() }))
	.onError(({ code, error, set }) => {
		logger.error(`Error [${code}]`, error);

		if (code === "VALIDATION") {
			set.status = 400;
			return {
				success: false,
				error: "Invalid request data",
				details: error.message,
			};
		}

		if (code === "NOT_FOUND") {
			set.status = 404;
			return { success: false, error: "Route not found" };
		}

		set.status = 500;
		return { success: false, error: "Internal server error" };
	})
	.listen(PORT);

if (env.NODE_ENV === "development") {
	logger.info(`Server started`, {
		host: app.server?.hostname,
		port: app.server?.port,
		environment: env.NODE_ENV,
	});
} else {
	// In production, only log that server started (no detailed info to end users)
	logger.info("Server started successfully");
}
