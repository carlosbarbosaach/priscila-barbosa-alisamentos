import type {
  Appointment,
} from "@priscila/shared";

import type {
  AppointmentEntity,
} from "./appointment.types.js";

export function mapAppointmentEntityToAppointment(
  appointment: AppointmentEntity,
): Appointment {
  return {
    id:
      appointment.id,

    salonId:
      appointment.salonId,

    clientId:
      appointment.clientId,

    serviceId:
      appointment.serviceId,

    status:
      appointment.status,

    startsAt:
      appointment.startsAt
        .toDate()
        .toISOString(),

    endsAt:
      appointment.endsAt
        .toDate()
        .toISOString(),

    durationMinutes:
      appointment.durationMinutes,

    clientNameSnapshot:
      appointment.clientNameSnapshot,

    clientPhoneSnapshot:
      appointment.clientPhoneSnapshot,

    serviceNameSnapshot:
      appointment.serviceNameSnapshot,

    chargedPriceCents:
      appointment.chargedPriceCents,

    priceSource:
      appointment.priceSource,

    rejectionReason:
      appointment.rejectionReason,

    cancellationReason:
      appointment.cancellationReason,

    createdAt:
      appointment.createdAt
        .toDate()
        .toISOString(),

    updatedAt:
      appointment.updatedAt
        .toDate()
        .toISOString(),
  };
}