import { z } from "zod";
import { randomUUID } from "node:crypto";
import { identifier, schemas, type ContentKind } from "../content-schemas.ts";
import {
	getAdminPrincipal,
	requireAdmin,
	login,
	logout,
	sessionCookie,
	rateLimit,
	clientKey,
} from "./auth.ts";
import { HttpError, json, readJson, requireSameOrigin } from "./http.ts";
import { connectDb } from "./db.ts";
import {
	getSite,
	getEventForRegistration,
	listContent,
	saveContent,
	removeContent,
} from "./content.ts";
import {
	models,
	contentData,
	Registration,
	Payment,
	Media,
	plain,
} from "./models.ts";
import {
	completeRegistration,
	eventRegistrations,
	registrationInput,
} from "./registrations.ts";
import {
	historicalEventId,
	registrationEventFilter,
	resolveRegistrationEvent,
} from "./event-links.ts";
import {
	prepareUpload,
	finishUpload,
	authorizeRegistrationMedia,
	getImagekit,
} from "./media.ts";

export async function handleApi(request: Request) {
	try {
		const url = new URL(request.url);
		const path = url.pathname.replace(/^\/api\/v1\/?/, "").replace(/\/$/, "");
		const method = request.method;
		if (!["GET", "HEAD"].includes(method)) requireSameOrigin(request);
		if (path === "health" && method === "GET")
			return json({ status: "healthy" });
		if (path === "auth/login" && method === "POST") {
			const { password } = z
				.object({ password: z.string().min(1).max(1024) })
				.strict()
				.parse(await readJson(request, 4096));
			const token = await login(password, request);
			return json({ success: true }, 200, {
				"Set-Cookie": sessionCookie(token),
			});
		}
		if (path === "auth/logout" && method === "POST") {
			await logout(request);
			return json({ success: true }, 200, {
				"Set-Cookie": sessionCookie("", true),
			});
		}
		if (path === "auth/session" && method === "GET")
			return json({ success: true, data: await getAdminPrincipal(request) });
		if (path === "registrations/upload" && method === "POST") {
			await rateLimit(`registration-upload:${clientKey(request)}`, 3, 300000);
			const body = z
				.object({
					registration: registrationInput,
					name: z.string(),
					size: z.number(),
					type: z.string(),
				})
				.strict()
				.parse(await readJson(request));
			const event = await getEventForRegistration(
				body.registration.eventSlug,
				body.registration.eventId,
			);
			if (!event)
				throw new HttpError(403, "Registration is closed for this event");
			if (
				(await Registration.exists({
					email: body.registration.email,
					...registrationEventFilter(event._id, event.slug),
				})) ||
				(await Payment.exists({
					transactionId: body.registration.transactionId,
				}))
			)
				throw new HttpError(
					409,
					"Email already registered or transaction ID already used",
				);
			return json({
				success: true,
				data: await prepareUpload({
					ownerKind: "registrations",
					ownerId: randomUUID(),
					slot: "payment",
					name: body.name,
					size: body.size,
					type: body.type,
				}),
			});
		}
		if (path === "registrations/upload/complete" && method === "POST") {
			await rateLimit(
				`registration-complete:${clientKey(request)}`,
				10,
				300000,
			);
			const body = z
				.object({
					ticketId: identifier,
					uploadToken: z.string().length(64),
					fileId: z.string().min(1).max(200),
				})
				.strict()
				.parse(await readJson(request));
			return json({
				success: true,
				data: await finishUpload(body.ticketId, body.uploadToken, body.fileId),
			});
		}
		if (
			path.startsWith("admin/") ||
			path === "settings" ||
			path === "registrations/user" ||
			(/^registrations\/[^/]+$/.test(path) &&
				path !== "registrations/check" &&
				path !== "registrations/register")
		) {
			const principal = await requireAdmin(request);
			await rateLimit(`admin:${principal.id}`, 240, 60000);
			if (path === "admin/media" && method === "GET") {
				const ownerKind = z
					.enum(["settings", "events", "newsletters", "members"])
					.parse(url.searchParams.get("ownerKind"));
				const ownerId = identifier.parse(url.searchParams.get("ownerId"));
				await connectDb();
				return json({
					success: true,
					data: plain(
						await Media.find({ ownerKind, ownerId, private: false })
							.select("url name slot")
							.sort({ createdAt: -1, _id: 1 })
							.lean(),
					),
				});
			}
			if (path === "admin/registrations/events" && method === "GET") {
				await connectDb();
				const [events, totals] = await Promise.all([
					models.events
						.find()
						.select("slug title image date")
						.sort({ date: -1 })
						.lean(),
					Registration.aggregate([
						{
							$group: {
								_id: {
									$ifNull: ["$eventId", { $concat: ["legacy:", "$eventSlug"] }],
								},
								eventId: { $first: "$eventId" },
								slug: { $first: "$eventSlug" },
								title: { $first: "$eventTitle" },
								count: { $sum: 1 },
							},
						},
					]),
				]);
				const groups = new Map<string, any>();
				for (const total of totals) {
					const event = events.find((event: any) =>
						total.eventId
							? event._id === total.eventId
							: event.slug === total.slug,
					);
					const id =
						total.eventId || event?._id || historicalEventId(total.slug);
					const row = groups.get(id) || {
						...(event || {
							_id: id,
							slug: total.slug,
							title: total.title || total.slug,
						}),
						count: 0,
					};
					row.count += total.count;
					groups.set(id, row);
				}
				return json({
					success: true,
					data: plain(
						[...groups.values()].sort((a, b) =>
							(b.date || "").localeCompare(a.date || ""),
						),
					),
				});
			}
			if (path === "admin/registrations" && method === "GET") {
				const eventId = identifier
					.optional()
					.parse(url.searchParams.get("eventId") || undefined);
				const eventSlug = z
					.string()
					.min(1)
					.max(200)
					.optional()
					.parse(url.searchParams.get("eventSlug") || undefined);
				const reference = await resolveRegistrationEvent(eventId, eventSlug);
				const filter = registrationEventFilter(
					reference.eventId,
					reference.slug,
				);
				const page = z.coerce
					.number()
					.int()
					.min(1)
					.max(100000)
					.parse(url.searchParams.get("page") || 1);
				await connectDb();
				const [registrations, total] = await Promise.all([
					Registration.find(filter)
						.sort({ registeredAt: -1, _id: 1 })
						.skip((page - 1) * 50)
						.limit(50)
						.lean(),
					Registration.countDocuments(filter),
				]);
				const payments = await Payment.find({
					userId: { $in: registrations.map((entry: any) => entry._id) },
				})
					.select(
						"userId amount status transactionId historicalDuplicate receiptUnavailable paymentScreenshotStorageId",
					)
					.lean();
				return json({
					success: true,
					data: {
						total,
						page,
						rows: plain(
							registrations.map((entry: any) => ({
								...entry,
								payment:
									payments.find(
										(payment: any) => payment._id === entry.paymentId,
									) ||
									payments.find(
										(payment: any) => payment.userId === entry._id,
									) ||
									null,
							})),
						),
					},
				});
			}
			if (path === "admin/media/upload" && method === "POST") {
				const body = await readJson(request);
				if (body.ownerKind === "registrations")
					throw new HttpError(400, "Use registration upload flow");
				return json({ success: true, data: await prepareUpload(body) });
			}
			if (path === "admin/media/upload/complete" && method === "POST") {
				const body = z
					.object({
						ticketId: identifier,
						uploadToken: z.string().length(64),
						fileId: z.string().min(1).max(200),
					})
					.strict()
					.parse(await readJson(request));
				return json({
					success: true,
					data: await finishUpload(
						body.ticketId,
						body.uploadToken,
						body.fileId,
					),
				});
			}
			if (path.startsWith("admin/content/")) {
				const [, , kind, id] = path.split("/");
				if (!Object.hasOwn(schemas, kind))
					throw new HttpError(404, "Unknown content type");
				const contentKind = kind as ContentKind;
				if (id) identifier.parse(id);
				if (method === "GET") {
					if (!id)
						return json({
							success: true,
							data: await listContent(contentKind, true),
						});
					await connectDb();
					const record = contentData(
						await models[contentKind].findById(id).lean(),
					);
					if (!record) throw new HttpError(404, "Content not found");
					return json({ success: true, data: record });
				}
				if (method === "PUT" && id) {
					const body = await readJson(request);
					if (body._id !== id)
						throw new HttpError(400, "Content ID does not match URL");
					return json({
						success: true,
						data: await saveContent(contentKind, body),
					});
				}
				if (method === "DELETE" && id) {
					await removeContent(contentKind, id);
					return json({ success: true });
				}
			}
			if (path === "admin/payments/pending" && method === "GET") {
				await connectDb();
				const payments = await Payment.find({ status: "pending" })
					.limit(500)
					.lean();
				const users = await Registration.find({
					_id: { $in: payments.map((payment) => payment.userId) },
				}).lean();
				return json({
					success: true,
					data: plain(
						payments.map((payment: any) => ({
							...payment,
							user: users.find((user: any) => user._id === payment.userId),
						})),
					),
				});
			}
			if (path === "admin/payments/verify" && method === "POST") {
				const { paymentId, status } = z
					.object({
						paymentId: z.string().min(1).max(200),
						status: z.enum(["verified", "rejected"]),
					})
					.strict()
					.parse(await readJson(request));
				await connectDb();
				const result = await Payment.updateOne(
					{ _id: paymentId },
					{
						$set: { status, verifiedAt: Date.now(), verifiedBy: principal.id },
					},
				);
				if (!result.matchedCount) throw new HttpError(404, "Payment not found");
				return json({ success: true });
			}
			if (
				/^admin\/payments\/[^/]+\/screenshot$/.test(path) &&
				method === "GET"
			) {
				await connectDb();
				const payment = (await Payment.findById(
					path.split("/")[2],
				).lean()) as any;
				if (payment?.receiptUnavailable)
					throw new HttpError(
						404,
						"Original payment screenshot is unavailable",
					);
				if (!payment?.paymentScreenshotStorageId)
					throw new HttpError(404, "Screenshot not found");
				const file = await getImagekit().getFileDetails(
					payment.paymentScreenshotStorageId,
				);
				return new Response(null, {
					status: 302,
					headers: {
						Location: getImagekit().url({
							path: file.filePath,
							signed: true,
							expireSeconds: 60,
						}),
						"Cache-Control": "no-store",
					},
				});
			}
			if (path === "registrations/user" && method === "GET")
				return json({
					success: true,
					data:
						(
							await eventRegistrations(
								url.searchParams.get("eventSlug") || "",
								url.searchParams.get("email") || "",
								url.searchParams.get("eventId") || undefined,
							)
						)[0] || null,
				});
			if (path.startsWith("registrations/") && method === "GET")
				return json({
					success: true,
					data: await eventRegistrations(path.split("/")[1]),
				});
			throw new HttpError(404, "Route not found");
		}
		if (path === "settings/community-links" && method === "GET") {
			const site = await getSite();
			return json({
				success: true,
				data: { whatsapp: site.whatsapp, discord: site.discord },
			});
		}
		if (path === "settings/payment" && method === "GET") {
			const event = await getEventForRegistration(
				url.searchParams.get("eventSlug") || undefined,
				url.searchParams.get("eventId") || undefined,
			);
			return json({ success: true, data: event?.payment || null });
		}
		if (path === "registrations/check" && method === "GET") {
			await rateLimit(`registration-check:${clientKey(request)}`, 100, 60000);
			const email = z
				.string()
				.trim()
				.toLowerCase()
				.email()
				.parse(url.searchParams.get("email"));
			const eventId = identifier
				.optional()
				.parse(url.searchParams.get("eventId") || undefined);
			const eventSlug = z
				.string()
				.min(1)
				.max(120)
				.optional()
				.parse(url.searchParams.get("eventSlug") || undefined);
			const reference = await resolveRegistrationEvent(eventId, eventSlug);
			await connectDb();
			return json({
				success: true,
				data: {
					isRegistered: Boolean(
						await Registration.exists({
							email,
							...registrationEventFilter(reference.eventId, reference.slug),
						}),
					),
				},
			});
		}
		if (path === "registrations/register" && method === "POST") {
			await rateLimit(`register:${clientKey(request)}`, 3, 300000);
			const { registration, mediaId, registrationId, uploadToken } = z
				.object({
					registration: z.unknown(),
					mediaId: identifier,
					registrationId: identifier,
					uploadToken: z.string().length(64),
				})
				.strict()
				.parse(await readJson(request));
			await authorizeRegistrationMedia(mediaId, registrationId, uploadToken);
			return json(
				await completeRegistration(registration, mediaId, registrationId),
			);
		}
		throw new HttpError(404, "Route not found");
	} catch (error: any) {
		if (error instanceof z.ZodError)
			return json(
				{
					success: false,
					error: "Invalid request data",
					details: error.issues.map(({ path, message }) => ({
						path: path.join("."),
						message,
					})),
				},
				400,
			);
		if (error instanceof HttpError)
			return json({ success: false, error: error.message }, error.status);
		if (error.code === 11000)
			return json(
				{
					success: false,
					error:
						"A record with this slug, email, or transaction ID already exists",
				},
				409,
			);
		console.error("API operation failed:", error.name);
		return json(
			{ success: false, error: "Operation failed. Please try again." },
			500,
		);
	}
}
