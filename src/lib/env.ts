import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	NEXT_PUBLIC_CONVEX_URL: z.string().url().min(1, "Convex URL is required"),

	NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z
		.string()
		.min(1, "ImageKit public key is required"),
	IMAGEKIT_PRIVATE_KEY: z.string().min(1, "ImageKit private key is required"),
	NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z
		.string()
		.url()
		.min(1, "ImageKit URL endpoint is required"),

	NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION: z
		.enum(["yes", "no", "true", "false"])
		.default("no"),
});

function validateEnv() {
	try {
		const env = envSchema.parse({
			NODE_ENV: process.env.NODE_ENV,
			NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
			NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:
				process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
			IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
			NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
				process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
			NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION:
				process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION,
		});
		return env;
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

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
