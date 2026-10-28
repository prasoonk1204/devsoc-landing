import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/server/db.ts";
import {
	ensureIndexes,
	Media,
	UploadTicket,
} from "../src/lib/server/models.ts";
import {
	prepareUpload,
	finishUpload,
	getImagekit,
	deleteUnusedMedia,
} from "../src/lib/server/media.ts";
import {
	saveContent,
	listContent,
	removeContent,
} from "../src/lib/server/content.ts";
import { newsletterSchema } from "../src/lib/content-schemas.ts";
import { hashPassword } from "../src/lib/server/auth.ts";
import { handleApi } from "../src/lib/server/api.ts";

const database = `devsoc_test_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
const originalFetch = globalThis.fetch;
const bytes = Buffer.from([0xff, 0xd8, 0xff, 0]);
let cookie = "";
before(async () => {
	Object.assign(process.env, {
		MONGODB_URI:
			process.env.TEST_MONGODB_URI ||
			"mongodb://127.0.0.1:27018/?replicaSet=devsoc-local",
		MONGODB_DB: database,
		APP_ORIGIN: "http://localhost:3000",
		IMAGEKIT_PRIVATE_KEY: "synthetic-private-key",
		IMAGEKIT_PUBLIC_KEY: "synthetic-public-key",
		IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/test",
	});
	process.env.ADMIN_PASSWORD_HASH = await hashPassword(
		"synthetic-admin-password",
	);
	await connectDb();
	await ensureIndexes();
	globalThis.fetch = async () => new Response(bytes);
	const response = await handleApi(
		new Request("http://localhost:3000/api/v1/auth/login", {
			method: "POST",
			headers: {
				origin: "http://localhost:3000",
				"content-type": "application/json",
			},
			body: JSON.stringify({ password: "synthetic-admin-password" }),
		}),
	);
	cookie = response.headers.get("set-cookie")!.split(";")[0];
});
after(async () => {
	globalThis.fetch = originalFetch;
	assert.match(database, /^devsoc_test_[a-f0-9]{24}$/);
	assert.equal(mongoose.connection.name, database);
	await mongoose.connection.dropDatabase();
	await mongoose.disconnect();
});
function details(prepared: any, overrides = {}) {
	return {
		fileId: "test-file",
		name: prepared.fields.fileName,
		url: `https://ik.imagekit.io/test${prepared.fields.folder}/${prepared.fields.fileName}`,
		filePath: `${prepared.fields.folder}/${prepared.fields.fileName}`,
		fileType: "image",
		size: bytes.length,
		width: 1,
		height: 1,
		isPrivateFile: false,
		...overrides,
	};
}
test("upload JWT binds folder, name, privacy, and no-overwrite policy", async () => {
	const prepared = await prepareUpload({
		ownerKind: "newsletters",
		ownerId: "issue",
		slot: "pages",
		name: "Page 1.jpg",
		size: bytes.length,
		type: "image/jpeg",
	});
	const [header, body, signature] = prepared.fields.token.split(".");
	assert.equal(
		JSON.parse(Buffer.from(header, "base64url").toString()).kid,
		"synthetic-public-key",
	);
	const claims = JSON.parse(Buffer.from(body, "base64url").toString());
	assert.equal(claims.folder, "/devsoc/newsletters/issue/pages");
	assert.equal(claims.overwriteFile, "false");
	assert.equal(claims.isPrivateFile, "false");
	const { iat, exp, ...signedFields } = claims;
	const { token, ...formFields } = prepared.fields;
	assert.deepEqual(signedFields, formFields);
	assert.ok(
		Object.values(signedFields).every((value) => typeof value === "string"),
	);
	assert.equal(typeof iat, "number");
	assert.equal(typeof exp, "number");
	assert.equal(
		signature,
		createHmac("sha256", "synthetic-private-key")
			.update(`${header}.${body}`)
			.digest("base64url"),
	);
	const privateUpload = await prepareUpload({
		ownerKind: "registrations",
		ownerId: "registration",
		slot: "payment",
		name: "proof.jpg",
		size: bytes.length,
		type: "image/jpeg",
	});
	assert.equal(privateUpload.fields.isPrivateFile, "true");
	await assert.rejects(
		prepareUpload({
			ownerKind: "events",
			ownerId: "../escape",
			slot: "banner",
			name: "a.jpg",
			size: 4,
			type: "image/jpeg",
		}),
	);
});
test("verification rejects forged capability, wrong destination, and wrong bytes", async () => {
	const prepared = await prepareUpload({
		ownerKind: "events",
		ownerId: "event",
		slot: "banner",
		name: "Banner.jpg",
		size: bytes.length,
		type: "image/jpeg",
	});
	(getImagekit() as any).getFileDetails = async () =>
		details(prepared, { filePath: "/wrong/image.jpg" });
	await assert.rejects(
		finishUpload(prepared.ticketId, "wrong", "file"),
		/authorization/,
	);
	await assert.rejects(
		finishUpload(prepared.ticketId, prepared.uploadToken, "../../files"),
		/Invalid ImageKit file ID/,
	);
	await assert.rejects(
		finishUpload(prepared.ticketId, prepared.uploadToken, "file"),
		/does not match/,
	);
	(getImagekit() as any).getFileDetails = async () => details(prepared);
	globalThis.fetch = async () => new Response("bad!");
	await assert.rejects(
		finishUpload(prepared.ticketId, prepared.uploadToken, "file"),
		/supported image/,
	);
	assert.equal(await Media.countDocuments(), 0);
	globalThis.fetch = async () => new Response(bytes);
});
test("verified uploads support newsletter ordering and replay without duplicate media", async () => {
	const prepared = await prepareUpload({
		ownerKind: "newsletters",
		ownerId: "issue",
		slot: "pages",
		name: "Page 1.jpg",
		size: bytes.length,
		type: "image/jpeg",
	});
	(getImagekit() as any).getFileDetails = async () => details(prepared);
	const media = await finishUpload(
		prepared.ticketId,
		prepared.uploadToken,
		"test-file",
	);
	assert.equal(
		(await finishUpload(prepared.ticketId, prepared.uploadToken, "test-file"))
			._id,
		media._id,
	);
	await assert.rejects(
		finishUpload(prepared.ticketId, prepared.uploadToken, "different-file"),
		/already completed/,
	);
	await saveContent(
		"newsletters",
		newsletterSchema.parse({
			_id: "issue",
			slug: "issue",
			title: "Issue",
			author: "DevSoc",
			date: "2026-10",
			images: [media.url],
			cover: media.url,
			published: true,
		}),
	);
	assert.deepEqual((await listContent("newsletters"))[0].images, [media.url]);
	await assert.rejects(
		saveContent(
			"newsletters",
			newsletterSchema.parse({
				_id: "other-owner",
				slug: "other",
				title: "Other",
				author: "DevSoc",
				date: "2026-10",
				images: [media.url],
			}),
		),
		/media uploader/,
	);
	await assert.rejects(deleteUnusedMedia(media._id), /still used/);
	await removeContent("newsletters", "issue");
	(getImagekit() as any).deleteFile = async () => ({});
	await deleteUnusedMedia(media._id);
	assert.equal(await Media.exists({ _id: media._id }), null);
});
test("admin content API validates fields and handles create, update, unpublish, delete", async () => {
	const path = "http://localhost:3000/api/v1/admin/content/members/member";
	const call = (method: string, body?: unknown, authenticated = true) =>
		handleApi(
			new Request(path, {
				method,
				headers: {
					origin: "http://localhost:3000",
					"content-type": "application/json",
					...(authenticated ? { cookie } : {}),
				},
				...(body === undefined ? {} : { body: JSON.stringify(body) }),
			}),
		);
	assert.equal((await call("PUT", { _id: "member" }, false)).status, 401);
	const member = {
		_id: "member",
		name: "Member",
		designation: "Lead",
		group: "techTeam",
		order: 1,
		active: false,
	};
	assert.equal((await call("PUT", member)).status, 200);
	assert.equal(
		(await call("PUT", { ...member, group: "invalid" })).status,
		400,
	);
	assert.equal((await call("PUT", { ...member, active: false })).status, 200);
	assert.equal((await listContent("members")).length, 0);
	assert.equal((await call("DELETE")).status, 200);
	assert.equal((await call("GET")).status, 404);
});
test("private upload verification signs original-byte delivery before reading the screenshot", async () => {
	const prepared = await prepareUpload({
		ownerKind: "registrations",
		ownerId: "private-registration",
		slot: "payment",
		name: "proof.jpg",
		size: bytes.length,
		type: "image/jpeg",
	});
	(getImagekit() as any).getFileDetails = async () =>
		details(prepared, { fileId: "private-original", isPrivateFile: true });
	let verificationUrl = "";
	globalThis.fetch = async (url) => {
		verificationUrl = String(url);
		return new Response(bytes);
	};
	const media = await finishUpload(
		prepared.ticketId,
		prepared.uploadToken,
		"private-original",
	);
	assert.equal(media.private, true);
	assert.equal(new URL(verificationUrl).searchParams.get("tr"), "orig-true");
	assert.ok(new URL(verificationUrl).searchParams.has("ik-s"));
});
