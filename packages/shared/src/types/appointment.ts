import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

import type {
  AppointmentStatus,
} from "../enums/appointment-status.js";

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
   *
   * No shared usamos ISO string.
   * O backend converterá Firestore
   * Timestamp ↔ ISO.
   */
  startsAt: string;
  endsAt: string;

  /*
   * Snapshot da duração.
   *
   * Se futuramente o serviço mudar
   * de 3h para 2h30, o agendamento
   * antigo continua correto.
   */
  durationMinutes: number;

  /*
   * Snapshots da cliente.
   *
   * Mesmo que ela altere nome ou
   * telefone posteriormente, o
   * histórico daquele atendimento
   * continua representando o momento
   * em que foi agendado.
   */
  clientNameSnapshot: string;
  clientPhoneSnapshot: string;

  /*
   * Snapshot do serviço.
   */
  serviceNameSnapshot: string;

  /*
   * Preço efetivamente aplicado.
   *
   * Nunca recalcularemos o histórico
   * usando o preço atual do serviço.
   */
  chargedPriceCents: number;

  /*
   * Explica como chegamos ao preço:
   *
   * SERVICE_DEFAULT
   * ou
   * CLIENT_SPECIAL
   */
  priceSource: AppointmentPriceSource;

  /*
   * Preenchido quando o salão
   * recusa uma solicitação.
   */
  rejectionReason: string | null;

  /*
   * Preenchido caso um agendamento
   * seja posteriormente cancelado.
   */
  cancellationReason: string | null;

  createdAt: string;
  updatedAt: string;
};