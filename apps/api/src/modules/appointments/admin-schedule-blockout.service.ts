import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  APPOINTMENT_CONFIG,
  isBlockingAppointmentStatus,
} from "./appointment.config.js";

import {
  AppointmentDayTransactionService,
} from "./appointment-day-transaction.service.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

import {
  ScheduleBlockoutRepository,
} from "./schedule-blockout.repository.js";

/*
 * =================================
 * ERROS DO BLOQUEIO ADMINISTRATIVO
 * =================================
 */

export class AdminScheduleBlockoutAlreadyExistsError
  extends Error {
  constructor() {
    super(
      "Este horário já está bloqueado.",
    );

    this.name =
      "AdminScheduleBlockoutAlreadyExistsError";
  }
}

export class AdminScheduleBlockoutAppointmentConflictError
  extends Error {
  constructor() {
    super(
      "Não é possível bloquear este horário porque já existe um agendamento ocupando-o.",
    );

    this.name =
      "AdminScheduleBlockoutAppointmentConflictError";
  }
}

export class AdminScheduleBlockoutInvalidSlotError
  extends Error {
  constructor() {
    super(
      "O horário informado não faz parte dos horários disponíveis para esta data.",
    );

    this.name =
      "AdminScheduleBlockoutInvalidSlotError";
  }
}

export type AdminScheduleBlockout = {
  id:
    string;

  dateKey:
    string;

  startTime:
    string;

  reason:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

type ListBlockoutsInput = {
  salonId:
    string;

  dateKey:
    string;
};

type CreateBlockoutInput = {
  salonId:
    string;

  dateKey:
    string;

  startTime:
    string;

  reason:
    string;
};

type ReleaseBlockoutInput = {
  salonId:
    string;

  dateKey:
    string;

  startTime:
    string;
};

export class AdminScheduleBlockoutService {
  constructor(
    private readonly scheduleBlockoutRepository =
      new ScheduleBlockoutRepository(),

    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly dayTransactionService =
      new AppointmentDayTransactionService(),
  ) {}

  /*
   * =================================
   * LISTAR BLOQUEIOS DO DIA
   * =================================
   */
  async listByDate(
    input:
      ListBlockoutsInput,
  ): Promise<
    AdminScheduleBlockout[]
  > {
    this.ensureSalonId(
      input.salonId,
    );

    /*
     * Aproveitamos a mesma validação
     * usada na criação para garantir
     * que dateKey representa uma data
     * real.
     */
    this.parseDateKey(
      input.dateKey,
    );

    const blockouts =
      await this
        .scheduleBlockoutRepository
        .findByDateKey(
          input.salonId,
          input.dateKey,
        );

    return blockouts.map(
      (
        blockout,
      ) => ({
        id:
          blockout.id,

        dateKey:
          blockout.dateKey,

        startTime:
          blockout.startTime,

        reason:
          blockout.reason,

        createdAt:
          blockout
            .createdAt
            .toDate()
            .toISOString(),

        updatedAt:
          blockout
            .updatedAt
            .toDate()
            .toISOString(),
      }),
    );
  }

  /*
   * =================================
   * CRIAR BLOQUEIO MANUAL
   * =================================
   *
   * O ADMIN poderá criar diretamente
   * pela futura página:
   *
   * /admin/bloqueios
   *
   * Exemplo:
   *
   * 22/08/2026
   * 13:00
   * Compromisso pessoal
   *
   * Não existe Appointment envolvido.
   */
  async create(
    input:
      CreateBlockoutInput,
  ): Promise<
    AdminScheduleBlockout
  > {
    this.ensureSalonId(
      input.salonId,
    );

    const reason =
      input.reason.trim();

    if (
      reason.length <
      3
    ) {
      throw new Error(
        "Informe um motivo para o bloqueio.",
      );
    }

    if (
      reason.length >
      500
    ) {
      throw new Error(
        "O motivo do bloqueio deve possuir no máximo 500 caracteres.",
      );
    }

    /*
     * Não permitimos horários
     * arbitrários.
     *
     * O horário deve existir na
     * configuração oficial daquele
     * dia da semana.
     *
     * Segunda a sexta:
     * 08:00, 13:00, 17:00
     *
     * Sábado:
     * 07:00, 08:00, 13:00, 17:00
     */
    this.ensureValidConfiguredSlot(
      input.dateKey,
      input.startTime,
    );

    const blockoutId =
      this
        .scheduleBlockoutRepository
        .buildId(
          input.salonId,
          input.dateKey,
          input.startTime,
        );

    const now =
      Timestamp.now();

    await this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            input.dateKey,
        },

        async (
          transaction,
        ) => {
          /*
           * =================================
           * LEITURAS
           * =================================
           *
           * Todas acontecem antes
           * de qualquer escrita.
           */

          const existingBlockout =
            await this
              .scheduleBlockoutRepository
              .findBySlotInTransaction(
                transaction,

                input.salonId,

                input.dateKey,

                input.startTime,
              );

          if (
            existingBlockout
          ) {
            throw new AdminScheduleBlockoutAlreadyExistsError();
          }

          const appointments =
            await this
              .appointmentRepository
              .findByDateKeyInTransaction(
                transaction,

                input.salonId,

                input.dateKey,
              );

          /*
           * Não queremos permitir que
           * o ADMIN crie um bloqueio
           * em cima de:
           *
           * PENDING_APPROVAL
           * CONFIRMED
           * IN_PROGRESS
           *
           * REJECTED, CANCELLED e
           * COMPLETED não ocupam
           * o horário.
           */
          const hasBlockingAppointment =
            appointments
              .filter(
                (
                  appointment,
                ) =>
                  isBlockingAppointmentStatus(
                    appointment.status,
                  ),
              )
              .some(
                (
                  appointment,
                ) =>
                  this.dateToLocalTime(
                    appointment
                      .startsAt
                      .toDate(),
                  ) ===
                  input.startTime,
              );

          if (
            hasBlockingAppointment
          ) {
            throw new AdminScheduleBlockoutAppointmentConflictError();
          }

          /*
           * =================================
           * ESCRITA
           * =================================
           */
          this
            .scheduleBlockoutRepository
            .createInTransaction(
              transaction,

              {
                salonId:
                  input.salonId,

                dateKey:
                  input.dateKey,

                startTime:
                  input.startTime,

                reason,

                createdAt:
                  now,

                updatedAt:
                  now,
              },
            );
        },
      );

    return {
      id:
        blockoutId,

      dateKey:
        input.dateKey,

      startTime:
        input.startTime,

      reason,

      createdAt:
        now
          .toDate()
          .toISOString(),

      updatedAt:
        now
          .toDate()
          .toISOString(),
    };
  }

  /*
   * =================================
   * LIBERAR HORÁRIO
   * =================================
   */
  async release(
    input:
      ReleaseBlockoutInput,
  ): Promise<void> {
    this.ensureSalonId(
      input.salonId,
    );

    /*
     * Também validamos data e horário
     * antes de entrar na Transaction.
     */
    this.ensureValidConfiguredSlot(
      input.dateKey,
      input.startTime,
    );

    await this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            input.dateKey,
        },

        async (
          transaction,
        ) => {
          /*
           * Como o ID é determinístico,
           * remover um documento que não
           * existe não deve causar
           * inconsistência de agenda.
           */
          this
            .scheduleBlockoutRepository
            .deleteInTransaction(
              transaction,

              input.salonId,

              input.dateKey,

              input.startTime,
            );
        },
      );
  }

  /*
   * =================================
   * SALÃO
   * =================================
   */
  private ensureSalonId(
    salonId:
      string,
  ): void {
    if (
      !salonId ||
      salonId.trim().length ===
        0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }
  }

  /*
   * =================================
   * VALIDAR HORÁRIO OFICIAL
   * =================================
   */
  private ensureValidConfiguredSlot(
    dateKey:
      string,

    startTime:
      string,
  ): void {
    const date =
      this.parseDateKey(
        dateKey,
      );

    const weekDay =
      date.getUTCDay();

    const configuredStartTimes =
      APPOINTMENT_CONFIG
        .startTimesByWeekDay[
          weekDay
        ];

    if (
      !configuredStartTimes ||
      !configuredStartTimes.some(
        (
          configuredStartTime,
        ) =>
          configuredStartTime ===
          startTime,
      )
    ) {
      throw new AdminScheduleBlockoutInvalidSlotError();
    }
  }

  /*
   * =================================
   * DATA
   * =================================
   */
  private parseDateKey(
    dateKey:
      string,
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

    const yearText =
      match[1];

    const monthText =
      match[2];

    const dayText =
      match[3];

    if (
      yearText ===
        undefined ||
      monthText ===
        undefined ||
      dayText ===
        undefined
    ) {
      throw new Error(
        "Data inválida. Utilize o formato YYYY-MM-DD.",
      );
    }

    const year =
      Number(
        yearText,
      );

    const month =
      Number(
        monthText,
      );

    const day =
      Number(
        dayText,
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

  /*
   * =================================
   * HORÁRIO LOCAL DO APPOINTMENT
   * =================================
   */
  private dateToLocalTime(
    date:
      Date,
  ): string {
    const formatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            APPOINTMENT_CONFIG
              .timeZone,

          hour:
            "2-digit",

          minute:
            "2-digit",

          hourCycle:
            "h23",
        },
      );

    const parts =
      formatter
        .formatToParts(
          date,
        );

    const hourPart =
      parts.find(
        (
          part,
        ) =>
          part.type ===
          "hour",
      );

    const minutePart =
      parts.find(
        (
          part,
        ) =>
          part.type ===
          "minute",
      );

    if (
      !hourPart ||
      !minutePart
    ) {
      throw new Error(
        "Não foi possível interpretar o horário do agendamento.",
      );
    }

    return `${hourPart.value}:${minutePart.value}`;
  }
}