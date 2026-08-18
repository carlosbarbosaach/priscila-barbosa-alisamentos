import type {
  ServicePhase,
} from "@priscila/shared";

import {
  APPOINTMENT_CONFIG,
} from "./appointment.config.js";

import {
  AppointmentConflictService,
} from "./appointment-conflict.service.js";

import {
  AppointmentOccupancyService,
} from "./appointment-occupancy.service.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

import type {
  AvailabilitySlot,
} from "./appointment-availability.types.js";

type GenerateSlotsInput = {
  dateKey: string;
  durationMinutes: number;
};

type GetAvailableSlotsInput = {
  dateKey: string;

  durationMinutes: number;

  /*
   * Fases do serviço que a cliente
   * está tentando agendar.
   */
  phases: ServicePhase[];
};

export class AppointmentAvailabilityService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly occupancyService =
      new AppointmentOccupancyService(),

    private readonly conflictService =
      new AppointmentConflictService(),
  ) { }

  /*
   * Gera a grade inicial considerando:
   *
   * - dias de atendimento;
   * - abertura;
   * - fechamento;
   * - intervalo dos slots;
   * - duração total do serviço.
   */
  generatePossibleSlots(
    input: GenerateSlotsInput,
  ): AvailabilitySlot[] {
    const {
      dateKey,
      durationMinutes,
    } = input;

    if (
      !Number.isInteger(
        durationMinutes,
      ) ||
      durationMinutes <= 0
    ) {
      throw new Error(
        "A duração do serviço deve ser maior que zero.",
      );
    }

    const date =
      this.parseDateKey(
        dateKey,
      );

    const weekDay =
      date.getUTCDay();

    const isWorkingDay =
      APPOINTMENT_CONFIG
        .workingWeekDays
        .some(
          (day) =>
            day === weekDay,
        );

    if (!isWorkingDay) {
      return [];
    }

    const openingMinutes =
      this.timeToMinutes(
        APPOINTMENT_CONFIG
          .openingTime,
      );

    const closingMinutes =
      this.timeToMinutes(
        APPOINTMENT_CONFIG
          .closingTime,
      );

    const slotIntervalMinutes =
      APPOINTMENT_CONFIG
        .slotIntervalMinutes;

    /*
     * O serviço inteiro precisa terminar
     * dentro do expediente.
     */
    if (
      durationMinutes >
      closingMinutes -
      openingMinutes
    ) {
      return [];
    }

    const slots:
      AvailabilitySlot[] =
      [];

    const lastPossibleStart =
      closingMinutes -
      durationMinutes;

    for (
      let startMinutes =
        openingMinutes;

      startMinutes <=
      lastPossibleStart;

      startMinutes +=
      slotIntervalMinutes
    ) {
      const endMinutes =
        startMinutes +
        durationMinutes;

      slots.push({
        dateKey,

        startTime:
          this.minutesToTime(
            startMinutes,
          ),

        endTime:
          this.minutesToTime(
            endMinutes,
          ),

        startMinutes,
        endMinutes,
      });
    }

    return slots;
  }

  /*
   * Retorna os horários realmente
   * disponíveis para determinado
   * serviço e salão.
   */
  async getAvailableSlotsForSalon(
    salonId: string,
    input: GetAvailableSlotsInput,
  ): Promise<AvailabilitySlot[]> {
    /*
     * 1. Gera todos os horários
     * teoricamente possíveis.
     */
    const possibleSlots =
      this.generatePossibleSlots({
        dateKey:
          input.dateKey,

        durationMinutes:
          input.durationMinutes,
      });

    if (
      possibleSlots.length ===
      0
    ) {
      return [];
    }

    /*
     * 2. Descobre quais períodos do
     * NOVO serviço realmente ocupam
     * a profissional.
     */
    const candidateOccupancy =
      this.occupancyService
        .buildProfessionalOccupancy({
          durationMinutes:
            input.durationMinutes,

          phases:
            input.phases,
        });

    /*
     * Se nenhuma fase ocupa a
     * profissional, não existe conflito
     * com outros atendimentos.
     */
    if (
      candidateOccupancy.length ===
      0
    ) {
      return possibleSlots;
    }

    /*
     * 3. Busca todos os agendamentos
     * daquele salão e daquele dia.
     */
    const appointments =
      await this.appointmentRepository
        .findByDateKey(
          salonId,
          input.dateKey,
        );

    /*
     * 4. O ConflictService agora é
     * responsável por toda a regra
     * de colisão.
     *
     * Não duplicamos mais essa lógica
     * dentro do AvailabilityService.
     */
    return possibleSlots.filter(
      (slot) =>
        !this.conflictService
          .hasConflictAtLocalStart({
            candidateStartMinutes:
              slot.startMinutes,

            candidateDurationMinutes:
              input.durationMinutes,

            candidateOccupancy,

            appointments,
          }),
    );
  }

  private parseDateKey(
    dateKey: string,
  ): Date {
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
          0,
          0,
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

    return date;
  }

  private timeToMinutes(
    time: string,
  ): number {
    const match =
      /^(\d{2}):(\d{2})$/.exec(
        time,
      );

    if (!match) {
      throw new Error(
        "Horário de configuração inválido.",
      );
    }

    const hours =
      Number(
        match[1],
      );

    const minutes =
      Number(
        match[2],
      );

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error(
        "Horário de configuração inválido.",
      );
    }

    return (
      hours * 60 +
      minutes
    );
  }

  private minutesToTime(
    totalMinutes: number,
  ): string {
    const hours =
      Math.floor(
        totalMinutes / 60,
      );

    const minutes =
      totalMinutes % 60;

    return `${String(
      hours,
    ).padStart(
      2,
      "0",
    )}:${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}`;
  }
}