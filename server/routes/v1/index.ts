import { Elysia } from "elysia";
import { registrationsRoutes } from "./registrations";
import { adminRoutes } from "./admin";
import { settingsRoutes } from "./settings";

export const v1Routes = new Elysia({ prefix: "/api/v1" })
	.use(registrationsRoutes)
	.use(adminRoutes)
	.use(settingsRoutes)
	.get("/", () => ({
		version: "1.0.0",
		status: "active",
		endpoints: {
			registrations: "/api/v1/registrations",
			admin: "/api/v1/admin",
			settings: "/api/v1/settings",
		},
	}));
