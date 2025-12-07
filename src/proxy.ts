import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
	const eventOnlyMode = process.env.NEXT_PUBLIC_EVENT_ONLY_MODE?.trim();

	// If event-only mode is not enabled, allow all requests
	if (!eventOnlyMode) {
		return NextResponse.next();
	}

	const { pathname } = request.nextUrl;

	// Allow Next.js internal routes and API routes
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname === "/favicon.ico" ||
		pathname.startsWith("/__nextjs") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// The only allowed path is the specific event page
	const allowedEventPath = `/events/${eventOnlyMode}`;

	// If user is already on the allowed event page, allow it
	if (pathname === allowedEventPath) {
		return NextResponse.next();
	}

	// Block registration page even for the event-only mode event
	if (pathname.startsWith("/events/") && pathname.includes("/register")) {
		return NextResponse.redirect(new URL(allowedEventPath, request.url));
	}

	// Redirect everything else to the event-only page
	return NextResponse.redirect(new URL(allowedEventPath, request.url));
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
