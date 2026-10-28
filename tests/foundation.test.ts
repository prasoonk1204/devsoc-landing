import test from "node:test";
import assert from "node:assert/strict";
import {
	eventSchema,
	newsletterSchema,
	memberSchema,
	siteSchema,
	publicEvent,
} from "../src/lib/content-schemas.ts";
import {
	mediaLocation,
	mediaName,
	detectImageType,
	originalImageUrl,
} from "../src/lib/media-naming.ts";

const event = {
	_id: "test-event",
	slug: "event",
	title: "Event",
	date: "2026-10-28",
	description: "Example",
	image: "https://ik.imagekit.io/demo/a.jpg",
};
test("website images can be detached while URL validation remains enforced", () => {
	const site = siteSchema.parse({
		_id: "site",
		logo: "",
		background: "",
		hero: "",
		ogImage: "",
	});
	assert.equal(site.logo, "");
	assert.deepEqual(site.gallery, []);
	assert.throws(() =>
		siteSchema.parse({ ...site, logo: "javascript:alert(1)" }),
	);
	assert.throws(() =>
		siteSchema.parse({ ...site, gallery: [{ title: "Gallery", image: "" }] }),
	);
});
test("event defaults close registration and hide unpublished content", () => {
	const result = eventSchema.parse(event);
	assert.equal(result.registrationMode, "closed");
	assert.equal(result.published, false);
	assert.throws(() =>
		eventSchema.parse({ ...event, registrationMode: "internal" }),
	);
	assert.throws(() =>
		eventSchema.parse({
			...event,
			registrationMode: "external",
			externalRegistrationUrl: "javascript:alert(1)",
		}),
	);
	assert.throws(() => eventSchema.parse({ ...event, timezone: "bad-zone" }));
	assert.throws(() => eventSchema.parse({ ...event, date: "2026-02-31" }));
	assert.throws(() =>
		eventSchema.parse({ ...event, unknown: "discarding fields is unsafe" }),
	);
});
test("locked challenges are absent from public payloads", () => {
	const result = {
		...eventSchema.parse(event),
		showProblemStatements: true,
		challenges: [{ problemStatement: "secret" }],
	};
	assert.deepEqual(publicEvent(result).challenges, []);
	assert.equal(
		publicEvent({ ...result, problemStatementsUnlocked: true }).challenges[0]
			.problemStatement,
		"secret",
	);
});
test("newsletter preserves page order and validates date; member limits group and URLs", () => {
	const images = [
		"https://ik.imagekit.io/demo/b.jpg",
		"https://ik.imagekit.io/demo/a.jpg",
	];
	assert.deepEqual(
		newsletterSchema.parse({
			_id: "issue",
			slug: "issue",
			title: "Issue",
			author: "DevSoc",
			date: "2026-10",
			images,
		}).images,
		images,
	);
	assert.throws(() =>
		newsletterSchema.parse({
			_id: "issue",
			slug: "issue",
			title: "Issue",
			author: "DevSoc",
			date: "2026-13",
			images,
		}),
	);
	assert.throws(() =>
		memberSchema.parse({
			_id: "member",
			name: "Name",
			designation: "Lead",
			group: "superadmins",
		}),
	);
});
test("media uses stable owners and safe names; rejects traversal and unsupported files", () => {
	assert.equal(
		new URL(
			originalImageUrl("https://ik.imagekit.io/demo/a.jpg?tr=w-100"),
		).searchParams.get("tr"),
		"orig-true",
	);
	assert.equal(
		mediaLocation("events", "owner-id", "banner"),
		"/devsoc/events/owner-id/banner",
	);
	assert.equal(
		mediaLocation("settings", "site", "brand"),
		"/devsoc/website/brand",
	);
	assert.equal(
		mediaLocation("registrations", "user-id", "payment"),
		"/devsoc/private/registrations/user-id",
	);
	assert.throws(() => mediaLocation("events", "../escape", "banner"));
	assert.throws(() => mediaLocation("events", "owner", "../escape"));
	assert.equal(
		mediaName("My Banner.JPG", "image/jpeg", "unique"),
		"my-banner-unique.jpg",
	);
	assert.throws(() => mediaName("evil.svg", "image/svg+xml"));
	assert.equal(
		detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0])),
		"image/jpeg",
	);
	assert.throws(() =>
		detectImageType(Buffer.from("<script>not an image</script>")),
	);
});
