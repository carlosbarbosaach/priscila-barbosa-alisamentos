import type {
  AppointmentPriceSource,
  AppointmentStatus,
  ServicePriceType,
} from "@priscila/shared";

import type {
  Timestamp,
} from "firebase-admin/firestore";

export type AppointmentOccupancyIntervalDocument = {
  startOffsetMinutes: number;

  endOffsetMinutes: number;
};

export type AppointmentDocument = {
  salonId: string;

  clientId: string;
  serviceId: string;

  status: AppointmentStatus;

  dateKey: string;

  startsAt: Timestamp;
  endsAt: Timestamp;

  durationMinutes: number;

  professionalOccupancySnapshot?:
    AppointmentOccupancyIntervalDocument[];

  clientNameSnapshot: string;
  clientPhoneSnapshot: string;

  serviceNameSnapshot: string;

  /*
   * Opcional no Firestore para manter
   * compatibilidade com agendamentos
   * criados antes desta alteração.
   */
  servicePriceTypeSnapshot?:
    ServicePriceType;

  chargedPriceCents: number;

  priceSource:
    AppointmentPriceSource;

  rejectionReason:
    string | null;

  cancellationReason:
    string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AppointmentEntity =
  AppointmentDocument & {
    id: string;
  };