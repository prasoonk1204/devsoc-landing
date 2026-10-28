import axios from "axios";
const api = axios.create({
	baseURL: "/api/v1",
	timeout: 30000,
	headers: { "Content-Type": "application/json" },
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
			// console.error("API Error:", error.response?.status, error.message);
		}
		return Promise.reject(error);
	},
);

export default api;
