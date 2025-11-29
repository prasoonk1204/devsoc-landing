export const env = {
	PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
	NODE_ENV: process.env.NODE_ENV || "development",
	ALLOWED_ORIGINS:
		process.env.ALLOWED_ORIGINS ||
		"http://localhost:3000,http://localhost:3001",
	CONVEX_URL:
		process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "",
	NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "",
	ADMIN_SECRET: process.env.ADMIN_SECRET || "",
	IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
	NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:
		process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
	NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
		process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
};
