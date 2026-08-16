import { USER_ROLES } from "@priscila/shared";
import type { FastifyPluginAsync } from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";

import { getDashboardController } from "./dashboard.controller.js";

export const dashboardRoutes: FastifyPluginAsync =
    async (app) => {
        app.get(
            "/",
            {
                preHandler: [
                    authenticate,
                    requireRole([
                        USER_ROLES.ADMIN,
                    ]),
                ],
            },
            getDashboardController,
        );
    };