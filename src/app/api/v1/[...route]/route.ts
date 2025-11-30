// Next.js App Router API Route for Elysia backend
import "../../../../../server/lib/setup"; // Load environment variables
import { NextRequest, NextResponse } from "next/server";

// Create Elysia app instance (singleton)
let app: any = null;

async function getApp() {
	if (!app) {
		// Dynamic import to avoid type conflicts during build
		const { Elysia } = await import("elysia");
		const { cors } = await import("@elysiajs/cors");
		const { v1Routes } = await import("../../../../../server/routes/v1");

		app = new Elysia()
			.use(
				cors({
					origin: true, // Allow all origins
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

// Handle all HTTP methods
async function handler(req: NextRequest) {
	try {
		// Get the full URL
		const url = new URL(req.url);

		// Clone the request to pass to Elysia
		// This preserves the original request including body
		const clonedRequest = req.clone();

		// Create a new Request with the correct URL
		const request = new Request(url.toString(), {
			method: clonedRequest.method,
			headers: clonedRequest.headers,
			body: clonedRequest.body,
			// @ts-ignore - duplex is needed for streaming
			duplex: "half",
		});

		// Handle request with Elysia
		const elysiaApp = await getApp();
		const response = await elysiaApp.handle(request);

		// Convert Elysia response to Next.js response
		const responseBody = await response.text();

		// Try to parse as JSON
		let jsonBody: any;
		try {
			jsonBody = JSON.parse(responseBody);
		} catch {
			jsonBody = { data: responseBody };
		}

		// Create Next.js response with headers
		const nextResponse = NextResponse.json(jsonBody, {
			status: response.status,
		});

		// Copy headers from Elysia response
		response.headers.forEach((value: string, key: string) => {
			nextResponse.headers.set(key, value);
		});

		return nextResponse;
	} catch (error: any) {
		console.error("API Route error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error.message || "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// Export handlers for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;

// Configure route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
