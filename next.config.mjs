/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ik.imagekit.io",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "imagekit.io",
				pathname: "/**",
			},
		],
	},
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
		NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY:
			process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
		NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT:
			process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
		NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION:
			process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION,
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
	async rewrites() {
		// In development, proxy to local Elysia server
		if (process.env.NODE_ENV === "development") {
			return [
				{
					source: "/api/v1/:path*",
					destination: "http://localhost:3001/api/v1/:path*",
				},
			];
		}

		// In production on Vercel, API routes are handled by serverless functions
		// No rewrites needed - Vercel routes /api/* automatically
		return [];
	},
};

export default nextConfig;
