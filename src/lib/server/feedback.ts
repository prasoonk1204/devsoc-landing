import { z } from "zod";
import { HttpError, json, readJson, requireSameOrigin } from "./http.ts";
import { rateLimit, clientKey } from "./auth.ts";
import { connectDb } from "./db.ts";
import { Event } from "./models.ts";

export async function submitFeedback(request: Request) {
	try {
		requireSameOrigin(request);
		const body = z
			.object({
				eventSlug: z.string().min(1).max(120),
				feedback: z.string().trim().min(1).max(5000),
				name: z.string().trim().min(1).max(100),
				email: z.union([z.string().email().max(100), z.literal("")]).optional(),
				stars: z.number().int().min(1).max(5),
			})
			.strict()
			.parse(await readJson(request, 16000));
		await rateLimit(`feedback:${clientKey(request)}`, 5, 300000);
		await connectDb();
		if (
			!(await Event.exists({
				slug: body.eventSlug,
				published: true,
				feedbackEnabled: true,
			}))
		)
			throw new HttpError(403, "Feedback is closed for this event");
		if (!process.env.FEEDBACK_API_URL || !process.env.FEEDBACK_API_KEY)
			throw new HttpError(503, "Feedback service is not configured");
		const url = new URL(process.env.FEEDBACK_API_URL);
		url.searchParams.set("apiKey", process.env.FEEDBACK_API_KEY);
		const { eventSlug, ...payload } = body;
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(15000),
		});
		if (!response.ok) throw new HttpError(502, "Failed to submit feedback");
		return json({ success: true, data: await response.json() });
	} catch (error) {
		if (error instanceof z.ZodError)
			return json({ success: false, error: "Invalid feedback" }, 400);
		return json(
			{
				success: false,
				error:
					error instanceof HttpError
						? error.message
						: "Failed to submit feedback",
			},
			error instanceof HttpError ? error.status : 500,
		);
	}
}
