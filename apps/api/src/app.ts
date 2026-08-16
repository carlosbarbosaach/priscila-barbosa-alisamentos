import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";

export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.decorateRequest("authUser", null);

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

    return app;
}