import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const getConvexClient = () => {
	const url = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!url) {
		throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
	}
	return new ConvexHttpClient(url);
};

// Verify admin secret
function verifyAdminSecret(request: NextRequest): boolean {
	const adminSecret = process.env.ADMIN_SECRET;

	if (!adminSecret) {
		throw new Error("ADMIN_SECRET is not configured");
	}

	const authHeader = request.headers.get("authorization");
	const providedSecret = request.headers.get("x-admin-secret");

	// Support both Authorization header and X-Admin-Secret header
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7) === adminSecret;
	}

	if (providedSecret) {
		return providedSecret === adminSecret;
	}

	return false;
}

// Retrieve settings
export async function GET(request: NextRequest) {
	try {
		// Verify admin secret
		if (!verifyAdminSecret(request)) {
			return NextResponse.json(
				{ error: "Unauthorized. Invalid or missing admin secret." },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const key = searchParams.get("key");

		const convex = getConvexClient();

		if (key) {
			// Get specific setting
			const setting = await convex.query(api.settings.getSetting, { key });

			if (!setting) {
				return NextResponse.json(
					{ error: `Setting '${key}' not found` },
					{ status: 404 },
				);
			}

			return NextResponse.json({
				success: true,
				data: setting,
			});
		} else {
			// Get all settings
			const settings = await convex.query(api.settings.getAllSettings, {});

			return NextResponse.json({
				success: true,
				data: settings,
			});
		}
	} catch (error: any) {
		return NextResponse.json(
			{
				error: error.message || "Failed to retrieve settings",
			},
			{ status: 500 },
		);
	}
}

// Create or update setting
export async function POST(request: NextRequest) {
	try {
		// Verify admin secret
		if (!verifyAdminSecret(request)) {
			return NextResponse.json(
				{ error: "Unauthorized. Invalid or missing admin secret." },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { key, value, description } = body;

		if (!key) {
			return NextResponse.json(
				{ error: "Setting key is required" },
				{ status: 400 },
			);
		}

		if (value === undefined) {
			return NextResponse.json(
				{ error: "Setting value is required" },
				{ status: 400 },
			);
		}

		// Convert value to JSON string if it's an object
		const stringValue =
			typeof value === "string" ? value : JSON.stringify(value);

		const convex = getConvexClient();
		const result = await convex.mutation(api.settings.updateSetting, {
			key,
			value: stringValue,
			description,
			updatedBy: "admin",
		});

		return NextResponse.json({
			success: true,
			message: result.message,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				error: error.message || "Failed to update setting",
			},
			{ status: 500 },
		);
	}
}

// Delete a setting
export async function DELETE(request: NextRequest) {
	try {
		// Verify admin secret
		if (!verifyAdminSecret(request)) {
			return NextResponse.json(
				{ error: "Unauthorized. Invalid or missing admin secret." },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const key = searchParams.get("key");

		if (!key) {
			return NextResponse.json(
				{ error: "Setting key is required" },
				{ status: 400 },
			);
		}

		const convex = getConvexClient();
		const result = await convex.mutation(api.settings.deleteSetting, { key });

		return NextResponse.json({
			success: true,
			message: result.message,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				error: error.message || "Failed to delete setting",
			},
			{ status: 500 },
		);
	}
}
