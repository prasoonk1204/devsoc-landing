import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a setting by key
export const getSetting = query({
	args: {
		key: v.string(),
	},
	handler: async (ctx, args) => {
		const setting = await ctx.db
			.query("settings")
			.withIndex("by_key", (q) => q.eq("key", args.key))
			.first();

		if (!setting) {
			return null;
		}

		try {
			return {
				key: setting.key,
				value: JSON.parse(setting.value),
				description: setting.description,
				updatedAt: setting.updatedAt,
			};
		} catch {
			return {
				key: setting.key,
				value: setting.value,
				description: setting.description,
				updatedAt: setting.updatedAt,
			};
		}
	},
});

// Get all settings
export const getAllSettings = query({
	handler: async (ctx) => {
		const settings = await ctx.db.query("settings").collect();

		return settings.map((setting) => {
			try {
				return {
					key: setting.key,
					value: JSON.parse(setting.value),
					description: setting.description,
					updatedAt: setting.updatedAt,
				};
			} catch {
				return {
					key: setting.key,
					value: setting.value,
					description: setting.description,
					updatedAt: setting.updatedAt,
				};
			}
		});
	},
});

// Update or create a setting
export const updateSetting = mutation({
	args: {
		key: v.string(),
		value: v.string(), // JSON stringified
		description: v.optional(v.string()),
		updatedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existingSetting = await ctx.db
			.query("settings")
			.withIndex("by_key", (q) => q.eq("key", args.key))
			.first();

		const now = Date.now();

		if (existingSetting) {
			await ctx.db.patch(existingSetting._id, {
				value: args.value,
				description: args.description,
				updatedAt: now,
				updatedBy: args.updatedBy,
			});

			return {
				success: true,
				message: `Setting '${args.key}' updated successfully`,
			};
		} else {
			await ctx.db.insert("settings", {
				key: args.key,
				value: args.value,
				description: args.description,
				updatedAt: now,
				updatedBy: args.updatedBy,
			});

			return {
				success: true,
				message: `Setting '${args.key}' created successfully`,
			};
		}
	},
});

// Delete a setting
export const deleteSetting = mutation({
	args: {
		key: v.string(),
	},
	handler: async (ctx, args) => {
		const setting = await ctx.db
			.query("settings")
			.withIndex("by_key", (q) => q.eq("key", args.key))
			.first();

		if (!setting) {
			throw new Error(`Setting '${args.key}' not found`);
		}

		await ctx.db.delete(setting._id);

		return {
			success: true,
			message: `Setting '${args.key}' deleted successfully`,
		};
	},
});

// Get payment settings for an event
export const getPaymentSettings = query({
	args: {
		eventSlug: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Try to get event-specific settings first
		if (args.eventSlug) {
			const eventSettings = await ctx.db
				.query("settings")
				.withIndex("by_key", (q) => q.eq("key", `payment_${args.eventSlug}`))
				.first();

			if (eventSettings) {
				try {
					return JSON.parse(eventSettings.value);
				} catch {
					// Fall through to default settings
				}
			}
		}

		// Fall back to default payment settings
		const defaultSettings = await ctx.db
			.query("settings")
			.withIndex("by_key", (q) => q.eq("key", "payment_default"))
			.first();

		if (defaultSettings) {
			try {
				return JSON.parse(defaultSettings.value);
			} catch {
				return null;
			}
		}

		return null;
	},
});

// Get community links
export const getCommunityLinks = query({
	handler: async (ctx) => {
		const setting = await ctx.db
			.query("settings")
			.withIndex("by_key", (q) => q.eq("key", "community_links"))
			.first();

		if (!setting) {
			return {
				whatsapp: null,
				discord: null,
			};
		}

		try {
			return JSON.parse(setting.value);
		} catch {
			return {
				whatsapp: null,
				discord: null,
			};
		}
	},
});
