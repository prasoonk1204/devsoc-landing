import { z } from "zod";

export const identifier = z.string().regex(/^[a-zA-Z0-9-]{1,80}$/);
const text = z.string().trim().max(200);
const requiredText = text.min(1);
export const webUrl = z
	.string()
	.url()
	.max(2048)
	.refine((value) => {
		try {
			return new URL(value).protocol === "https:";
		} catch {
			return false;
		}
	}, "Use an HTTPS URL");
const optionalUrl = z.union([webUrl, z.literal("")]).default("");
const image = optionalUrl;
const slug = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,119}$/);
const date = z
	.string()
	.refine(
		(value) =>
			value === "TBD" ||
			(/^\d{4}-\d{2}-\d{2}$/.test(value) &&
				!Number.isNaN(Date.parse(value)) &&
				new Date(value).toISOString().slice(0, 10) === value),
		"Use YYYY-MM-DD or TBD",
	);
const timelineItem = z
	.object({
		time: text,
		date: text.optional(),
		title: requiredText,
		description: z.string().max(5000),
		subEvents: z
			.array(
				z
					.object({
						time: text,
						title: requiredText,
						description: z.string().max(5000),
					})
					.strict(),
			)
			.max(100)
			.default([]),
	})
	.strict();
const challenge = z
	.object({
		trackId: requiredText,
		trackName: requiredText,
		challengeNumber: z.number().int().nonnegative(),
		slug,
		name: requiredText,
		problemStatement: z.string().max(20000),
		keyDeliverable: z.string().max(10000),
		constraint: z.string().max(10000),
	})
	.strict();
export const paymentSchema = z
	.object({
		amount: z.number().finite().positive().max(100000),
		upiId: requiredText,
		qrCodeUrl: webUrl,
	})
	.strict();
export const eventSchema = z
	.object({
		_id: identifier,
		slug,
		title: requiredText,
		date,
		timezone: z
			.string()
			.refine((value) => {
				try {
					new Intl.DateTimeFormat("en", { timeZone: value });
					return true;
				} catch {
					return false;
				}
			}, "Invalid timezone")
			.default("Asia/Kolkata"),
		startsAt: text.default(""),
		endsAt: text.default(""),
		location: text.default(""),
		description: z.string().trim().min(1).max(5000),
		detailedDescription: z.string().max(100000).default(""),
		image,
		gallery: z.array(webUrl).max(300).default([]),
		timeline: z.array(timelineItem).max(100).default([]),
		challenges: z.array(challenge).max(100).default([]),
		published: z.boolean().default(false),
		registrationMode: z
			.enum(["closed", "internal", "external"])
			.default("closed"),
		externalRegistrationUrl: optionalUrl,
		payment: paymentSchema.nullable().default(null),
		showSnaps: z.boolean().default(true),
		showProblemStatements: z.boolean().default(false),
		problemStatementsUnlocked: z.boolean().default(false),
		feedbackEnabled: z.boolean().default(false),
	})
	.strict()
	.superRefine((value, ctx) => {
		if (value.registrationMode === "external" && !value.externalRegistrationUrl)
			ctx.addIssue({
				code: "custom",
				path: ["externalRegistrationUrl"],
				message: "External registration URL is required",
			});
		if (value.registrationMode === "internal" && !value.payment)
			ctx.addIssue({
				code: "custom",
				path: ["payment"],
				message: "Payment settings are required for internal registration",
			});
		if (value.published && !value.image)
			ctx.addIssue({
				code: "custom",
				path: ["image"],
				message: "Upload a banner before publishing",
			});
	});
export const newsletterSchema = z
	.object({
		_id: identifier,
		slug,
		title: requiredText,
		author: requiredText,
		date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
		cover: image,
		images: z.array(webUrl).max(200),
		published: z.boolean().default(false),
	})
	.strict()
	.superRefine((value, ctx) => {
		if (value.published && (!value.cover || value.images.length === 0))
			ctx.addIssue({
				code: "custom",
				path: ["cover"],
				message:
					"Published newsletters need a banner and at least one inside page",
			});
	});
export const memberSchema = z
	.object({
		_id: identifier,
		name: requiredText,
		designation: requiredText,
		group: z.enum([
			"teacherCoordinators",
			"coreCommittee",
			"techTeam",
			"designTeam",
			"managementTeam",
		]),
		image,
		socials: z
			.object({
				github: optionalUrl,
				linkedin: optionalUrl,
				twitter: optionalUrl,
				instagram: optionalUrl,
				website: optionalUrl,
				email: z.union([z.string().email(), z.literal("")]).default(""),
			})
			.strict()
			.default({}),
		order: z.number().int().nonnegative().default(0),
		active: z.boolean().default(true),
	})
	.strict()
	.superRefine((value, ctx) => {
		if (value.active && !value.image)
			ctx.addIssue({
				code: "custom",
				path: ["image"],
				message: "Upload a photo before making this member visible",
			});
	});
export const siteSchema = z
	.object({
		_id: z.literal("site"),
		whatsapp: optionalUrl,
		discord: optionalUrl,
		logo: optionalUrl,
		background: optionalUrl,
		hero: optionalUrl,
		ogImage: optionalUrl,
		gallery: z
			.array(z.object({ title: requiredText, image: webUrl }).strict())
			.max(100)
			.default([]),
		maintenance: z.boolean().default(false),
		eventOnlySlug: z.union([slug, z.literal("")]).default(""),
	})
	.strict();
export const schemas = {
	events: eventSchema,
	newsletters: newsletterSchema,
	members: memberSchema,
	settings: siteSchema,
};
export type ContentKind = keyof typeof schemas;
export function publicEvent(event: any) {
	const { challenges, ...rest } = event;
	return {
		...rest,
		challenges:
			event.showProblemStatements && event.problemStatementsUnlocked
				? challenges
				: [],
	};
}

export function imageReferences(kind: ContentKind, record: any): string[] {
	if (kind === "events")
		return [
			record.image,
			...record.gallery,
			record.payment?.qrCodeUrl,
			...Array.from(
				record.detailedDescription.matchAll(
					/!\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g,
				),
				(match: any) => match[1],
			),
			...Array.from(
				record.detailedDescription.matchAll(
					/https:\/\/ik\.imagekit\.io\/[^\s)"<>]+/g,
				),
				(match: any) => match[0],
			),
		].filter(Boolean);
	if (kind === "newsletters")
		return [record.cover, ...record.images].filter(Boolean);
	if (kind === "members") return [record.image].filter(Boolean);
	return [
		record.logo,
		record.background,
		record.hero,
		record.ogImage,
		...record.gallery.map((item: any) => item.image),
	].filter(Boolean);
}
