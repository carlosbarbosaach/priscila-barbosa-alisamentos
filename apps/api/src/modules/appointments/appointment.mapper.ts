import type {
  Appointment,
} from "@priscila/shared";

import type {
  AppointmentEntity,
} from "./appointment.types.js";

export function mapAppointmentEntityToAppointment(
  appointment:
    AppointmentEntity,
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
      appointment
        .startsAt
        .toDate()
        .toISOString(),

    endsAt:
      appointment
        .endsAt
        .toDate()
        .toISOString(),

    durationMinutes:
      appointment.durationMinutes,

    clientNameSnapshot:
      appointment
        .clientNameSnapshot,

    clientPhoneSnapshot:
      appointment
        .clientPhoneSnapshot,

    serviceNameSnapshot:
      appointment
        .serviceNameSnapshot,

    /*
     * Agendamentos antigos não possuem
     * este snapshot.
     */
    servicePriceTypeSnapshot:
      appointment
        .servicePriceTypeSnapshot ??
      null,

    chargedPriceCents:
      appointment
        .chargedPriceCents,

    priceSource:
      appointment.priceSource,

    rejectionReason:
      appointment
        .rejectionReason,

    /*
     * =================================
     * CANCELAMENTO
     * =================================
     *
     * Compatibilidade com documentos
     * antigos:
     *
     * undefined
     * ↓
     * null
     */
    cancelledBy:
      appointment
        .cancelledBy ??
      null,

    cancelledAt:
      appointment
        .cancelledAt
        ? appointment
            .cancelledAt
            .toDate()
            .toISOString()
        : null,

    cancellationReason:
      appointment
        .cancellationReason ??
      null,

    createdAt:
      appointment
        .createdAt
        .toDate()
        .toISOString(),

    updatedAt:
      appointment
        .updatedAt
        .toDate()
        .toISOString(),
  };
}