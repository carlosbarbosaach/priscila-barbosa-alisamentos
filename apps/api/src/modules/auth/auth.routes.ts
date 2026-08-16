import type { FastifyPluginAsync } from "fastify";

import { UserService } from "../users/user.service.js";
import { authenticate } from "../../shared/middleware/authenticate.middleware.js";

const userService = new UserService();

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

            const user = await userService.ensureClientUser({
                id: authUser.uid,
                email: authUser.email ?? null,
                displayName: authUser.name ?? null,
                photoUrl: authUser.picture ?? null,
            });

            return {
                user,
                firebase: {
                    emailVerified: authUser.email_verified,
                },
            };
        },
    );
};