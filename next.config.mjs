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
		// ImageKit assets are already hosted and transformed remotely, so do not use
		// a custom loader for the entire app. This avoids the remote-loader error
		// while preserving the allowed remote host configuration.
		unoptimized: true,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ["image/webp"],
		qualities: [75, 80, 85, 90, 95],
		minimumCacheTTL: 31536000, // 1 year
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
		NEXT_PUBLIC_EXTERNAL_REGISTRATION_URL:
			process.env.NEXT_PUBLIC_EXTERNAL_REGISTRATION_URL,
		NEXT_PUBLIC_EVENT_ONLY_MODE: process.env.NEXT_PUBLIC_EVENT_ONLY_MODE,
	},
	async redirects() {
		return [];
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
