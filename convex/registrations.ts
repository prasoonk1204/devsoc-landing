import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPendingRegistration = mutation({
	args: {
		name: v.string(),
		roll: v.string(),
		phone: v.string(),
		email: v.string(),
		department: v.string(),
		year: v.string(),
		questions: v.string(),
		eventSlug: v.string(),
		eventTitle: v.string(),
		transactionId: v.string(),
		amount: v.number(),
	},
	handler: async (ctx, args) => {
		// Normalize email to lowercase for consistent checking
		const normalizedEmail = args.email.toLowerCase();

		const existingRegistration = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.filter((q) => q.eq(q.field("eventSlug"), args.eventSlug))
			.first();

		if (existingRegistration) {
			throw new Error(
				`You have already registered for this event with the email ${normalizedEmail}. Each email can only register once per event.`,
			);
		}

		const existingTransaction = await ctx.db
			.query("payments")
			.withIndex("by_transaction", (q) =>
				q.eq("transactionId", args.transactionId),
			)
			.first();

		if (existingTransaction) {
			throw new Error(
				`This transaction ID (${args.transactionId}) has already been used. Please verify your transaction ID or use a different one.`,
			);
		}

		const now = Date.now();

		const userId = await ctx.db.insert("users", {
			name: args.name,
			roll: args.roll,
			phone: args.phone,
			email: normalizedEmail,
			department: args.department,
			year: args.year,
			questions: args.questions,
			eventSlug: args.eventSlug,
			eventTitle: args.eventTitle,
			registeredAt: now,
		});

		const paymentId = await ctx.db.insert("payments", {
			userId,
			transactionId: args.transactionId,
			paymentScreenshotUrl: "",
			paymentScreenshotStorageId: "",
			eventSlug: args.eventSlug,
			eventTitle: args.eventTitle,
			amount: args.amount,
			status: "pending",
			createdAt: now,
		});

		await ctx.db.patch(userId, {
			paymentId,
		});

		return {
			success: true,
			userId,
			paymentId,
		};
	},
});

export const updateRegistrationWithPayment = mutation({
	args: {
		paymentId: v.id("payments"),
		paymentScreenshotUrl: v.string(),
		paymentScreenshotStorageId: v.string(),
	},
	handler: async (ctx, args) => {
		const payment = await ctx.db.get(args.paymentId);

		if (!payment) {
			throw new Error("Payment record not found");
		}

		await ctx.db.patch(args.paymentId, {
			paymentScreenshotUrl: args.paymentScreenshotUrl,
			paymentScreenshotStorageId: args.paymentScreenshotStorageId,
		});

		return {
			success: true,
			message: "Registration successful! Your payment is pending verification.",
		};
	},
});

export const deleteRegistration = mutation({
	args: {
		userId: v.id("users"),
		paymentId: v.id("payments"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.paymentId);
		await ctx.db.delete(args.userId);

		return {
			success: true,
		};
	},
});

export const getEventRegistrations = query({
	args: {
		eventSlug: v.string(),
	},
	handler: async (ctx, args) => {
		const users = await ctx.db
			.query("users")
			.withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
			.collect();

		const registrations = await Promise.all(
			users.map(async (user) => {
				const payment = user.paymentId
					? await ctx.db.get(user.paymentId)
					: null;
				return {
					...user,
					payment,
				};
			}),
		);

		return registrations;
	},
});

export const getUserRegistration = query({
	args: {
		email: v.string(),
		eventSlug: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.filter((q) => q.eq(q.field("eventSlug"), args.eventSlug))
			.first();

		if (!user) {
			return null;
		}

		const payment = user.paymentId ? await ctx.db.get(user.paymentId) : null;

		return {
			...user,
			payment,
		};
	},
});

export const checkEmailRegistration = query({
	args: {
		email: v.string(),
		eventSlug: v.string(),
	},
	handler: async (ctx, args) => {
		if (!args.email || args.email.length < 5) {
			return { isRegistered: false };
		}

		const existingRegistration = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
			.filter((q) => q.eq(q.field("eventSlug"), args.eventSlug))
			.first();

		return {
			isRegistered: !!existingRegistration,
			registrationDate: existingRegistration?.registeredAt,
		};
	},
});

export const updatePaymentStatus = mutation({
	args: {
		paymentId: v.id("payments"),
		status: v.string(),
		verifiedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const payment = await ctx.db.get(args.paymentId);

		if (!payment) {
			throw new Error("Payment not found");
		}

		await ctx.db.patch(args.paymentId, {
			status: args.status,
			verifiedAt: args.status === "verified" ? Date.now() : undefined,
			verifiedBy: args.verifiedBy,
		});

		return {
			success: true,
			message: `Payment ${args.status} successfully`,
		};
	},
});

export const getPendingPayments = query({
	handler: async (ctx) => {
		const payments = await ctx.db
			.query("payments")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.collect();

		const paymentsWithUsers = await Promise.all(
			payments.map(async (payment) => {
				const user = await ctx.db.get(payment.userId);
				return {
					...payment,
					user,
				};
			}),
		);

		return paymentsWithUsers;
	},
});
