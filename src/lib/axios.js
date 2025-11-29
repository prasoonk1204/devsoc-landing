import axios from "axios";
import { env } from "./env";

// Determine API URL based on environment
const getApiUrl = () => {
	// Use provided API URL or fallback to same origin
	const apiUrl = env.NEXT_PUBLIC_API_URL;
	
	// If no API URL is set, use same origin in browser
	if (!apiUrl || apiUrl === "") {
		if (typeof window !== "undefined") {
			return `${window.location.origin}/api/v1`;
		}
		// During SSR/build, use a placeholder (will be replaced at runtime)
		return "/api/v1";
	}
	
	return `${apiUrl}/api/v1`;
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
