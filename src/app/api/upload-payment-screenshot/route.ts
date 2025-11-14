import { NextRequest, NextResponse } from "next/server";
import { uploadToImageKit } from "@/lib/imagekit";

const uploadAttempts = new Map<string, { count: number; resetTime: number }>();

const MAX_UPLOADS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(identifier: string): boolean {
	const now = Date.now();
	const userAttempts = uploadAttempts.get(identifier);

	if (!userAttempts || now > userAttempts.resetTime) {
		uploadAttempts.set(identifier, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW,
		});
		return true;
	}

	if (userAttempts.count >= MAX_UPLOADS_PER_HOUR) {
		return false;
	}

	userAttempts.count++;
	return true;
}

export async function POST(request: NextRequest) {
	try {
		// Get client IP for rate limiting
		const clientIp =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		// Check rate limit
		if (!checkRateLimit(clientIp)) {
			return NextResponse.json(
				{ error: "Too many upload attempts. Please try again later." },
				{ status: 429 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const eventSlug = formData.get("eventSlug") as string;

		// Validate inputs
		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (!eventSlug) {
			return NextResponse.json(
				{ error: "Event slug is required" },
				{ status: 400 },
			);
		}

		// Validate event slug format (prevent path traversal)
		if (!/^[a-z0-9-]+$/.test(eventSlug)) {
			return NextResponse.json(
				{ error: "Invalid event slug format" },
				{ status: 400 },
			);
		}

		// Validate file size (5MB max)
		const MAX_FILE_SIZE = 5 * 1024 * 1024;
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: "File size must be less than 5MB" },
				{ status: 400 },
			);
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Only JPEG, PNG, and WebP images are allowed" },
				{ status: 400 },
			);
		}

		// Validate file name (prevent malicious filenames)
		const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

		// Convert file to buffer for server-side upload
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to ImageKit
		const uploadResponse = await uploadToImageKit(
			buffer,
			eventSlug,
			sanitizedFileName,
		);

		return NextResponse.json({
			success: true,
			data: {
				fileId: uploadResponse.fileId,
				url: uploadResponse.url,
				thumbnailUrl: uploadResponse.thumbnailUrl,
			},
		});
	} catch (error) {
		console.error("Upload error:", error);

		// Don't expose internal error details
		return NextResponse.json(
			{ error: "Failed to upload image. Please try again." },
			{ status: 500 },
		);
	}
}
