import axios from "axios";
import { env } from "./env";

// Determine API URL based on environment
const getApiUrl = () => {
	// In production, use the same origin if API_URL is not set
	if (typeof window !== "undefined" && !env.NEXT_PUBLIC_API_URL) {
		return `${window.location.origin}/api/v1`;
	}
	return `${env.NEXT_PUBLIC_API_URL}/api/v1`;
};

const api = axios.create({
	baseURL: getApiUrl(),
	timeout: 30000, // 30 second timeout
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
