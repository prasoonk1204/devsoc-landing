"use client";

import { ConvexProvider as BaseConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error(
		"NEXT_PUBLIC_CONVEX_URL is not set. Please add it to your .env file.",
	);
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }) {
	return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
