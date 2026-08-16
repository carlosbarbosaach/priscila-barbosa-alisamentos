import { USER_ROLES } from "@priscila/shared";
import type { FastifyPluginAsync } from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";

export const adminRoutes: FastifyPluginAsync = async (app) => {
    app.get(
        "/me",
        {
            preHandler: [
                authenticate,
                requireRole([USER_ROLES.ADMIN]),
            ],
        },
        async (request, reply) => {
            const appUser = request.appUser;

            if (!appUser) {
                return reply.status(403).send({
                    message: "Perfil administrativo não encontrado.",
                });
            }

            return {
                user: appUser,
                access: {
                    area: "ADMIN",
                    authorized: true,
                },
            };
        },
    );
};