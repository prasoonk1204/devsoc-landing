interface RateLimitEntry {
	count: number;
	resetTime: number;
}

class RateLimiter {
	private store: Map<string, RateLimitEntry> = new Map();
	private cleanupInterval: Timer;

	constructor() {
		this.cleanupInterval = setInterval(() => {
			const now = Date.now();
			for (const [key, entry] of this.store.entries()) {
				if (now > entry.resetTime) {
					this.store.delete(key);
				}
			}
		}, 60000);
	}

	check(
		identifier: string,
		maxRequests: number,
		windowMs: number,
	): {
		allowed: boolean;
		remaining: number;
		resetTime: number;
		retryAfter?: number;
	} {
		const now = Date.now();
		const entry = this.store.get(identifier);

		if (!entry || now > entry.resetTime) {
			const resetTime = now + windowMs;
			this.store.set(identifier, {
				count: 1,
				resetTime,
			});

			return {
				allowed: true,
				remaining: maxRequests - 1,
				resetTime,
			};
		}

		if (entry.count < maxRequests) {
			entry.count++;
			return {
				allowed: true,
				remaining: maxRequests - entry.count,
				resetTime: entry.resetTime,
			};
		}

		return {
			allowed: false,
			remaining: 0,
			resetTime: entry.resetTime,
			retryAfter: Math.ceil((entry.resetTime - now) / 1000),
		};
	}
}

export const rateLimiter = new RateLimiter();

export const RateLimitPresets = {
	REGISTRATION: { maxRequests: 3, windowMs: 300000 },
	RELAXED: { maxRequests: 100, windowMs: 60000 },
	ADMIN: { maxRequests: 60, windowMs: 60000 },
};

export function getClientIdentifier(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");
	const cfConnectingIp = request.headers.get("cf-connecting-ip");

	const ip =
		cfConnectingIp ||
		realIp ||
		(forwarded ? forwarded.split(",")[0]?.trim() : null) ||
		"unknown";

	return ip;
}
