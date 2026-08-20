import type {
  Appointment,
  AppointmentPriceSource,
  AppointmentStatus,
  ServicePriceType,
} from "@priscila/shared";

import type {
  Timestamp,
} from "firebase-admin/firestore";

export type AppointmentOccupancyIntervalDocument = {
  startOffsetMinutes:
    number;

  endOffsetMinutes:
    number;
};

export type AppointmentDocument = {
  salonId:
    string;

  clientId:
    string;

  serviceId:
    string;

  status:
    AppointmentStatus;

  dateKey:
    string;

  startsAt:
    Timestamp;

  endsAt:
    Timestamp;

  durationMinutes:
    number;

  professionalOccupancySnapshot?:
    AppointmentOccupancyIntervalDocument[];

  clientNameSnapshot:
    string;

  clientPhoneSnapshot:
    string;

  serviceNameSnapshot:
    string;

  /*
   * Opcional no Firestore para manter
   * compatibilidade com agendamentos
   * criados antes desta alteração.
   */
  servicePriceTypeSnapshot?:
    ServicePriceType;

  chargedPriceCents:
    number;

  priceSource:
    AppointmentPriceSource;

  rejectionReason:
    string | null;

  /*
   * =================================
   * CANCELAMENTO
   * =================================
   *
   * Todos estes campos permanecem
   * opcionais no documento porque
   * agendamentos antigos do Firestore
   * não possuem esses dados.
   */

  cancelledBy?:
    Appointment["cancelledBy"];

  cancelledAt?:
    Timestamp | null;

  cancellationReason?:
    string | null;

  createdAt:
    Timestamp;

  updatedAt:
    Timestamp;
};

export type AppointmentEntity =
  AppointmentDocument & {
    id:
      string;
  };