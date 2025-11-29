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
};

export default nextConfig;
