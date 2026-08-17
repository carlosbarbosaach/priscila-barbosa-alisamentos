import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./config/env.js";

import { adminRoutes } from "./modules/admin/admin.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { serviceRoutes } from "./modules/services/service.routes.js";
import { clientRoutes } from "./modules/clients/client.routes.js";
import { clientServicePriceRoutes } from "./modules/client-service-prices/client-service-price.routes.js";

export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.decorateRequest(
        "authUser",
        null,
    );

    app.decorateRequest(
        "appUser",
        null,
    );

    app.register(cors, {
        origin: env.FRONTEND_ORIGIN,

        methods: [
            "GET",
            "HEAD",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    });

    app.get(
        "/health",
        async () => ({
            status: "ok",
            service:
                "priscila-barbosa-api",
        }),
    );

    app.register(
        authRoutes,
        {
            prefix: "/api/v1/auth",
        },
    );

    app.register(
        adminRoutes,
        {
            prefix: "/api/v1/admin",
        },
    );

    app.register(
        dashboardRoutes,
        {
            prefix:
                "/api/v1/admin/dashboard",
        },
    );

    app.register(
        serviceRoutes,
        {
            prefix:
                "/api/v1/admin/services",
        },
    );

    app.register(
        clientRoutes,
        {
            prefix:
                "/api/v1/admin/clients",
        },
    );

    app.register(
        clientServicePriceRoutes,
        {
            prefix:
                "/api/v1/admin/clients",
        },
    );

    return app;
}