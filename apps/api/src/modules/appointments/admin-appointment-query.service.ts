import type {
  Appointment,
} from "@priscila/shared";

import {
  mapAppointmentEntityToAppointment,
} from "./appointment.mapper.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

export type AdminDailyAppointmentsResult = {
  dateKey: string;

  appointments:
    Appointment[];
};

type FindDailyAppointmentsInput = {
  salonId: string;
  dateKey: string;
};

export class AdminAppointmentQueryService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),
  ) {}

  async findByDate(
    input: FindDailyAppointmentsInput,
  ): Promise<AdminDailyAppointmentsResult> {
    const {
      salonId,
      dateKey,
    } = input;

    if (
      !salonId ||
      salonId.trim().length ===
        0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    this.validateDateKey(
      dateKey,
    );

    /*
     * O Repository já retorna
     * startsAt em ordem ASC.
     *
     * Portanto:
     *
     * 08:00
     * 09:30
     * 13:00
     * ...
     */
    const appointmentEntities =
      await this.appointmentRepository
        .findByDateKey(
          salonId,
          dateKey,
        );

    /*
     * Nunca devolvemos Timestamp
     * do Firestore para a camada HTTP.
     */
    const appointments =
      appointmentEntities.map(
        mapAppointmentEntityToAppointment,
      );

    return {
      dateKey,
      appointments,
    };
  }

  private validateDateKey(
    dateKey: string,
  ): void {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/.exec(
        dateKey,
      );

    if (!match) {
      throw new Error(
        "Data inválida. Utilize o formato YYYY-MM-DD.",
      );
    }

    const year =
      Number(
        match[1],
      );

    const month =
      Number(
        match[2],
      );

    const day =
      Number(
        match[3],
      );

    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          12,
        ),
      );

    const valid =
      date.getUTCFullYear() ===
        year &&
      date.getUTCMonth() ===
        month - 1 &&
      date.getUTCDate() ===
        day;

    if (!valid) {
      throw new Error(
        "Data inválida.",
      );
    }
  }
}