import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { PrismaClient } from "@prisma/client";

import { registrationController } from "./controllers/registration.controller";
import { paymentController } from "./controllers/payment.controller";
import { settingController } from "./controllers/setting.controller";

// Initialize Prisma
export const prisma = new PrismaClient({});

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(registrationController)
  .use(paymentController)
  .use(settingController)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
