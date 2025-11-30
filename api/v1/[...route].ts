// Vercel Serverless Function wrapper for Elysia backend
import "../../server/lib/setup"; // Load environment variables

// Disable body parsing for file uploads
export const config = {
	api: {
		bodyParser: false,
	},
};

// Create Elysia app instance (singleton)
let app: any = null;

async function getApp() {
	if (!app) {
		// Dynamic import to avoid type conflicts during build
		const { Elysia } = await import("elysia");
		const { cors } = await import("@elysiajs/cors");
		const { v1Routes } = await import("../../server/routes/v1");

		app = new Elysia()
			.use(
				cors({
					origin: true, // Allow all origins in serverless
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
				}),
			)
			.use(v1Routes as any)
			.get("/", () => ({
				status: "ok",
				message: "Elysia Server is Running on Vercel",
				version: "1.0.0",
				api: "/api/v1",
			}))
			.get("/health", () => ({ status: "healthy", timestamp: Date.now() }));
	}
	return app;
}

// Export handler for Vercel
export default async function handler(req: any, res: any) {
	try {
		// Build full URL
		const protocol = req.headers["x-forwarded-proto"] || "https";
		const host = req.headers["x-forwarded-host"] || req.headers.host;
		const url = new URL(req.url || "/", `${protocol}://${host}`);

		// Get raw body for POST/PUT/PATCH requests
		let body: any = undefined;
		if (["POST", "PUT", "PATCH"].includes(req.method)) {
			// For multipart/form-data, we need to pass the raw request
			const contentType = req.headers["content-type"] || "";
			if (contentType.includes("multipart/form-data")) {
				// Elysia will handle multipart parsing
				body = req;
			} else if (contentType.includes("application/json")) {
				// Parse JSON body
				body = JSON.stringify(req.body);
			} else {
				body = req.body;
			}
		}

		// Create standard Request object
		const request = new Request(url.toString(), {
			method: req.method,
			headers: new Headers(req.headers as Record<string, string>),
			body: body,
		});

		// Handle request with Elysia
		const elysiaApp = await getApp();
		const response = await elysiaApp.handle(request);

		// Set status code
		res.status(response.status);

		// Set headers
		response.headers.forEach((value, key) => {
			res.setHeader(key, value);
		});

		// Send response
		const responseBody = await response.text();

		// Try to parse as JSON, otherwise send as text
		try {
			const jsonBody = JSON.parse(responseBody);
			res.json(jsonBody);
		} catch {
			res.send(responseBody);
		}
	} catch (error: any) {
		console.error("Serverless function error:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: error.message || "Unknown error",
		});
	}
}
