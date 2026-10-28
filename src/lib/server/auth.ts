import {
	createHash,
	randomBytes,
	randomUUID,
	scrypt,
	timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { connectDb } from "./db.ts";
import { AdminSession, RateLimit } from "./models.ts";
import { HttpError } from "./http.ts";

const deriveKey = promisify(scrypt);
const SESSION_MS = 8 * 60 * 60 * 1000;
export const hashToken = (value: string) =>
	createHash("sha256").update(value).digest("hex");
export const cookieName = () =>
	process.env.NODE_ENV === "production"
		? "__Host-devsoc-admin"
		: "devsoc-admin";
export async function hashPassword(password: string) {
	if (password.length < 16 || password.length > 1024)
		throw new Error("Use a password between 16 and 1024 characters");
	const salt = randomBytes(16).toString("hex");
	return `scrypt:${salt}:${Buffer.from((await deriveKey(password, salt, 64)) as Buffer).toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
	if (
		password.length > 1024 ||
		!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(encoded)
	)
		return false;
	const [, salt, key] = encoded.split(":");
	const derived = Buffer.from((await deriveKey(password, salt, 64)) as Buffer);
	return timingSafeEqual(derived, Buffer.from(key, "hex"));
}
function credentialVersion() {
	const value = process.env.ADMIN_PASSWORD_HASH;
	if (!value || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(value))
		throw new HttpError(503, "Admin login is not configured");
	return hashToken(value);
}
export function tokenFromRequest(request: Request) {
	return (
		request.headers
			.get("cookie")
			?.split(";")
			.map((part) => part.trim())
			.find((part) => part.startsWith(`${cookieName()}=`))
			?.slice(cookieName().length + 1) || ""
	);
}
export function sessionCookie(token: string, clear = false) {
	return `${cookieName()}=${clear ? "" : token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : SESSION_MS / 1000}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export async function rateLimit(key: string, limit: number, windowMs: number) {
	await connectDb();
	const bucket = Math.floor(Date.now() / windowMs);
	const _id = hashToken(`${key}:${bucket}`);
	let record: any;
	try {
		record = await RateLimit.findOneAndUpdate(
			{ _id },
			{
				$inc: { count: 1 },
				$setOnInsert: { expiresAt: new Date((bucket + 1) * windowMs) },
			},
			{ upsert: true, returnDocument: "after" },
		).lean();
	} catch (error: any) {
		if (error.code !== 11000) throw error;
		record = await RateLimit.findOneAndUpdate(
			{ _id },
			{ $inc: { count: 1 } },
			{ returnDocument: "after" },
		).lean();
	}
	if (!record || record.count > limit)
		throw new HttpError(429, "Too many attempts. Please try again later.");
}
export function clientKey(request: Request) {
	// Only deployment-controlled headers are trusted; local callers share a bucket.
	return process.env.VERCEL === "1"
		? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
				"unknown"
		: "local";
}
export async function login(password: string, request: Request) {
	const version = credentialVersion();
	await rateLimit(`login:${clientKey(request)}`, 5, 15 * 60 * 1000);
	if (!(await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!)))
		throw new HttpError(401, "Invalid password");
	const token = randomBytes(32).toString("hex");
	await AdminSession.create({
		_id: randomUUID(),
		tokenHash: hashToken(token),
		credentialVersion: version,
		principal: "shared-admin",
		expiresAt: new Date(Date.now() + SESSION_MS),
	});
	return token;
}
export async function getAdminPrincipal(request: Request) {
	const token = tokenFromRequest(request);
	if (!/^[a-f0-9]{64}$/.test(token)) return null;
	await connectDb();
	const record = (await AdminSession.findOne({
		tokenHash: hashToken(token),
		credentialVersion: credentialVersion(),
		expiresAt: { $gt: new Date() },
	}).lean()) as any;
	return record ? { id: record.principal, role: "admin" as const } : null;
}
export async function requireAdmin(request: Request) {
	const principal = await getAdminPrincipal(request);
	if (!principal) throw new HttpError(401, "Admin login required");
	return principal;
}
export async function logout(request: Request) {
	const token = tokenFromRequest(request);
	if (token) {
		await connectDb();
		await AdminSession.deleteOne({ tokenHash: hashToken(token) });
	}
}
