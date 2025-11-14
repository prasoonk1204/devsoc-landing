import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		roll: v.string(),
		phone: v.string(),
		email: v.string(),
		department: v.string(),
		year: v.string(),
		questions: v.string(),
		eventSlug: v.string(),
		eventTitle: v.string(),
		registeredAt: v.number(),
		paymentId: v.optional(v.id("payments")),
	})
		.index("by_email", ["email"])
		.index("by_event", ["eventSlug"])
		.index("by_roll", ["roll"]),

	payments: defineTable({
		userId: v.id("users"),
		transactionId: v.string(),
		paymentScreenshotUrl: v.string(),
		paymentScreenshotStorageId: v.string(),
		eventSlug: v.string(),
		eventTitle: v.string(),
		amount: v.number(),
		status: v.string(), // "pending", "verified", "rejected"
		verifiedAt: v.optional(v.number()),
		verifiedBy: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_transaction", ["transactionId"])
		.index("by_event", ["eventSlug"])
		.index("by_status", ["status"]),
});
