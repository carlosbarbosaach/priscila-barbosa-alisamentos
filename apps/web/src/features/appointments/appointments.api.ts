import type {
  Appointment,
  ClientBookableService,
} from "@priscila/shared";

import {
  apiFetch,
} from "@/services/api/api-client";

/*
 * ==============================
 * CLIENT — SERVIÇOS
 * ==============================
 */

type ClientBookableServicesResponse = {
  services: ClientBookableService[];
};

export async function getClientBookableServices():
  Promise<ClientBookableService[]> {
  const response =
    await apiFetch<ClientBookableServicesResponse>(
      "/appointments/services",
    );

  return response.services;
}

/*
 * ==============================
 * CLIENT — MEUS AGENDAMENTOS
 * ==============================
 */

export type ClientAppointmentsResponse = {
  nextAppointment:
    Appointment | null;

  upcoming:
    Appointment[];

  history:
    Appointment[];
};

export async function getClientAppointments():
  Promise<ClientAppointmentsResponse> {
  return apiFetch<ClientAppointmentsResponse>(
    "/appointments/mine",
  );
}

/*
 * ==============================
 * CLIENT — DISPONIBILIDADE
 * ==============================
 */

export type AppointmentAvailabilitySlot = {
  startTime: string;
  endTime: string;
};

export type AppointmentAvailability = {
  serviceId: string;

  serviceName: string;

  dateKey: string;

  durationMinutes: number;

  slots:
    AppointmentAvailabilitySlot[];
};

type AppointmentAvailabilityResponse = {
  availability:
    AppointmentAvailability;
};

export type GetAppointmentAvailabilityInput = {
  serviceId: string;

  dateKey: string;
};

export async function getAppointmentAvailability(
  input: GetAppointmentAvailabilityInput,
): Promise<AppointmentAvailability> {
  const params =
    new URLSearchParams({
      serviceId:
        input.serviceId,

      dateKey:
        input.dateKey,
    });

  const response =
    await apiFetch<AppointmentAvailabilityResponse>(
      `/appointments/availability?${params.toString()}`,
    );

  return response.availability;
}

/*
 * ==============================
 * CLIENT — CRIAR AGENDAMENTO
 * ==============================
 */

export type CreateAppointmentInput = {
  serviceId: string;

  dateKey: string;

  startTime: string;
};

type AppointmentResponse = {
  appointment: Appointment;
};

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const response =
    await apiFetch<AppointmentResponse>(
      "/appointments/",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            input,
          ),
      },
    );

  return response.appointment;
}

/*
 * ==============================
 * ADMIN — AGENDA DO DIA
 * ==============================
 */

type AdminAppointmentsResponse = {
  dateKey: string;

  appointments:
    Appointment[];
};

export async function getAdminAppointments(
  dateKey: string,
): Promise<Appointment[]> {
  const params =
    new URLSearchParams({
      dateKey,
    });

  const response =
    await apiFetch<AdminAppointmentsResponse>(
      `/admin/appointments?${params.toString()}`,
    );

  return response.appointments;
}

/*
 * ==============================
 * ADMIN — CONFIRMAR
 * ==============================
 */

export async function confirmAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response =
    await apiFetch<AppointmentResponse>(
      `/admin/appointments/${appointmentId}/confirm`,
      {
        method:
          "PATCH",
      },
    );

  return response.appointment;
}

/*
 * ==============================
 * ADMIN — RECUSAR
 * ==============================
 */

export type RejectAppointmentInput = {
  appointmentId: string;

  rejectionReason: string;
};

export async function rejectAppointment(
  input: RejectAppointmentInput,
): Promise<Appointment> {
  const response =
    await apiFetch<AppointmentResponse>(
      `/admin/appointments/${input.appointmentId}/reject`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            rejectionReason:
              input.rejectionReason,
          }),
      },
    );

  return response.appointment;
}