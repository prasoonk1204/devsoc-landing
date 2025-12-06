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
		// Use custom loader for ImageKit
		loader: "custom",
		loaderFile: "./src/lib/imagekitLoader.js",
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ["image/webp"],
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
	},
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
