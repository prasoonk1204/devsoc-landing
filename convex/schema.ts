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
		// Dynamic form data
		formData: v.optional(v.any()), // Store additional dynamic form fields
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

	settings: defineTable({
		key: v.string(),
		value: v.string(),
		description: v.optional(v.string()),
		updatedAt: v.number(),
		updatedBy: v.optional(v.string()),
	}).index("by_key", ["key"]),

	// Dynamic form configurations
	formConfigs: defineTable({
		eventSlug: v.string(),
		eventTitle: v.string(),
		formType: v.string(), // "payment", "simple", "custom"
		isActive: v.boolean(),
		fields: v.array(
			v.object({
				id: v.string(),
				type: v.string(), // "text", "email", "tel", "select", "radio", "checkbox", "textarea", "file"
				label: v.string(),
				placeholder: v.optional(v.string()),
				required: v.boolean(),
				options: v.optional(v.array(v.string())), // For select, radio, checkbox
				validation: v.optional(
					v.object({
						minLength: v.optional(v.number()),
						maxLength: v.optional(v.number()),
						pattern: v.optional(v.string()),
						min: v.optional(v.number()),
						max: v.optional(v.number()),
					}),
				),
			}),
		),
		paymentConfig: v.optional(
			v.object({
				enabled: v.boolean(),
				amount: v.number(),
				qrCodeUrl: v.optional(v.string()),
				upiId: v.optional(v.string()),
				instructions: v.optional(v.string()),
			}),
		),
		styling: v.optional(
			v.object({
				theme: v.string(), // "dark", "light", "custom"
				primaryColor: v.optional(v.string()),
				backgroundColor: v.optional(v.string()),
			}),
		),
		createdAt: v.number(),
		updatedAt: v.number(),
		createdBy: v.optional(v.string()),
	})
		.index("by_event", ["eventSlug"])
		.index("by_active", ["isActive"]),
});
