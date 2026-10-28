import { createHash } from "node:crypto";
import { Event } from "./models.ts";
import { connectDb } from "./db.ts";
import { HttpError } from "./http.ts";

// Historical groups have no event document; never attach them by display name.
export function historicalEventId(slug: string) {
	return `historical-${createHash("sha256").update(slug).digest("hex").slice(0, 40)}`;
}
export const missingEventId = { $in: [null, ""] };
export function registrationEventFilter(eventId: string, slug?: string) {
	return slug
		? { $or: [{ eventId }, { eventId: missingEventId, eventSlug: slug }] }
		: { eventId };
}
export async function resolveRegistrationEvent(
	eventId?: string,
	slug?: string,
) {
	if (!eventId && !slug) throw new HttpError(400, "Event ID is required");
	await connectDb();
	const event = eventId
		? await Event.findById(eventId).lean()
		: await Event.findOne({ slug }).lean();
	return {
		eventId: eventId || event?._id || historicalEventId(slug || ""),
		slug: event?.slug || slug,
	};
}
