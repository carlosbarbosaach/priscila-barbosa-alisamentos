import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.decorateRequest("authUser", null);
    app.decorateRequest("appUser", null);

    app.register(cors, {
        origin: env.FRONTEND_ORIGIN,
    });

    app.get("/health", async () => {
        return {
            status: "ok",
            service: "priscila-barbosa-api",
        };
    });

    app.register(authRoutes, {
        prefix: "/api/v1/auth",
    });

    app.register(adminRoutes, {
        prefix: "/api/v1/admin",
    });

    app.register(dashboardRoutes, {
        prefix: "/api/v1/admin/dashboard",
    });

    return app;
}