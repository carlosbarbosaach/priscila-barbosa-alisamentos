import { USER_ROLES } from "@priscila/shared";
import type { FastifyPluginAsync } from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";

import {
    createClientController,
    getClientController,
    listClientsController,
    updateClientController,
    updateClientStatusController,
} from "./client.controller.js";

const adminOnly = [
    authenticate,
    requireRole([
        USER_ROLES.ADMIN,
    ]),
];

export const clientRoutes: FastifyPluginAsync =
    async (app) => {
        app.get(
            "/",
            {
                preHandler: adminOnly,
            },
            listClientsController,
        );

        app.get(
            "/:clientId",
            {
                preHandler: adminOnly,
            },
            getClientController,
        );

        app.post(
            "/",
            {
                preHandler: adminOnly,
            },
            createClientController,
        );

        app.patch(
            "/:clientId",
            {
                preHandler: adminOnly,
            },
            updateClientController,
        );

        app.patch(
            "/:clientId/status",
            {
                preHandler: adminOnly,
            },
            updateClientStatusController,
        );
    };