import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const body = await request.json();
		const { feedback, name, email, stars } = body;

		// Validate required fields
		if (!feedback || !name || !stars) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Get private environment variables (server-side only)
		const apiUrl = process.env.FEEDBACK_API_URL;
		const apiKey = process.env.FEEDBACK_API_KEY;

		if (!apiUrl || !apiKey) {
			console.error("Feedback API configuration is missing");
			return NextResponse.json(
				{ error: "Feedback service is not configured" },
				{ status: 500 },
			);
		}

		// Forward the request to the feedback API
		const response = await fetch(`${apiUrl}?apiKey=${apiKey}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				feedback,
				name,
				email: email || "",
				stars,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Feedback API error:", errorText);
			return NextResponse.json(
				{ error: "Failed to submit feedback" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json({ success: true, data }, { status: 200 });
	} catch (error) {
		console.error("Error submitting feedback:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
