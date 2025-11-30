import axios from "axios";
import { env } from "./env";

// Determine API URL based on environment
const getApiUrl = () => {
	// Use provided API URL or fallback to same origin
	const apiUrl = env.NEXT_PUBLIC_API_URL;

	// If no API URL is set, use same origin (works for single deployment)
	if (!apiUrl || apiUrl === "" || apiUrl === undefined) {
		// In browser, use current origin
		if (typeof window !== "undefined") {
			return `${window.location.origin}/api/v1`;
		}
		// During SSR/build, use relative path (Next.js will handle rewrite)
		return "/api/v1";
	}

	// If API URL is provided, check if it's same as current origin
	if (typeof window !== "undefined") {
		const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
		try {
			const apiOrigin = new URL(baseUrl).origin;
			const currentOrigin = window.location.origin;

			// If same origin, use relative path to avoid CORS preflight
			if (apiOrigin === currentOrigin) {
				return "/api/v1";
			}
		} catch (e) {
			// Invalid URL, fall through to use as-is
		}
	}

	// If API URL is provided and different origin, use it
	const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
	return `${baseUrl}/api/v1`;
};

const api = axios.create({
	baseURL: getApiUrl(),
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor for debugging
api.interceptors.request.use(
	(config) => {
		if (process.env.NODE_ENV === "development") {
			console.log("API Request:", config.method?.toUpperCase(), config.url);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Add response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (process.env.NODE_ENV === "development") {
			console.error("API Error:", error.response?.status, error.message);
		}
		return Promise.reject(error);
	},
);

export default api;
