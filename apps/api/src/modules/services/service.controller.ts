import {
    randomUUID,
} from "node:crypto";

import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import {
    createServiceSchema,
    serviceParamsSchema,
    servicePromotionSchema,
    serviceStatusSchema,
    updateServiceSchema,
} from "./service.schema.js";

import {
    ServiceService,
} from "./service.service.js";

const serviceService =
    new ServiceService();

function getSalonId(
    request:
        FastifyRequest,
): string | null {
    return (
        request.appUser
            ?.salonId ??
        null
    );
}

/*
 * =================================
 * LISTAR SERVIÇOS
 * =================================
 */
export async function listServicesController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    const services =
        await serviceService
            .findAll(
                salonId,
            );

    return reply.send({
        services,
    });
}

/*
 * =================================
 * BUSCAR SERVIÇO
 * =================================
 */
export async function getServiceController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    const parsedParams =
        serviceParamsSchema
            .safeParse(
                request.params,
            );

    if (
        !parsedParams.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Parâmetros inválidos.",

                issues:
                    parsedParams
                        .error
                        .issues,
            });
    }

    const service =
        await serviceService
            .findById(
                salonId,

                parsedParams
                    .data
                    .serviceId,
            );

    if (!service) {
        return reply
            .status(
                404,
            )
            .send({
                message:
                    "Serviço não encontrado.",
            });
    }

    return reply.send({
        service,
    });
}

/*
 * =================================
 * CRIAR SERVIÇO
 * =================================
 */
export async function createServiceController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    const parsedBody =
        createServiceSchema
            .safeParse(
                request.body,
            );

    if (
        !parsedBody.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Dados do serviço inválidos.",

                issues:
                    parsedBody
                        .error
                        .issues,
            });
    }

    const serviceId =
        randomUUID();

    const service =
        await serviceService
            .create(
                salonId,

                serviceId,

                parsedBody.data,
            );

    return reply
        .status(
            201,
        )
        .send({
            service,
        });
}

/*
 * =================================
 * ATUALIZAR SERVIÇO
 * =================================
 */
export async function updateServiceController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    const parsedParams =
        serviceParamsSchema
            .safeParse(
                request.params,
            );

    if (
        !parsedParams.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Parâmetros inválidos.",

                issues:
                    parsedParams
                        .error
                        .issues,
            });
    }

    const parsedBody =
        updateServiceSchema
            .safeParse(
                request.body,
            );

    if (
        !parsedBody.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Dados do serviço inválidos.",

                issues:
                    parsedBody
                        .error
                        .issues,
            });
    }

    const service =
        await serviceService
            .update(
                salonId,

                parsedParams
                    .data
                    .serviceId,

                parsedBody.data,
            );

    return reply.send({
        service,
    });
}

/*
 * =================================
 * STATUS DO SERVIÇO
 * =================================
 */
export async function updateServiceStatusController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    const parsedParams =
        serviceParamsSchema
            .safeParse(
                request.params,
            );

    if (
        !parsedParams.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Parâmetros inválidos.",

                issues:
                    parsedParams
                        .error
                        .issues,
            });
    }

    const parsedBody =
        serviceStatusSchema
            .safeParse(
                request.body,
            );

    if (
        !parsedBody.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Status inválido.",

                issues:
                    parsedBody
                        .error
                        .issues,
            });
    }

    const service =
        await serviceService
            .setActive(
                salonId,

                parsedParams
                    .data
                    .serviceId,

                parsedBody
                    .data
                    .active,
            );

    return reply.send({
        service,
    });
}

/*
 * =================================
 * PROMOÇÃO DO SERVIÇO
 * =================================
 *
 * PATCH
 *
 * /api/v1/services/:serviceId/promotion
 *
 * ATIVAR:
 *
 * {
 *   "active": true,
 *   "promotionPriceCents": 25000,
 *   "promotionLabel": "Promoção"
 * }
 *
 * RETIRAR:
 *
 * {
 *   "active": false
 * }
 */
export async function updateServicePromotionController(
    request:
        FastifyRequest,

    reply:
        FastifyReply,
) {
    const salonId =
        getSalonId(
            request,
        );

    if (!salonId) {
        return reply
            .status(
                403,
            )
            .send({
                message:
                    "Salão do usuário não identificado.",
            });
    }

    /*
     * =================================
     * PARAMS
     * =================================
     */
    const parsedParams =
        serviceParamsSchema
            .safeParse(
                request.params,
            );

    if (
        !parsedParams.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Parâmetros inválidos.",

                issues:
                    parsedParams
                        .error
                        .issues,
            });
    }

    /*
     * =================================
     * BODY
     * =================================
     */
    const parsedBody =
        servicePromotionSchema
            .safeParse(
                request.body,
            );

    if (
        !parsedBody.success
    ) {
        return reply
            .status(
                400,
            )
            .send({
                message:
                    "Dados da promoção inválidos.",

                issues:
                    parsedBody
                        .error
                        .issues,
            });
    }

    /*
     * =================================
     * SERVICE
     * =================================
     *
     * A regra de negócio continua
     * no ServiceService:
     *
     * - serviço deve existir;
     * - promoção deve ser menor
     *   que o preço normal;
     * - desativação limpa os dados
     *   da promoção.
     */
    const service =
        await serviceService
            .setPromotion(
                salonId,

                parsedParams
                    .data
                    .serviceId,

                parsedBody.data,
            );

    return reply.send({
        service,
    });
}