import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/server/db.ts";
import {
	AdminSession,
	RateLimit,
	Event,
	Media,
	Registration,
	Payment,
	Setting,
	ensureIndexes,
} from "../src/lib/server/models.ts";
import {
	hashPassword,
	verifyPassword,
	hashToken,
	sessionCookie,
} from "../src/lib/server/auth.ts";
import { handleApi } from "../src/lib/server/api.ts";
import { completeRegistration } from "../src/lib/server/registrations.ts";
import { eventSchema } from "../src/lib/content-schemas.ts";

const database = `devsoc_test_${randomUUID().replaceAll("-", "")}`;
const password = "synthetic-admin-password-only";
let cookie = "";
function request(
	path: string,
	method = "GET",
	body?: unknown,
	headers: Record<string, string> = {},
) {
	return new Request(`http://localhost:3000/api/v1/${path}`, {
		method,
		headers: {
			origin: "http://localhost:3000",
			"content-type": "application/json",
			...(cookie ? { cookie } : {}),
			...headers,
		},
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
	});
}
before(async () => {
	process.env.MONGODB_URI =
		"mongodb://127.0.0.1:27018/?replicaSet=devsoc-local";
	process.env.MONGODB_DB = database;
	process.env.ADMIN_PASSWORD_HASH = await hashPassword(password);
	process.env.APP_ORIGIN = "http://localhost:3000";
	await connectDb();
	await ensureIndexes();
	await Setting.create({ _id: "site", maintenance: false, eventOnlySlug: "" });
});
after(async () => {
	assert.match(database, /^devsoc_test_[a-f0-9]{32}$/);
	assert.equal(mongoose.connection.name, database);
	await mongoose.connection.dropDatabase();
	await mongoose.disconnect();
});
test("password hashes verify without accepting malformed or incorrect values", async () => {
	assert.equal(
		await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!),
		true,
	);
	assert.equal(
		await verifyPassword("wrong", process.env.ADMIN_PASSWORD_HASH!),
		false,
	);
	assert.equal(await verifyPassword(password, "bad"), false);
});
test("anonymous and header-secret access cannot read or mutate protected APIs", async () => {
	for (const path of [
		"admin/content/events",
		"admin/content/newsletters",
		"admin/content/members",
		"admin/payments/pending",
		"registrations/event",
		"registrations/user",
		"settings",
	])
		assert.equal(
			(
				await handleApi(
					request(path, "GET", undefined, { "x-admin-secret": "legacy" }),
				)
			).status,
			401,
			path,
		);
	assert.equal(
		(await handleApi(request("admin/content/events/a", "PUT", { _id: "a" })))
			.status,
		401,
	);
});
test("cross-origin login rejected; valid login creates hashed HttpOnly session", async () => {
	assert.equal(
		(
			await handleApi(
				request(
					"auth/login",
					"POST",
					{ password },
					{ origin: "https://evil.example" },
				),
			)
		).status,
		403,
	);
	assert.equal(
		(await handleApi(request("auth/login", "POST", { password: "wrong" })))
			.status,
		401,
	);
	const response = await handleApi(request("auth/login", "POST", { password }));
	assert.equal(response.status, 200);
	cookie = response.headers.get("set-cookie")!.split(";")[0];
	assert.match(response.headers.get("set-cookie")!, /HttpOnly/);
	assert.match(response.headers.get("set-cookie")!, /SameSite=Lax/);
	const token = cookie.split("=")[1];
	assert.ok(await AdminSession.exists({ tokenHash: hashToken(token) }));
	assert.equal(await AdminSession.exists({ tokenHash: token }), null);
	assert.equal((await handleApi(request("admin/content/events"))).status, 200);
	assert.equal(
		(
			await handleApi(
				request(
					"admin/content/events/a",
					"PUT",
					{},
					{ origin: "https://evil.example" },
				),
			)
		).status,
		403,
	);
	assert.equal(
		(
			await handleApi(
				request("admin/content/events", "GET", undefined, {
					cookie: `devsoc-admin=${"a".repeat(64)}`,
				}),
			)
		).status,
		401,
	);
});
test("expired, password-rotated, and logged-out sessions fail closed", async () => {
	await AdminSession.updateMany(
		{},
		{ $set: { expiresAt: new Date(Date.now() - 1) } },
	);
	assert.equal((await handleApi(request("admin/content/events"))).status, 401);
	await RateLimit.deleteMany({});
	let response = await handleApi(request("auth/login", "POST", { password }));
	cookie = response.headers.get("set-cookie")!.split(";")[0];
	const previous = process.env.ADMIN_PASSWORD_HASH;
	process.env.ADMIN_PASSWORD_HASH = await hashPassword(
		"another-synthetic-password",
	);
	assert.equal((await handleApi(request("admin/content/events"))).status, 401);
	process.env.ADMIN_PASSWORD_HASH = previous;
	assert.equal(
		(await handleApi(request("auth/logout", "POST", {}))).status,
		200,
	);
	assert.equal((await handleApi(request("admin/content/events"))).status, 401);
	Object.assign(process.env, { NODE_ENV: "production" });
	assert.match(sessionCookie("example"), /__Host-devsoc-admin=.*; Secure/);
	Object.assign(process.env, { NODE_ENV: "test" });
	cookie = "";
});
test("login throttling persists in MongoDB", async () => {
	await RateLimit.deleteMany({});
	for (let attempt = 0; attempt < 5; attempt++)
		assert.equal(
			(await handleApi(request("auth/login", "POST", { password: "wrong" })))
				.status,
			401,
		);
	assert.equal(
		(await handleApi(request("auth/login", "POST", { password }))).status,
		429,
	);
});
test("registration transactions prevent duplicates and derive price/title from database", async () => {
	const event = eventSchema.parse({
		_id: "registered-event",
		slug: "registered-event",
		title: "Real title",
		date: "2026-10-28",
		description: "Test",
		image: "https://ik.imagekit.io/demo/event.png",
		published: true,
		registrationMode: "internal",
		payment: {
			amount: 125,
			upiId: "demo@upi",
			qrCodeUrl: "https://ik.imagekit.io/demo/qr.png",
		},
	});
	await Event.create(event);
	for (const id of ["one", "two"])
		await Media.create({
			_id: id,
			fileId: id,
			url: `https://ik.imagekit.io/test/${id}`,
			ownerKind: "registrations",
			ownerId: id,
			private: true,
		});
	const registration = {
		name: "Test Person",
		roll: "CSE123",
		phone: "9876543210",
		email: " TEST@example.com ",
		department: "CSE",
		year: "1st Year",
		questions: "N/A",
		transactionId: "TX12345",
		eventSlug: event.slug,
	};
	const results = await Promise.allSettled([
		completeRegistration(registration, "one", "one"),
		completeRegistration(registration, "two", "two"),
	]);
	assert.equal(
		results.filter((result) => result.status === "fulfilled").length,
		1,
	);
	assert.equal(await Registration.countDocuments({ eventSlug: event.slug }), 1);
	assert.equal(await Payment.countDocuments({ eventSlug: event.slug }), 1);
	const payment = (await Payment.findOne({
		eventSlug: event.slug,
	}).lean()) as any;
	assert.equal(payment.amount, 125);
	assert.equal(payment.eventTitle, "Real title");
	await assert.rejects(
		completeRegistration({ ...registration, amount: 1 }, "two", "two"),
	);
	await Event.updateOne(
		{ _id: event._id },
		{ $set: { registrationMode: "closed" } },
	);
	await assert.rejects(
		completeRegistration(registration, "two", "two"),
		/Registration is closed/,
	);
});
