import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import { DashboardService } from "./dashboard.service.js";

const dashboardService =
    new DashboardService();

export async function getDashboardController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const appUser = request.appUser;

    if (!appUser) {
        return reply.status(403).send({
            message:
                "Perfil administrativo não encontrado.",
        });
    }

    const dashboard =
        await dashboardService.getSummary(
            appUser.salonId,
        );

    return reply.send(dashboard);
}