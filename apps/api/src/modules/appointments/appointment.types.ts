import type {
  AppointmentPriceSource,
  AppointmentStatus,
} from "@priscila/shared";

import type {
  Timestamp,
} from "firebase-admin/firestore";

export type AppointmentOccupancyIntervalDocument = {
  /*
   * Minutos relativos ao início
   * do agendamento.
   *
   * Exemplo:
   *
   * Agendamento 08:00
   *
   * 0 → 60
   * representa 08:00 → 09:00.
   */
  startOffsetMinutes: number;

  endOffsetMinutes: number;
};

export type AppointmentDocument = {
  salonId: string;

  clientId: string;
  serviceId: string;

  status: AppointmentStatus;

  /*
   * Data local do salão.
   *
   * Exemplo:
   * 2026-08-18
   */
  dateKey: string;

  startsAt: Timestamp;
  endsAt: Timestamp;

  durationMinutes: number;

  /*
   * Snapshot dos períodos em que
   * a profissional fica ocupada.
   *
   * Ficará independente de futuras
   * alterações nas fases do serviço.
   *
   * Opcional temporariamente para
   * compatibilidade/fallback.
   */
  professionalOccupancySnapshot?:
    AppointmentOccupancyIntervalDocument[];

  /*
   * Snapshots históricos.
   */
  clientNameSnapshot: string;
  clientPhoneSnapshot: string;

  serviceNameSnapshot: string;

  chargedPriceCents: number;

  priceSource: AppointmentPriceSource;

  rejectionReason: string | null;
  cancellationReason: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AppointmentEntity =
  AppointmentDocument & {
    id: string;
  };