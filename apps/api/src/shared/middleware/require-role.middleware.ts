import type { UserRole } from "@priscila/shared";
import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import { UserService } from "../../modules/users/user.service.js";

const userService = new UserService();

export function requireRole(
    allowedRoles: readonly UserRole[],
) {
    return async function roleMiddleware(
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<void> {
        const authUser = request.authUser;

        if (!authUser) {
            await reply.status(401).send({
                message: "Usuário não autenticado.",
            });

            return;
        }

        const appUser =
            await userService.findById(authUser.uid);

        if (!appUser) {
            await reply.status(403).send({
                message:
                    "Usuário não possui perfil no sistema.",
            });

            return;
        }

        if (!appUser.active) {
            await reply.status(403).send({
                message: "Usuário inativo.",
            });

            return;
        }

        if (!allowedRoles.includes(appUser.role)) {
            await reply.status(403).send({
                message:
                    "Você não possui permissão para acessar este recurso.",
            });

            return;
        }

        request.appUser = appUser;
    };
}