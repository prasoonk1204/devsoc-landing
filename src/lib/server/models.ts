import mongoose, { Schema } from "mongoose";

const options = {
	timestamps: true,
	strict: "throw" as const,
	versionKey: false as const,
};
function model(
	name: string,
	fields: Record<string, any>,
	indexes: [Record<string, any>, Record<string, any>][] = [],
) {
	if (mongoose.models[name])
		return mongoose.models[name] as mongoose.Model<any>;
	const schema = new Schema(
		{ _id: { type: String, required: true }, ...fields },
		options,
	);
	for (const [keys, settings] of indexes) schema.index(keys, settings);
	return mongoose.model<any>(name, schema);
}
const string = { type: String, default: "" };
export const Event = model("Event", {
	slug: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	date: { type: String, required: true },
	timezone: string,
	startsAt: string,
	endsAt: string,
	location: string,
	description: { type: String, required: true },
	detailedDescription: string,
	image: string,
	gallery: [String],
	timeline: [Schema.Types.Mixed],
	challenges: [Schema.Types.Mixed],
	published: Boolean,
	registrationMode: { type: String, enum: ["closed", "internal", "external"] },
	externalRegistrationUrl: string,
	payment: Schema.Types.Mixed,
	showSnaps: Boolean,
	showProblemStatements: Boolean,
	problemStatementsUnlocked: Boolean,
	feedbackEnabled: Boolean,
});
export const Newsletter = model("Newsletter", {
	slug: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	author: String,
	date: String,
	cover: string,
	images: [String],
	published: Boolean,
});
export const Member = model("Member", {
	name: { type: String, required: true },
	designation: String,
	group: {
		type: String,
		enum: [
			"teacherCoordinators",
			"coreCommittee",
			"techTeam",
			"designTeam",
			"managementTeam",
		],
	},
	image: string,
	socials: Schema.Types.Mixed,
	order: Number,
	active: Boolean,
});
export const Setting = model("Setting", {
	whatsapp: string,
	discord: string,
	logo: string,
	background: string,
	hero: string,
	ogImage: string,
	gallery: [Schema.Types.Mixed],
	maintenance: Boolean,
	eventOnlySlug: string,
});
export const AdminSession = model(
	"AdminSession",
	{
		tokenHash: { type: String, required: true, unique: true },
		credentialVersion: { type: String, required: true },
		principal: { type: String, required: true },
		expiresAt: { type: Date, required: true },
	},
	[[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
);
export const RateLimit = model(
	"RateLimit",
	{
		count: { type: Number, required: true },
		expiresAt: { type: Date, required: true },
	},
	[[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
);
export const Media = model("Media", {
	ownerKind: String,
	ownerId: String,
	slot: String,
	url: { type: String, required: true, unique: true },
	fileId: { type: String, required: true, unique: true },
	filePath: String,
	name: String,
	width: Number,
	height: Number,
	size: Number,
	mimeType: String,
	alt: String,
	checksum: String,
	sourceFileId: String,
	sourceVersionId: String,
	verification: String,
	sourceUrl: String,
	private: { type: Boolean, default: false },
});
export const UploadTicket = model(
	"UploadTicket",
	{
		ownerKind: String,
		ownerId: String,
		slot: String,
		folder: String,
		fileName: String,
		expectedSize: Number,
		expectedType: String,
		private: Boolean,
		claimedFileId: String,
		completedMediaId: String,
		expiresAt: { type: Date, required: true },
		tokenHash: String,
	},
	[[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
);
export const Registration = model(
	"Registration",
	{
		name: String,
		roll: String,
		phone: String,
		email: { type: String, required: true },
		department: String,
		year: String,
		questions: String,
		eventSlug: { type: String, required: true },
		eventTitle: String,
		registeredAt: Number,
		paymentId: String,
		legacy: Schema.Types.Mixed,
	},
	[[{ email: 1, eventSlug: 1 }, { unique: true }]],
);
export const Payment = model(
	"Payment",
	{
		userId: { type: String, required: true },
		transactionId: { type: String, required: true, index: true },
		transactionKey: String,
		historicalDuplicate: { type: Boolean, default: false },
		receiptUnavailable: { type: Boolean, default: false },
		eventSlug: String,
		eventTitle: String,
		amount: Number,
		status: {
			type: String,
			enum: ["pending", "verified", "rejected"],
			required: true,
		},
		paymentScreenshotUrl: String,
		paymentScreenshotStorageId: String,
		verifiedAt: Number,
		verifiedBy: String,
		legacy: Schema.Types.Mixed,
		legacyCreatedAt: Number,
	},
	[
		[
			{ transactionKey: 1 },
			{
				unique: true,
				partialFilterExpression: { transactionKey: { $type: "string" } },
			},
		],
	],
);
export const models = {
	events: Event,
	newsletters: Newsletter,
	members: Member,
	settings: Setting,
};
export async function ensureIndexes() {
	for (const entry of [
		Event,
		Newsletter,
		Member,
		Setting,
		AdminSession,
		RateLimit,
		Media,
		UploadTicket,
		Registration,
		Payment,
	])
		await entry.createIndexes();
}
export function plain(value: any): any {
	return JSON.parse(JSON.stringify(value));
}
export function contentData(value: any) {
	if (!value) return null;
	const { createdAt, updatedAt, __v, ...data } = plain(value);
	return data;
}
