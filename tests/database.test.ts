import { eventSchema } from "../src/lib/content-schemas.ts";
import { initializeDatabase } from "../scripts/init-db.ts";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/server/db.ts";
import {
	Event,
	Registration,
	Payment,
	Setting,
} from "../src/lib/server/models.ts";
import {
	listContent,
	saveContent,
	getEventForRegistration,
	getSite,
	removeContent,
} from "../src/lib/server/content.ts";

const database = `devsoc_test_${randomUUID().replaceAll("-", "")}`;
before(async () => {
	process.env.MONGODB_URI =
		"mongodb://127.0.0.1:27018/?replicaSet=devsoc-local";
	process.env.MONGODB_DB = database;
	await connectDb();
	await initializeDatabase();
	assert.ok(await Setting.exists({ _id: "site" }));
	await Event.create(
		["first", "second"].map((_id) =>
			eventSchema.parse({
				_id,
				slug: _id,
				title: _id,
				date: "2026-10-28",
				description: "Synthetic event",
				image: "https://ik.imagekit.io/test/banner.jpg",
				published: true,
			}),
		),
	);
	await Setting.updateOne(
		{ _id: "site" },
		{
			$set: {
				whatsapp: "",
				discord: "",
				logo: "https://ik.imagekit.io/test/logo.jpg",
				background: "https://ik.imagekit.io/test/background.jpg",
				hero: "https://ik.imagekit.io/test/hero.jpg",
				ogImage: "https://ik.imagekit.io/test/og.jpg",
				gallery: [],
				maintenance: false,
				eventOnlySlug: "",
			},
		},
	);
});
after(async () => {
	assert.match(database, /^devsoc_test_[a-f0-9]{32}$/);
	assert.equal(mongoose.connection.name, database);
	await mongoose.connection.dropDatabase();
	await mongoose.disconnect();
});
test("database indexes reject concurrent duplicate registrations and transactions", async () => {
	const data = { email: "test@example.com", eventSlug: "event" };
	const writes = await Promise.allSettled([
		Registration.create({ _id: "a", ...data }),
		Registration.create({ _id: "b", ...data }),
	]);
	assert.equal(
		writes.filter((result) => result.status === "fulfilled").length,
		1,
	);
	await Payment.create({
		_id: "p1",
		userId: "a",
		transactionId: "TX123",
		transactionKey: "TX123",
		status: "pending",
	});
	await assert.rejects(
		Payment.create({
			_id: "p2",
			userId: "b",
			transactionId: "TX123",
			transactionKey: "TX123",
			status: "pending",
		}),
		{ code: 11000 },
	);
});

test("database initialization preserves configured website content", async () => {
	const site = await getSite();
	await initializeDatabase();
	assert.deepEqual(await getSite(), site);
	assert.equal(await Setting.countDocuments(), 1);
	assert.equal(await Event.countDocuments(), 2);
});
test("unpublished records stay private and new image URLs require managed uploads", async () => {
	const event = (await listContent("events", true))[0];
	await saveContent("events", { ...event, published: false });
	assert.equal(
		(await listContent("events")).some((entry) => entry._id === event._id),
		false,
	);
	await assert.rejects(
		saveContent("events", {
			...event,
			image: "https://example.com/unmanaged.png",
		}),
		/media uploader/,
	);
	assert.equal(await getEventForRegistration(event.slug), null);
});
test("event-only mode cannot point to missing events or lose its selected event", async () => {
	const site = await getSite();
	const event = (await listContent("events"))[0];
	await assert.rejects(
		saveContent("settings", { ...site, eventOnlySlug: "missing-event" }),
		/existing published event/,
	);
	await saveContent("settings", { ...site, eventOnlySlug: event.slug });
	await assert.rejects(
		saveContent("events", { ...event, published: false }),
		/event-only mode/,
	);
	await assert.rejects(removeContent("events", event._id), /event-only mode/);
	await saveContent("settings", { ...site, eventOnlySlug: "" });
	await assert.rejects(
		saveContent("events", {
			...event,
			detailedDescription: "![Unmanaged](https://example.com/a.png)",
		}),
		/media uploader/,
	);
});
