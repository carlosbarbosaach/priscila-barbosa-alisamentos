import { USER_ROLES } from "@priscila/shared";
import type { FastifyPluginAsync } from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";

import {
    createServiceController,
    getServiceController,
    listServicesController,
    updateServiceController,
    updateServiceStatusController,
} from "./service.controller.js";

const adminOnly = [
    authenticate,
    requireRole([
        USER_ROLES.ADMIN,
    ]),
];

export const serviceRoutes: FastifyPluginAsync =
    async (app) => {
        app.get(
            "/",
            {
                preHandler: adminOnly,
            },
            listServicesController,
        );

        app.get(
            "/:serviceId",
            {
                preHandler: adminOnly,
            },
            getServiceController,
        );

        app.post(
            "/",
            {
                preHandler: adminOnly,
            },
            createServiceController,
        );

        app.patch(
            "/:serviceId",
            {
                preHandler: adminOnly,
            },
            updateServiceController,
        );

        app.patch(
            "/:serviceId/status",
            {
                preHandler: adminOnly,
            },
            updateServiceStatusController,
        );
    };