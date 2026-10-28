import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

import { connectDb } from "../src/lib/server/db.ts";
import {
	Event,
	Registration,
	Payment,
	Setting,
	Media,
	ensureIndexes,
	contentData,
} from "../src/lib/server/models.ts";
import { historicalEventId } from "../src/lib/server/event-links.ts";
import { eventSchema } from "../src/lib/content-schemas.ts";
import {
	completeRegistration,
	eventRegistrations,
} from "../src/lib/server/registrations.ts";
import {
	saveContent,
	removeContent,
	getEventForRegistration,
} from "../src/lib/server/content.ts";
import { handleApi } from "../src/lib/server/api.ts";
import { hashPassword } from "../src/lib/server/auth.ts";

const database = `devsoc_test_${randomUUID().replaceAll("-", "").slice(0, 24)}`;

let cookie: string;
before(async () => {
	process.env.MONGODB_URI =
		process.env.TEST_MONGODB_URI ||
		"mongodb://127.0.0.1:27018/?replicaSet=devsoc-local";
	process.env.MONGODB_DB = database;
	process.env.APP_ORIGIN = "http://localhost:3000";
	process.env.ADMIN_PASSWORD_HASH = await hashPassword(
		"synthetic-event-links-password",
	);
	await connectDb();
	await ensureIndexes();
	await Setting.create({ _id: "site", maintenance: false, eventOnlySlug: "" });
	await Event.create(
		eventSchema.parse({
			_id: "fixed-event-id",
			slug: "original-url",
			title: "Original title",
			date: "TBD",
			description: "Synthetic event",
			image: "https://ik.imagekit.io/test/banner.jpg",
			published: true,
			registrationMode: "internal",
			payment: {
				amount: 50,
				upiId: "test@upi",
				qrCodeUrl: "https://ik.imagekit.io/test/qr.jpg",
			},
		}),
	);
	await Registration.insertMany([
		{
			_id: "original",
			eventId: "fixed-event-id",
			email: "shared@example.com",
			eventSlug: "original-url",
			eventTitle: "Original title",
			paymentId: "payment-original",
		},
		{
			_id: "history",
			eventId: historicalEventId("retired-url"),
			email: "history@example.com",
			eventSlug: "retired-url",
			eventTitle: "Historical event",
			paymentId: "payment-history",
		},
		{
			_id: "linked",
			email: "linked@example.com",
			eventId: "fixed-event-id",
			eventSlug: "older-url",
			eventTitle: "Older title",
			paymentId: "payment-linked",
		},
	]);
	await Payment.insertMany([
		{
			_id: "payment-original",
			eventId: "fixed-event-id",
			userId: "original",
			transactionId: "ORIGINAL",
			eventSlug: "original-url",
			eventTitle: "Original title",
			amount: 50,
			status: "pending",
		},
		{
			_id: "payment-history",
			eventId: historicalEventId("retired-url"),
			userId: "history",
			transactionId: "HISTORY",
			eventSlug: "retired-url",
			eventTitle: "Historical event",
			amount: 25,
			status: "verified",
		},
		{
			_id: "payment-linked",
			userId: "linked",
			transactionId: "LINKED",
			eventId: "fixed-event-id",
			eventSlug: "older-url",
			amount: 50,
			status: "rejected",
		},
	]);
	const login = await handleApi(
		request("auth/login", "POST", {
			password: "synthetic-event-links-password",
		}),
	);
	assert.equal(login.status, 200);
	cookie = login.headers.get("set-cookie")!.split(";")[0];
});
after(async () => {
	assert.match(database, /^devsoc_test_[a-f0-9]{24}$/);
	assert.equal(mongoose.connection.name, database);
	await mongoose.connection.dropDatabase();
	await mongoose.disconnect();
});
function request(path: string, method = "GET", body?: unknown) {
	return new Request(`http://localhost:3000/api/v1/${path}`, {
		method,
		headers: {
			cookie: cookie || "",
			origin: "http://localhost:3000",
			"content-type": "application/json",
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});
}

test("title and slug edits keep all existing registrations and payments under their event ID", async () => {
	const event = contentData(await Event.findById("fixed-event-id").lean());
	await saveContent("events", {
		...event,
		title: "Renamed title",
		slug: "renamed-url",
	});
	const overview = (
		await (await handleApi(request("admin/registrations/events"))).json()
	).data;
	const renamed = overview.find((entry: any) => entry._id === "fixed-event-id");
	assert.equal(renamed.title, "Renamed title");
	assert.equal(renamed.slug, "renamed-url");
	assert.equal(renamed.count, 2);
	const page = (
		await (
			await handleApi(
				request("admin/registrations?eventId=fixed-event-id&page=1"),
			)
		).json()
	).data;
	assert.equal(page.total, 2);
	assert.deepEqual(page.rows.map((row: any) => row.payment._id).sort(), [
		"payment-linked",
		"payment-original",
	]);
	assert.equal((await eventRegistrations("renamed-url")).length, 2);
	assert.equal(
		(await getEventForRegistration(undefined, "fixed-event-id")).slug,
		"renamed-url",
	);
	await assert.rejects(
		removeContent("events", "fixed-event-id"),
		/must be unpublished/,
	);
	const history = (
		await (
			await handleApi(
				request(
					`admin/registrations?eventId=${historicalEventId("retired-url")}`,
				),
			)
		).json()
	).data;
	assert.equal(history.total, 1);
	assert.equal(history.rows[0].payment.status, "verified");
});

async function register(
	id: string,
	eventId: string,
	email: string,
	eventSlug?: string,
) {
	await Media.create({
		_id: id,
		fileId: id,
		url: `https://ik.imagekit.io/test/${id}`,
		ownerKind: "registrations",
		ownerId: id,
		private: true,
	});
	return completeRegistration(
		{
			name: "Test Person",
			roll: "CSE123",
			phone: "9876543210",
			department: "CSE",
			year: "1st Year",
			questions: "None",
			transactionId: id.replaceAll("-", ""),
			email,
			eventId,
			...(eventSlug ? { eventSlug } : {}),
		},
		id,
		id,
	);
}
test("reused slugs never transfer old records or bypass email uniqueness; new writes use canonical ID", async () => {
	const event = contentData(await Event.findById("fixed-event-id").lean());
	await Event.create({
		...event,
		_id: "replacement-event-id",
		title: "Different event",
		slug: "original-url",
	});
	assert.equal((await eventRegistrations("original-url")).length, 0);
	await assert.rejects(
		register("duplicate-id", "fixed-event-id", "shared@example.com"),
		/already registered/,
	);
	await register(
		"fresh-id",
		"fixed-event-id",
		"fresh@example.com",
		"original-url",
	);
	const saved = await Registration.findById("fresh-id").lean();
	assert.equal(saved!.eventId, "fixed-event-id");
	assert.equal(saved!.eventSlug, "renamed-url");
	await register(
		"replacement-registration",
		"replacement-event-id",
		"shared@example.com",
	);
	assert.equal((await eventRegistrations("original-url")).length, 1);
	assert.equal((await eventRegistrations("renamed-url")).length, 3);
	const duplicate = await handleApi(
		request(
			"registrations/check?eventId=fixed-event-id&email=shared@example.com",
		),
	);
	assert.equal((await duplicate.json()).data.isRegistered, true);
	const payment = await Payment.findOne({ userId: "fresh-id" }).lean();
	assert.equal(payment!.eventId, "fixed-event-id");
	assert.equal(payment!.eventSlug, "renamed-url");
});
