import {
  addDays,
  startOfDay,
} from "date-fns";

import {
  fromZonedTime,
  toZonedTime,
} from "date-fns-tz";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  AppointmentRepository,
} from "../appointments/appointment.repository.js";

import {
  SalonRepository,
} from "../salons/salon.repository.js";

import {
  DashboardRepository,
} from "./dashboard.repository.js";

import type {
  DashboardPendingAppointment,
  DashboardSummary,
} from "./dashboard.types.js";

export class DashboardService {
  constructor(
    private readonly dashboardRepository =
      new DashboardRepository(),

    private readonly salonRepository =
      new SalonRepository(),

    private readonly appointmentRepository =
      new AppointmentRepository(),
  ) {}

  async getSummary(
    salonId:
      string,
  ): Promise<
    DashboardSummary
  > {
    /*
     * Primeiro validamos
     * o salão.
     */
    const salon =
      await this
        .salonRepository
        .findById(
          salonId,
        );

    if (!salon) {
      throw new Error(
        "Salão não encontrado.",
      );
    }

    if (!salon.active) {
      throw new Error(
        "Salão inativo.",
      );
    }

    const now =
      new Date();

    /*
     * =================================
     * INTERVALO DE HOJE
     * =================================
     *
     * As métricas precisam respeitar
     * o timezone configurado
     * no salão.
     */
    const zonedNow =
      toZonedTime(
        now,
        salon.timezone,
      );

    const zonedStartOfDay =
      startOfDay(
        zonedNow,
      );

    const zonedStartOfNextDay =
      addDays(
        zonedStartOfDay,
        1,
      );

    const startAt =
      Timestamp.fromDate(
        fromZonedTime(
          zonedStartOfDay,
          salon.timezone,
        ),
      );

    const endAt =
      Timestamp.fromDate(
        fromZonedTime(
          zonedStartOfNextDay,
          salon.timezone,
        ),
      );

    /*
     * =================================
     * CONSULTAS
     * =================================
     *
     * Métricas e solicitações
     * pendentes são independentes.
     *
     * Executamos ambas em paralelo.
     */
    const [
      metrics,
      pendingAppointmentEntities,
    ] =
      await Promise.all([
        this
          .dashboardRepository
          .getMetrics(
            salonId,
            {
              startAt,
              endAt,
            },
          ),

        this
          .appointmentRepository
          .findPendingApprovalBySalon(
            salonId,
          ),
      ]);

    /*
     * =================================
     * SOLICITAÇÕES PENDENTES
     * =================================
     *
     * Nunca enviamos AppointmentDocument
     * cru para o frontend.
     *
     * Criamos um DTO específico
     * para o Dashboard.
     */
    const pendingAppointments:
      DashboardPendingAppointment[] =
      pendingAppointmentEntities.map(
        (
          appointment,
        ) => ({
          id:
            appointment.id,

          clientName:
            appointment
              .clientNameSnapshot,

          serviceName:
            appointment
              .serviceNameSnapshot,

          startsAt:
            appointment
              .startsAt
              .toDate()
              .toISOString(),

          chargedPriceCents:
            appointment
              .chargedPriceCents,

          /*
           * Muito importante:
           *
           * preservamos a origem
           * histórica do preço.
           *
           * Assim, mesmo que a promoção
           * seja retirada posteriormente
           * do serviço, este agendamento
           * continuará sabendo que foi
           * realizado com promoção.
           */
          priceSource:
            appointment
              .priceSource,
        }),
      );

    return {
      metrics: {
        ...metrics,

        /*
         * O contador representa todas
         * as solicitações que realmente
         * aguardam ação, independente
         * da data.
         */
        pendingApproval:
          pendingAppointments
            .length,
      },

      pendingAppointments,

      timezone:
        salon.timezone,

      generatedAt:
        now
          .toISOString(),
    };
  }
}