import type { FastifyPluginAsync } from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
    app.get(
        "/me",
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const authUser = request.authUser;

            if (!authUser) {
                return reply.status(401).send({
                    message: "Usuário não autenticado.",
                });
            }

            return {
                uid: authUser.uid,
                email: authUser.email ?? null,
                emailVerified: authUser.email_verified,
            };
        },
    );
};