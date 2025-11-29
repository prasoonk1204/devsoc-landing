import { z } from "zod";

const clientSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	NEXT_PUBLIC_CONVEX_URL: z.string().url().min(1, "Convex URL is required"),
	NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z
		.string()
		.min(1, "ImageKit public key is required"),
	NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z
		.string()
		.url()
		.min(1, "ImageKit URL endpoint is required"),
	NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION: z
		.enum(["yes", "no", "true", "false"])
		.default("no"),
	NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
});

const serverSchema = clientSchema.extend({
	PORT: z.coerce.number().default(3001),
	ALLOWED_ORIGINS: z
		.string()
		.default("http://localhost:3000,http://localhost:3001"),
	CONVEX_DEPLOYMENT: z.string().optional(),
	CONVEX_URL: z.string().url(),
	ADMIN_SECRET: z.string().min(1, "Admin secret is required"),
	IMAGEKIT_PRIVATE_KEY: z.string().min(1, "ImageKit private key is required"),
});

function validateEnv() {
	const vars = {
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.PORT,
		ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
		CONVEX_URL: process.env.CONVEX_URL,
		NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
		ADMIN_SECRET: process.env.ADMIN_SECRET,
		NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:
			process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
		IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
		NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
			process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
		NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION:
			process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION,
	};

	try {
		if (typeof window === "undefined") {
			return serverSchema.parse(vars);
		} else {
			return clientSchema.parse(vars);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.errors
				.map((err) => `  - ${err.path.join(".")}: ${err.message}`)
				.join("\n");
			throw new Error(
				`Invalid environment variables:\n${missingVars}\n\nPlease check your .env file and ensure all required variables are set.`,
			);
		}
		throw error;
	}
}

export const env = validateEnv() as z.infer<typeof serverSchema>;

export type Env = z.infer<typeof serverSchema>;
