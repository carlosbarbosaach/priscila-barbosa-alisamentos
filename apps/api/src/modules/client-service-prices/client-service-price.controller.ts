import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import {
    clientPricesClientParamsSchema,
    clientServicePriceParamsSchema,
    clientServicePriceStatusSchema,
    saveClientServicePriceSchema,
} from "./client-service-price.schema.js";

import { ClientServicePriceService } from "./client-service-price.service.js";

const clientServicePriceService =
    new ClientServicePriceService();

function getSalonId(
    request: FastifyRequest,
): string | null {
    return request.appUser?.salonId ?? null;
}

export async function listAllClientServicePricesController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId =
        getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const prices =
        await clientServicePriceService.findAllBySalon(
            salonId,
        );

    return reply.send({
        prices,
    });
}

export async function listClientServicePricesController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId =
        getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientPricesClientParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message:
                "Parâmetros inválidos.",
            issues:
                parsedParams.error.issues,
        });
    }

    try {
        const prices =
            await clientServicePriceService.findAllByClient(
                salonId,
                parsedParams.data.clientId,
            );

        return reply.send({
            prices,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
                "Cliente não encontrada."
        ) {
            return reply.status(404).send({
                message: error.message,
            });
        }

        throw error;
    }
}

export async function saveClientServicePriceController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId =
        getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientServicePriceParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message:
                "Parâmetros inválidos.",
            issues:
                parsedParams.error.issues,
        });
    }

    const parsedBody =
        saveClientServicePriceSchema.safeParse(
            request.body,
        );

    if (!parsedBody.success) {
        return reply.status(400).send({
            message:
                "Preço especial inválido.",
            issues:
                parsedBody.error.issues,
        });
    }

    try {
        const price =
            await clientServicePriceService.save(
                salonId,
                parsedParams.data.clientId,
                parsedParams.data.serviceId,
                parsedBody.data.priceCents,
            );

        return reply.send({
            price,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (
                error.message ===
                    "Cliente não encontrada." ||
                error.message ===
                    "Serviço não encontrado."
            )
        ) {
            return reply.status(404).send({
                message: error.message,
            });
        }

        throw error;
    }
}

export async function updateClientServicePriceStatusController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId =
        getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientServicePriceParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message:
                "Parâmetros inválidos.",
            issues:
                parsedParams.error.issues,
        });
    }

    const parsedBody =
        clientServicePriceStatusSchema.safeParse(
            request.body,
        );

    if (!parsedBody.success) {
        return reply.status(400).send({
            message:
                "Status do preço especial inválido.",
            issues:
                parsedBody.error.issues,
        });
    }

    try {
        const price =
            await clientServicePriceService.setActive(
                salonId,
                parsedParams.data.clientId,
                parsedParams.data.serviceId,
                parsedBody.data.active,
            );

        return reply.send({
            price,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (
                error.message ===
                    "Cliente não encontrada." ||
                error.message ===
                    "Serviço não encontrado." ||
                error.message ===
                    "Preço especial não encontrado."
            )
        ) {
            return reply.status(404).send({
                message: error.message,
            });
        }

        throw error;
    }
}