import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

import type {
  AppointmentStatus,
} from "../enums/appointment-status.js";

import type {
  ServicePriceType,
} from "./service.js";

export type Appointment = {
  id: string;

  salonId: string;

  /*
   * Referências atuais.
   */
  clientId: string;
  serviceId: string;

  /*
   * Ciclo de vida.
   */
  status: AppointmentStatus;

  /*
   * Horário efetivamente reservado.
   */
  startsAt: string;
  endsAt: string;

  /*
   * Snapshot da duração.
   */
  durationMinutes: number;

  /*
   * Snapshots da cliente.
   */
  clientNameSnapshot: string;
  clientPhoneSnapshot: string;

  /*
   * Snapshot do serviço.
   */
  serviceNameSnapshot: string;

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
  chargedPriceCents: number;

  /*
   * SERVICE_DEFAULT
   * CLIENT_SPECIAL
   */
  priceSource:
    AppointmentPriceSource;

  rejectionReason:
    string | null;

  cancellationReason:
    string | null;

  createdAt: string;
  updatedAt: string;
};