import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

import type {
  AppointmentStatus,
} from "../enums/appointment-status.js";

import type {
  ServicePriceType,
} from "./service.js";

/*
 * =================================
 * ORIGEM DO CANCELAMENTO
 * =================================
 *
 * CLIENT
 * → cancelado pela própria cliente.
 *
 * ADMIN
 * → cancelado pela administração.
 */
export const APPOINTMENT_CANCELLED_BY = {
  CLIENT:
    "CLIENT",

  ADMIN:
    "ADMIN",
} as const;

export type AppointmentCancelledBy =
  typeof APPOINTMENT_CANCELLED_BY[
    keyof typeof APPOINTMENT_CANCELLED_BY
  ];

export type Appointment = {
  id:
    string;

  salonId:
    string;

  /*
   * Referências atuais.
   */
  clientId:
    string;

  serviceId:
    string;

  /*
   * Ciclo de vida.
   */
  status:
    AppointmentStatus;

  /*
   * Horário efetivamente reservado.
   */
  startsAt:
    string;

  endsAt:
    string;

  /*
   * Snapshot da duração.
   */
  durationMinutes:
    number;

  /*
   * Snapshots da cliente.
   */
  clientNameSnapshot:
    string;

  clientPhoneSnapshot:
    string;

  /*
   * Snapshot do serviço.
   */
  serviceNameSnapshot:
    string;

  /*
   * Tipo de preço que o serviço
   * possuía no momento do agendamento.
   *
   * FIXED
   * STARTING_FROM
   *
   * null:
   * agendamento antigo criado antes
   * deste campo existir.
   */
  servicePriceTypeSnapshot:
    ServicePriceType | null;

  /*
   * Preço aplicado no momento
   * da criação do agendamento.
   *
   * Para STARTING_FROM este valor
   * representa inicialmente o
   * valor base.
   */
  chargedPriceCents:
    number;

  /*
   * SERVICE_DEFAULT
   * CLIENT_SPECIAL
   * PROMOTION
   */
  priceSource:
    AppointmentPriceSource;

  /*
   * =================================
   * RECUSA
   * =================================
   *
   * Utilizado quando o salão
   * recusa uma solicitação.
   */
  rejectionReason:
    string | null;

  /*
   * =================================
   * CANCELAMENTO
   * =================================
   *
   * CLIENT
   * → cliente cancelou.
   *
   * ADMIN
   * → administração cancelou.
   *
   * null
   * → agendamento nunca foi cancelado
   *   ou é um registro antigo.
   */
  cancelledBy:
    AppointmentCancelledBy | null;

  /*
   * Data/hora exata em que
   * ocorreu o cancelamento.
   */
  cancelledAt:
    string | null;

  /*
   * CLIENT:
   * inicialmente poderá ser null.
   *
   * ADMIN:
   * posteriormente será obrigatório
   * pela regra de negócio.
   */
  cancellationReason:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};