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
  getClientServicePriceOverviewController,
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

export const clientServicePriceRoutes:
  FastifyPluginAsync =
    async (app) => {
      /*
       * ==============================
       * VISÃO GERAL DOS PREÇOS
       * ==============================
       *
       * GET
       *
       * /api/v1/admin/clients/
       * service-prices/overview
       *
       * Utilizado por:
       *
       * /admin/precos-especiais
       */
      app.get(
        "/service-prices/overview",
        {
          preHandler:
            adminOnly,
        },
        getClientServicePriceOverviewController,
      );

      /*
       * ==============================
       * TODOS OS PREÇOS
       * ==============================
       */
      app.get(
        "/service-prices",
        {
          preHandler:
            adminOnly,
        },
        listAllClientServicePricesController,
      );

      /*
       * ==============================
       * PREÇOS DE UMA CLIENTE
       * ==============================
       */
      app.get(
        "/:clientId/service-prices",
        {
          preHandler:
            adminOnly,
        },
        listClientServicePricesController,
      );

      /*
       * ==============================
       * CRIAR / ATUALIZAR
       * ==============================
       */
      app.put(
        "/:clientId/service-prices/:serviceId",
        {
          preHandler:
            adminOnly,
        },
        saveClientServicePriceController,
      );

      /*
       * ==============================
       * ATIVAR / DESATIVAR
       * ==============================
       */
      app.patch(
        "/:clientId/service-prices/:serviceId/status",
        {
          preHandler:
            adminOnly,
        },
        updateClientServicePriceStatusController,
      );
    };