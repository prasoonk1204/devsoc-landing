// Env loaded in setup.ts

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { env } from "./env";

const convexUrl = env.NEXT_PUBLIC_CONVEX_URL || env.CONVEX_URL;

if (!convexUrl) {
	throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL is not defined");
}

export const convex = new ConvexHttpClient(convexUrl);
export { api };
