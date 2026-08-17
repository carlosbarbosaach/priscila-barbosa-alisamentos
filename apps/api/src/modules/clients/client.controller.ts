import { randomUUID } from "node:crypto";

import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import {
    clientParamsSchema,
    clientStatusSchema,
    createClientSchema,
    updateClientSchema,
} from "./client.schema.js";

import { ClientService } from "./client.service.js";

const clientService = new ClientService();

function getSalonId(
    request: FastifyRequest,
): string | null {
    return request.appUser?.salonId ?? null;
}

export async function listClientsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId = getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const clients =
        await clientService.findAll(salonId);

    return reply.send({
        clients,
    });
}

export async function getClientController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId = getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message: "Parâmetros inválidos.",
            issues: parsedParams.error.issues,
        });
    }

    const client =
        await clientService.findById(
            salonId,
            parsedParams.data.clientId,
        );

    if (!client) {
        return reply.status(404).send({
            message: "Cliente não encontrada.",
        });
    }

    return reply.send({
        client,
    });
}

export async function createClientController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId = getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedBody =
        createClientSchema.safeParse(
            request.body,
        );

    if (!parsedBody.success) {
        return reply.status(400).send({
            message:
                "Dados da cliente inválidos.",
            issues: parsedBody.error.issues,
        });
    }

    try {
        const client =
            await clientService.create(
                salonId,
                randomUUID(),
                parsedBody.data,
            );

        return reply.status(201).send({
            client,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "Já existe uma cliente cadastrada com este telefone."
        ) {
            return reply.status(409).send({
                message: error.message,
            });
        }

        throw error;
    }
}

export async function updateClientController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId = getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message: "Parâmetros inválidos.",
            issues: parsedParams.error.issues,
        });
    }

    const parsedBody =
        updateClientSchema.safeParse(
            request.body,
        );

    if (!parsedBody.success) {
        return reply.status(400).send({
            message:
                "Dados da cliente inválidos.",
            issues: parsedBody.error.issues,
        });
    }

    try {
        const client =
            await clientService.update(
                salonId,
                parsedParams.data.clientId,
                parsedBody.data,
            );

        return reply.send({
            client,
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

        if (
            error instanceof Error &&
            error.message ===
            "Já existe outra cliente cadastrada com este telefone."
        ) {
            return reply.status(409).send({
                message: error.message,
            });
        }

        throw error;
    }
}

export async function updateClientStatusController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const salonId = getSalonId(request);

    if (!salonId) {
        return reply.status(403).send({
            message:
                "Salão do usuário não identificado.",
        });
    }

    const parsedParams =
        clientParamsSchema.safeParse(
            request.params,
        );

    if (!parsedParams.success) {
        return reply.status(400).send({
            message: "Parâmetros inválidos.",
            issues: parsedParams.error.issues,
        });
    }

    const parsedBody =
        clientStatusSchema.safeParse(
            request.body,
        );

    if (!parsedBody.success) {
        return reply.status(400).send({
            message:
                "Status da cliente inválido.",
            issues: parsedBody.error.issues,
        });
    }

    try {
        const client =
            await clientService.setActive(
                salonId,
                parsedParams.data.clientId,
                parsedBody.data.active,
            );

        return reply.send({
            client,
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