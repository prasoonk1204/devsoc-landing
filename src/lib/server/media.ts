import { createHmac, randomBytes, randomUUID } from "node:crypto";
import ImageKit from "imagekit";
import { z } from "zod";
import { connectDb } from "./db.ts";
import { UploadTicket, Media, models, contentData, Payment } from "./models.ts";
import {
	identifier,
	imageReferences,
	type ContentKind,
} from "../content-schemas.ts";
import {
	mediaLocation,
	mediaName,
	checksum,
	detectImageType,
	originalImageUrl,
} from "../media-naming.ts";
import { hashToken } from "./auth.ts";
import { HttpError } from "./http.ts";

let imagekit: ImageKit;
export function getImagekit() {
	if (!imagekit) {
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
		const publicKey =
			process.env.IMAGEKIT_PUBLIC_KEY ||
			process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
		const urlEndpoint =
			process.env.IMAGEKIT_URL_ENDPOINT ||
			process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
		if (!privateKey || !publicKey || !urlEndpoint)
			throw new HttpError(503, "Image uploads are not configured");
		imagekit = new ImageKit({ privateKey, publicKey, urlEndpoint });
	}
	return imagekit;
}
export const uploadInput = z
	.object({
		ownerKind: z.enum([
			"events",
			"newsletters",
			"members",
			"settings",
			"registrations",
		]),
		ownerId: identifier,
		slot: z.string(),
		name: z.string().min(1).max(200),
		size: z
			.number()
			.int()
			.positive()
			.max(10 * 1024 * 1024),
		type: z.enum(["image/jpeg", "image/png", "image/webp"]),
	})
	.strict();
export async function prepareUpload(input: unknown) {
	const value = uploadInput.parse(input);
	if (value.ownerKind === "registrations" && value.size > 5 * 1024 * 1024)
		throw new HttpError(400, "Payment screenshot must be at most 5 MB");
	getImagekit();
	await connectDb();
	const folder = mediaLocation(value.ownerKind, value.ownerId, value.slot);
	const fileName = mediaName(value.name, value.type);
	const id = randomUUID();
	const capability = randomBytes(32).toString("hex");
	const isPrivateFile = value.ownerKind === "registrations";
	await UploadTicket.create({
		_id: id,
		ownerKind: value.ownerKind,
		ownerId: value.ownerId,
		slot: value.slot,
		folder,
		fileName,
		expectedSize: value.size,
		expectedType: value.type,
		private: isPrivateFile,
		tokenHash: hashToken(capability),
		expiresAt: new Date(Date.now() + 60 * 60 * 1000),
	});
	const fields = {
		fileName,
		folder,
		useUniqueFileName: "false",
		overwriteFile: "false",
		isPrivateFile: String(isPrivateFile),
		checks: `"file.size" < "${isPrivateFile ? 6 : 11}mb"`,
	};
	const header = Buffer.from(
		JSON.stringify({
			alg: "HS256",
			typ: "JWT",
			kid:
				process.env.IMAGEKIT_PUBLIC_KEY ||
				process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
		}),
	).toString("base64url");
	const now = Math.floor(Date.now() / 1000);
	const payload = Buffer.from(
		JSON.stringify({ ...fields, iat: now, exp: now + 300 }),
	).toString("base64url");
	const signature = createHmac("sha256", process.env.IMAGEKIT_PRIVATE_KEY!)
		.update(`${header}.${payload}`)
		.digest("base64url");
	return {
		ticketId: id,
		uploadToken: capability,
		ownerId: value.ownerId,
		endpoint: "https://upload.imagekit.io/api/v2/files/upload",
		fields: { ...fields, token: `${header}.${payload}.${signature}` },
	};
}
export function assertImagekitUrl(value: string) {
	const endpoint = new URL(
		process.env.IMAGEKIT_URL_ENDPOINT ||
			process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
	);
	const url = new URL(value);
	if (
		url.protocol !== "https:" ||
		url.origin !== endpoint.origin ||
		!url.pathname.startsWith(endpoint.pathname.replace(/\/$/, "") + "/")
	)
		throw new HttpError(400, "Unexpected image URL");
	return value;
}
export async function downloadImage(url: string, maxSize = 10 * 1024 * 1024) {
	const response = await fetch(url, {
		redirect: "error",
		signal: AbortSignal.timeout(30000),
		cache: "no-store",
	});
	if (!response.ok || !response.body)
		throw new HttpError(400, "Could not verify uploaded image");
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.length;
		if (size > maxSize) {
			await reader.cancel();
			throw new HttpError(400, "Image exceeds allowed size");
		}
		chunks.push(value);
	}
	return Buffer.concat(chunks);
}
export async function finishUpload(
	ticketId: string,
	capability: string,
	fileId: string,
) {
	identifier.parse(ticketId);
	if (typeof fileId !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(fileId))
		throw new HttpError(400, "Invalid ImageKit file ID");
	await connectDb();
	const ticket = (await UploadTicket.findOne({
		_id: ticketId,
		tokenHash: hashToken(capability),
		expiresAt: { $gt: new Date() },
	}).lean()) as any;
	if (!ticket)
		throw new HttpError(403, "Upload authorization expired or invalid");
	if (ticket.completedMediaId) {
		const media = (await Media.findById(ticket.completedMediaId).lean()) as any;
		if (media?.fileId !== fileId)
			throw new HttpError(409, "Upload already completed");
		return contentData(media);
	}
	const details = await getImagekit().getFileDetails(fileId);
	if (
		details.filePath !== `${ticket.folder}/${ticket.fileName}` ||
		details.size !== ticket.expectedSize ||
		details.fileType !== "image" ||
		Boolean(details.isPrivateFile) !== ticket.private
	)
		throw new HttpError(400, "Uploaded file does not match authorized image");
	assertImagekitUrl(details.url);
	await UploadTicket.updateOne(
		{ _id: ticketId },
		{ $set: { claimedFileId: fileId } },
	);
	const verificationUrl = ticket.private
		? getImagekit().url({
				path: details.filePath,
				signed: true,
				expireSeconds: 60,
				transformation: [{ original: true }],
				transformationPosition: "query",
			})
		: originalImageUrl(details.url);
	const buffer = await downloadImage(verificationUrl);
	if (
		buffer.length !== ticket.expectedSize ||
		detectImageType(buffer) !== ticket.expectedType
	)
		throw new HttpError(400, "Image contents do not match selected file type");
	const media = {
		_id: ticket._id,
		ownerKind: ticket.ownerKind,
		ownerId: ticket.ownerId,
		slot: ticket.slot,
		url: details.url,
		fileId,
		filePath: details.filePath,
		name: details.name,
		width: details.width,
		height: details.height,
		size: details.size,
		mimeType: ticket.expectedType,
		private: ticket.private,
		checksum: checksum(buffer),
		alt: "",
	};
	await Media.updateOne(
		{ _id: media._id },
		{ $setOnInsert: media },
		{ upsert: true, runValidators: true },
	);
	await UploadTicket.updateOne(
		{ _id: ticketId },
		{ $set: { completedMediaId: media._id, claimedFileId: fileId } },
	);
	return media;
}
export async function authorizeRegistrationMedia(
	mediaId: string,
	ownerId: string,
	capability: string,
) {
	await connectDb();
	if (
		!(await UploadTicket.exists({
			completedMediaId: mediaId,
			ownerKind: "registrations",
			ownerId,
			tokenHash: hashToken(capability),
			expiresAt: { $gt: new Date() },
		}))
	)
		throw new HttpError(403, "Payment upload authorization is invalid");
}
export async function mediaReferences(url: string) {
	for (const kind of Object.keys(models) as ContentKind[]) {
		for (const record of await models[kind].find().lean())
			if (imageReferences(kind, contentData(record)).includes(url)) return true;
	}
	return Boolean(await Payment.exists({ paymentScreenshotUrl: url }));
}
export async function deleteUnusedMedia(id: string) {
	await connectDb();
	const media = (await Media.findById(id).lean()) as any;
	if (!media) throw new HttpError(404, "Image not found");
	if (await mediaReferences(media.url))
		throw new HttpError(409, "Image is still used by content or a payment");
	await getImagekit().deleteFile(media.fileId);
	await Media.deleteOne({ _id: id });
}
