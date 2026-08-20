import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

export type DashboardMetrics = {
  appointmentsToday:
    number;

  pendingApproval:
    number;

  confirmedToday:
    number;

  cancelledToday:
    number;
};

export type DashboardPendingAppointment = {
  id:
    string;

  clientName:
    string;

  serviceName:
    string;

  startsAt:
    string;

  chargedPriceCents:
    number;

  /*
   * Origem do preço gravado
   * no momento do agendamento.
   *
   * SERVICE_DEFAULT
   * CLIENT_SPECIAL
   * PROMOTION
   */
  priceSource:
    AppointmentPriceSource;
};

export type DashboardSummary = {
  metrics:
    DashboardMetrics;

  pendingAppointments:
    DashboardPendingAppointment[];

  timezone:
    string;

  generatedAt:
    string;
};