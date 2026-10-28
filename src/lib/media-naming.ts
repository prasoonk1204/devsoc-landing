import { createHash, randomUUID } from "node:crypto";
import { identifier } from "./content-schemas.ts";

export const mediaSlots: Record<string, string[]> = {
	events: ["banner", "gallery", "about", "payment-qr"],
	newsletters: ["banner", "pages"],
	members: ["photo"],
	settings: ["brand", "hero", "gallery"],
	registrations: ["payment"],
};
export function mediaLocation(kind: string, ownerId: string, slot: string) {
	identifier.parse(ownerId);
	if (!mediaSlots[kind]?.includes(slot))
		throw new Error("Invalid media destination");
	if (kind === "settings" && ownerId !== "site")
		throw new Error("Invalid website media owner");
	if (kind === "registrations")
		return `/devsoc/private/registrations/${ownerId}`;
	if (kind === "settings") return `/devsoc/website/${slot}`;
	if (kind === "members") return `/devsoc/members/${ownerId}`;
	return `/devsoc/${kind}/${ownerId}/${slot}`;
}
export const imageExtensions: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};
export function mediaName(
	name: string,
	mimeType: string,
	uniqueId: string = randomUUID(),
) {
	const extension = imageExtensions[mimeType];
	if (!extension)
		throw new Error("Only JPEG, PNG, and WebP images are allowed");
	identifier.parse(uniqueId);
	const base =
		name
			.replace(/\.[^.]+$/, "")
			.normalize("NFKD")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 70) || "image";
	return `${base}-${uniqueId}.${extension}`;
}
export const checksum = (data: Uint8Array | string) =>
	createHash("sha256").update(data).digest("hex");
export function originalImageUrl(value: string) {
	const url = new URL(value);
	url.searchParams.set("tr", "orig-true");
	return url.toString();
}
export function detectImageType(buffer: Uint8Array) {
	const bytes = Buffer.from(buffer);
	if (
		bytes.length >= 3 &&
		bytes[0] === 0xff &&
		bytes[1] === 0xd8 &&
		bytes[2] === 0xff
	)
		return "image/jpeg";
	if (
		bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
	)
		return "image/png";
	if (
		bytes.toString("ascii", 0, 4) === "RIFF" &&
		bytes.toString("ascii", 8, 12) === "WEBP"
	)
		return "image/webp";
	throw new Error("File contents are not a supported image");
}
