import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get form configuration by event slug
export const getFormConfig = query({
	args: { eventSlug: v.string() },
	handler: async (ctx, args) => {
		const config = await ctx.db
			.query("formConfigs")
			.withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
			.filter((q) => q.eq(q.field("isActive"), true))
			.first();

		return config;
	},
});

// Get all form configurations (admin)
export const getAllFormConfigs = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("formConfigs").order("desc").collect();
	},
});

// Create or update form configuration
export const upsertFormConfig = mutation({
	args: {
		eventSlug: v.string(),
		eventTitle: v.string(),
		formType: v.string(),
		isActive: v.boolean(),
		fields: v.array(
			v.object({
				id: v.string(),
				type: v.string(),
				label: v.string(),
				placeholder: v.optional(v.string()),
				required: v.boolean(),
				options: v.optional(v.array(v.string())),
				validation: v.optional(
					v.object({
						minLength: v.optional(v.number()),
						maxLength: v.optional(v.number()),
						pattern: v.optional(v.string()),
						min: v.optional(v.number()),
						max: v.optional(v.number()),
						fileTypes: v.optional(v.array(v.string())),
						maxFileSize: v.optional(v.number()),
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
				theme: v.string(),
				primaryColor: v.optional(v.string()),
				backgroundColor: v.optional(v.string()),
			}),
		),
		createdBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("formConfigs")
			.withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
			.first();

		const now = Date.now();

		if (existing) {
			// Update existing configuration
			await ctx.db.patch(existing._id, {
				eventTitle: args.eventTitle,
				formType: args.formType,
				isActive: args.isActive,
				fields: args.fields,
				paymentConfig: args.paymentConfig,
				styling: args.styling,
				updatedAt: now,
			});
			return existing._id;
		} else {
			// Create new configuration
			return await ctx.db.insert("formConfigs", {
				eventSlug: args.eventSlug,
				eventTitle: args.eventTitle,
				formType: args.formType,
				isActive: args.isActive,
				fields: args.fields,
				paymentConfig: args.paymentConfig,
				styling: args.styling,
				createdAt: now,
				updatedAt: now,
				createdBy: args.createdBy,
			});
		}
	},
});

// Delete form configuration
export const deleteFormConfig = mutation({
	args: { eventSlug: v.string() },
	handler: async (ctx, args) => {
		const config = await ctx.db
			.query("formConfigs")
			.withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
			.first();

		if (config) {
			await ctx.db.delete(config._id);
			return true;
		}
		return false;
	},
});

// Toggle form active status
export const toggleFormStatus = mutation({
	args: { eventSlug: v.string(), isActive: v.boolean() },
	handler: async (ctx, args) => {
		const config = await ctx.db
			.query("formConfigs")
			.withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
			.first();

		if (config) {
			await ctx.db.patch(config._id, {
				isActive: args.isActive,
				updatedAt: Date.now(),
			});
			return true;
		}
		return false;
	},
});
