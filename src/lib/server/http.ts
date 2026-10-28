export class HttpError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}
export function json(data: unknown, status = 200, headers?: HeadersInit) {
	return Response.json(data, {
		status,
		headers: { "Cache-Control": "no-store", ...headers },
	});
}
export async function readJson(request: Request, maxBytes = 256 * 1024) {
	if (!request.headers.get("content-type")?.includes("application/json"))
		throw new HttpError(415, "Use application/json");
	const reader = request.body?.getReader();
	if (!reader) throw new HttpError(400, "Request body is required");
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > maxBytes) {
			await reader.cancel();
			throw new HttpError(413, "Request is too large");
		}
		chunks.push(value);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new HttpError(400, "Invalid JSON body");
	}
}
export function requireSameOrigin(request: Request) {
	const configured = process.env.APP_ORIGIN;
	if (process.env.NODE_ENV === "production" && !configured)
		throw new HttpError(503, "Application origin is not configured");
	const expected = new URL(configured || request.url).origin;
	if (
		request.headers.get("origin") !== expected ||
		request.headers.get("sec-fetch-site") === "cross-site"
	)
		throw new HttpError(403, "Request origin is not allowed");
}
