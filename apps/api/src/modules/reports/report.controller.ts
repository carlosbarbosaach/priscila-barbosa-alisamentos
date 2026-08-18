import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  z,
} from "zod";

import {
  ReportService,
} from "./report.service.js";

const reportService =
  new ReportService();

const dateSchema =
  z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Utilize o formato YYYY-MM-DD.",
    );

const reportQuerySchema =
  z.object({
    startDate:
      dateSchema,

    endDate:
      dateSchema,
  });

export async function getAdminReportSummaryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const appUser =
    request.appUser;

  if (!appUser) {
    return reply
      .status(403)
      .send({
        message:
          "Perfil administrativo não encontrado.",
      });
  }

  const salonId =
    appUser.salonId;

  if (
    !salonId ||
    salonId.trim().length === 0
  ) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    reportQuerySchema.safeParse(
      request.query,
    );

  if (
    !parsedQuery.success
  ) {
    return reply
      .status(400)
      .send({
        message:
          "Período do relatório inválido.",

        issues:
          parsedQuery.error
            .issues,
      });
  }

  const {
    startDate,
    endDate,
  } = parsedQuery.data;

  if (
    startDate >
    endDate
  ) {
    return reply
      .status(400)
      .send({
        message:
          "A data inicial não pode ser posterior à data final.",
      });
  }

  const report =
    await reportService
      .getSummary({
        salonId,

        startDate,

        endDate,
      });

  return reply.send(
    report,
  );
}