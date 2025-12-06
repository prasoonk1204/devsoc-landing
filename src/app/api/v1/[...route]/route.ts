// Next.js App Router API Route for Elysia backend
import "../../../../../server/lib/setup"; // Load environment variables
import { NextRequest, NextResponse } from "next/server";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { v1Routes } from "../../../../../server/routes/v1";

// Create Elysia app instance (singleton)
let app: any = null;

function getApp() {
	if (!app) {
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
				message: "Elysia Server is Running",
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
		// Get the Elysia app
		const elysiaApp = getApp();

		// Get the full URL
		const url = new URL(req.url);

		// Create a standard Request object for Elysia
		const request = new Request(url.toString(), {
			method: req.method,
			headers: req.headers,
			body: req.body,
			// @ts-ignore - duplex is needed for streaming
			duplex: "half",
		});

		// Handle request with Elysia
		const response = await elysiaApp.handle(request);

		// Get response body
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
		// console.error("API Route error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error.message || "Unknown error",
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
