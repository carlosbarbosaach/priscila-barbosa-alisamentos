import {
    USER_ROLES,
} from "@priscila/shared";

import type {
    FastifyPluginAsync,
} from "fastify";

import {
    authenticate,
} from "../../shared/middleware/authenticate.middleware.js";

import {
    requireRole,
} from "../../shared/middleware/require-role.middleware.js";

import {
    createServiceController,
    getServiceController,
    listServicesController,
    updateServiceController,
    updateServicePromotionController,
    updateServiceStatusController,
} from "./service.controller.js";

const adminOnly = [
    authenticate,

    requireRole([
        USER_ROLES.ADMIN,
    ]),
];

export const serviceRoutes:
    FastifyPluginAsync =
    async (
        app,
    ) => {
        /*
         * =================================
         * LISTAR
         * =================================
         */
        app.get(
            "/",
            {
                preHandler:
                    adminOnly,
            },
            listServicesController,
        );

        /*
         * =================================
         * BUSCAR
         * =================================
         */
        app.get(
            "/:serviceId",
            {
                preHandler:
                    adminOnly,
            },
            getServiceController,
        );

        /*
         * =================================
         * CRIAR
         * =================================
         */
        app.post(
            "/",
            {
                preHandler:
                    adminOnly,
            },
            createServiceController,
        );

        /*
         * =================================
         * EDITAR
         * =================================
         */
        app.patch(
            "/:serviceId",
            {
                preHandler:
                    adminOnly,
            },
            updateServiceController,
        );

        /*
         * =================================
         * ATIVAR / DESATIVAR
         * =================================
         */
        app.patch(
            "/:serviceId/status",
            {
                preHandler:
                    adminOnly,
            },
            updateServiceStatusController,
        );

        /*
         * =================================
         * PROMOÇÃO
         * =================================
         *
         * ATIVAR / ALTERAR:
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
        app.patch(
            "/:serviceId/promotion",
            {
                preHandler:
                    adminOnly,
            },
            updateServicePromotionController,
        );
    };