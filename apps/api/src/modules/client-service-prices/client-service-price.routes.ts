import { USER_ROLES } from "@priscila/shared";

import type {
    FastifyPluginAsync,
} from "fastify";

import { authenticate } from "../../shared/middleware/authenticate.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";

import {
    listAllClientServicePricesController,
    listClientServicePricesController,
    saveClientServicePriceController,
    updateClientServicePriceStatusController,
} from "./client-service-price.controller.js";

const adminOnly = [
    authenticate,
    requireRole([
        USER_ROLES.ADMIN,
    ]),
];

export const clientServicePriceRoutes: FastifyPluginAsync =
    async (app) => {
        /**
         * Lista todos os preços especiais
         * pertencentes ao salão autenticado.
         *
         * GET
         * /api/v1/admin/clients/service-prices
         */
        app.get(
            "/service-prices",
            {
                preHandler: adminOnly,
            },
            listAllClientServicePricesController,
        );

        /**
         * Lista os preços especiais
         * de uma cliente específica.
         *
         * GET
         * /api/v1/admin/clients/:clientId/service-prices
         */
        app.get(
            "/:clientId/service-prices",
            {
                preHandler: adminOnly,
            },
            listClientServicePricesController,
        );

        /**
         * Cria ou atualiza o preço especial
         * de uma cliente para um serviço.
         *
         * PUT
         * /api/v1/admin/clients/:clientId/service-prices/:serviceId
         */
        app.put(
            "/:clientId/service-prices/:serviceId",
            {
                preHandler: adminOnly,
            },
            saveClientServicePriceController,
        );

        /**
         * Ativa ou desativa um preço especial.
         *
         * PATCH
         * /api/v1/admin/clients/:clientId/service-prices/:serviceId/status
         */
        app.patch(
            "/:clientId/service-prices/:serviceId/status",
            {
                preHandler: adminOnly,
            },
            updateClientServicePriceStatusController,
        );
    };