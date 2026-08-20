import {
  APPOINTMENT_CANCELLED_BY,
  APPOINTMENT_PRICE_SOURCE,
  APPOINTMENT_STATUS,
  SERVICE_PRICE_TYPES,
} from "@priscila/shared";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  APPOINTMENT_CONFIG,
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

import type {
  AppointmentEntity,
} from "./appointment.types.js";

/*
 * Appointment não existe
 * ou não pertence ao salão
 * do ADMIN autenticado.
 */
export class AdminAppointmentNotFoundError
  extends Error {
  constructor() {
    super(
      "Agendamento não encontrado.",
    );

    this.name =
      "AdminAppointmentNotFoundError";
  }
}

/*
 * O Appointment não está no status
 * necessário para executar determinada
 * ação administrativa.
 */
export class AdminAppointmentInvalidStatusError
  extends Error {
  constructor(
    currentStatus:
      string,
  ) {
    super(
      `Esta ação não pode ser realizada porque o agendamento está com status ${currentStatus}.`,
    );

    this.name =
      "AdminAppointmentInvalidStatusError";
  }
}

/*
 * Proteção caso o Appointment
 * mude de data entre a leitura
 * inicial e a Transaction.
 */
export class AdminAppointmentConsistencyError
  extends Error {
  constructor() {
    super(
      "O agendamento foi alterado durante a operação. Atualize a agenda e tente novamente.",
    );

    this.name =
      "AdminAppointmentConsistencyError";
  }
}

/*
 * Serviço STARTING_FROM precisa
 * receber o valor final antes
 * de ser concluído.
 */
export class AdminAppointmentFinalPriceRequiredError
  extends Error {
  constructor() {
    super(
      "Informe o valor final cobrado para concluir este atendimento.",
    );

    this.name =
      "AdminAppointmentFinalPriceRequiredError";
  }
}

/*
 * Proteção adicional no domínio.
 */
export class AdminAppointmentInvalidFinalPriceError
  extends Error {
  constructor() {
    super(
      "O valor final informado é inválido.",
    );

    this.name =
      "AdminAppointmentInvalidFinalPriceError";
  }
}

/*
 * Como o serviço é "A partir de",
 * o valor final não deve ser menor
 * que o valor inicial.
 */
export class AdminAppointmentFinalPriceBelowBaseError
  extends Error {
  constructor() {
    super(
      "O valor final não pode ser menor que o valor inicial do serviço.",
    );

    this.name =
      "AdminAppointmentFinalPriceBelowBaseError";
  }
}

/*
 * Motivo de cancelamento inválido.
 */
export class AdminAppointmentInvalidCancellationReasonError
  extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "AdminAppointmentInvalidCancellationReasonError";
  }
}

type AppointmentIdentificationInput = {
  salonId:
    string;

  appointmentId:
    string;
};

type RejectAppointmentInput =
  AppointmentIdentificationInput & {
    rejectionReason:
      string;

    blockSlot?:
      boolean;
  };

type CancelAppointmentInput =
  AppointmentIdentificationInput & {
    cancellationReason:
      string;
  };

type CompleteAppointmentInput =
  AppointmentIdentificationInput & {
    finalPriceCents?:
      number;
  };

export class AdminAppointmentDecisionService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly dayTransactionService =
      new AppointmentDayTransactionService(),

    private readonly scheduleBlockoutRepository =
      new ScheduleBlockoutRepository(),
  ) {}

  /*
   * =================================
   * CONFIRMAR
   * =================================
   *
   * PENDING_APPROVAL
   * ↓
   * CONFIRMED
   */
  async confirm(
    input:
      AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    const preliminaryAppointment =
      await this
        .getPreliminaryAppointment(
          input,
        );

    return this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preliminaryAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          const appointment =
            await this
              .appointmentRepository
              .findByIdInTransaction(
                transaction,
                input.salonId,
                input.appointmentId,
              );

          if (!appointment) {
            throw new AdminAppointmentNotFoundError();
          }

          this.ensureSameDateKey(
            preliminaryAppointment,
            appointment,
          );

          this.ensurePendingApproval(
            appointment,
          );

          const now =
            Timestamp.now();

          this
            .appointmentRepository
            .updateInTransaction(
              transaction,
              appointment.id,
              {
                status:
                  APPOINTMENT_STATUS
                    .CONFIRMED,

                rejectionReason:
                  null,

                updatedAt:
                  now,
              },
            );

          return {
            ...appointment,

            status:
              APPOINTMENT_STATUS
                .CONFIRMED,

            rejectionReason:
              null,

            updatedAt:
              now,
          };
        },
      );
  }

  /*
   * =================================
   * RECUSAR
   * =================================
   *
   * PENDING_APPROVAL
   * ↓
   * REJECTED
   */
  async reject(
    input:
      RejectAppointmentInput,
  ): Promise<AppointmentEntity> {
    const rejectionReason =
      input
        .rejectionReason
        .trim();

    if (
      rejectionReason.length <
      3
    ) {
      throw new Error(
        "Informe um motivo para a recusa.",
      );
    }

    if (
      rejectionReason.length >
      500
    ) {
      throw new Error(
        "O motivo da recusa deve possuir no máximo 500 caracteres.",
      );
    }

    const blockSlot =
      input.blockSlot ??
      false;

    const preliminaryAppointment =
      await this
        .getPreliminaryAppointment(
          input,
        );

    return this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preliminaryAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          const appointment =
            await this
              .appointmentRepository
              .findByIdInTransaction(
                transaction,
                input.salonId,
                input.appointmentId,
              );

          if (!appointment) {
            throw new AdminAppointmentNotFoundError();
          }

          this.ensureSameDateKey(
            preliminaryAppointment,
            appointment,
          );

          this.ensurePendingApproval(
            appointment,
          );

          const appointmentStartTime =
            this.dateToLocalTime(
              appointment
                .startsAt
                .toDate(),
            );

          const existingBlockout =
            blockSlot
              ? await this
                  .scheduleBlockoutRepository
                  .findBySlotInTransaction(
                    transaction,
                    input.salonId,
                    appointment.dateKey,
                    appointmentStartTime,
                  )
              : null;

          const now =
            Timestamp.now();

          this
            .appointmentRepository
            .updateInTransaction(
              transaction,
              appointment.id,
              {
                status:
                  APPOINTMENT_STATUS
                    .REJECTED,

                rejectionReason,

                updatedAt:
                  now,
              },
            );

          if (
            blockSlot &&
            !existingBlockout
          ) {
            this
              .scheduleBlockoutRepository
              .createInTransaction(
                transaction,
                {
                  salonId:
                    input.salonId,

                  dateKey:
                    appointment
                      .dateKey,

                  startTime:
                    appointmentStartTime,

                  reason:
                    rejectionReason,

                  createdAt:
                    now,

                  updatedAt:
                    now,
                },
              );
          }

          return {
            ...appointment,

            status:
              APPOINTMENT_STATUS
                .REJECTED,

            rejectionReason,

            updatedAt:
              now,
          };
        },
      );
  }

  /*
   * =================================
   * CANCELAR PELO ADMIN
   * =================================
   *
   * Estados permitidos:
   *
   * PENDING_APPROVAL
   * CONFIRMED
   *
   * ↓
   *
   * CANCELLED
   *
   * Não existe regra de 24 horas
   * para o ADMIN.
   *
   * O motivo é obrigatório.
   */
  async cancel(
    input:
      CancelAppointmentInput,
  ): Promise<AppointmentEntity> {
    const cancellationReason =
      input
        .cancellationReason
        .trim();

    if (
      cancellationReason.length <
      3
    ) {
      throw new AdminAppointmentInvalidCancellationReasonError(
        "Informe um motivo para o cancelamento.",
      );
    }

    if (
      cancellationReason.length >
      500
    ) {
      throw new AdminAppointmentInvalidCancellationReasonError(
        "O motivo do cancelamento deve possuir no máximo 500 caracteres.",
      );
    }

    const preliminaryAppointment =
      await this
        .getPreliminaryAppointment(
          input,
        );

    return this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preliminaryAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          const appointment =
            await this
              .appointmentRepository
              .findByIdInTransaction(
                transaction,
                input.salonId,
                input.appointmentId,
              );

          if (!appointment) {
            throw new AdminAppointmentNotFoundError();
          }

          this.ensureSameDateKey(
            preliminaryAppointment,
            appointment,
          );

          /*
           * Somente:
           *
           * PENDING_APPROVAL
           * CONFIRMED
           *
           * podem ser cancelados
           * administrativamente.
           */
          this.ensureAdminCancellable(
            appointment,
          );

          const now =
            Timestamp.now();

          this
            .appointmentRepository
            .updateInTransaction(
              transaction,
              appointment.id,
              {
                status:
                  APPOINTMENT_STATUS
                    .CANCELLED,

                cancelledBy:
                  APPOINTMENT_CANCELLED_BY
                    .ADMIN,

                cancelledAt:
                  now,

                cancellationReason,

                updatedAt:
                  now,
              },
            );

          return {
            ...appointment,

            status:
              APPOINTMENT_STATUS
                .CANCELLED,

            cancelledBy:
              APPOINTMENT_CANCELLED_BY
                .ADMIN,

            cancelledAt:
              now,

            cancellationReason,

            updatedAt:
              now,
          };
        },
      );
  }

  /*
   * =================================
   * INICIAR ATENDIMENTO
   * =================================
   *
   * CONFIRMED
   * ↓
   * IN_PROGRESS
   */
  async start(
    input:
      AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    const preliminaryAppointment =
      await this
        .getPreliminaryAppointment(
          input,
        );

    return this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preliminaryAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          const appointment =
            await this
              .appointmentRepository
              .findByIdInTransaction(
                transaction,
                input.salonId,
                input.appointmentId,
              );

          if (!appointment) {
            throw new AdminAppointmentNotFoundError();
          }

          this.ensureSameDateKey(
            preliminaryAppointment,
            appointment,
          );

          this.ensureConfirmed(
            appointment,
          );

          const now =
            Timestamp.now();

          this
            .appointmentRepository
            .updateInTransaction(
              transaction,
              appointment.id,
              {
                status:
                  APPOINTMENT_STATUS
                    .IN_PROGRESS,

                updatedAt:
                  now,
              },
            );

          return {
            ...appointment,

            status:
              APPOINTMENT_STATUS
                .IN_PROGRESS,

            updatedAt:
              now,
          };
        },
      );
  }

  /*
   * =================================
   * CONCLUIR ATENDIMENTO
   * =================================
   *
   * IN_PROGRESS
   * ↓
   * COMPLETED
   */
  async complete(
    input:
      CompleteAppointmentInput,
  ): Promise<AppointmentEntity> {
    const preliminaryAppointment =
      await this
        .getPreliminaryAppointment(
          input,
        );

    return this
      .dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preliminaryAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          const appointment =
            await this
              .appointmentRepository
              .findByIdInTransaction(
                transaction,
                input.salonId,
                input.appointmentId,
              );

          if (!appointment) {
            throw new AdminAppointmentNotFoundError();
          }

          this.ensureSameDateKey(
            preliminaryAppointment,
            appointment,
          );

          this.ensureInProgress(
            appointment,
          );

          /*
           * =================================
           * REGRA DE PREÇO FINAL
           * =================================
           */

          const usesClientSpecialPrice =
            appointment
              .priceSource ===
            APPOINTMENT_PRICE_SOURCE
              .CLIENT_SPECIAL;

          const isStartingFrom =
            appointment
              .servicePriceTypeSnapshot ===
            SERVICE_PRICE_TYPES
              .STARTING_FROM;

          const hasLegacyPriceType =
            appointment
              .servicePriceTypeSnapshot ===
            undefined;

          /*
           * STARTING_FROM com preço normal
           * ou promocional precisa receber
           * o valor final.
           *
           * CLIENT_SPECIAL é a exceção.
           */
          const requiresFinalPrice =
            !usesClientSpecialPrice &&
            isStartingFrom;

          if (
            requiresFinalPrice &&
            input.finalPriceCents ===
              undefined
          ) {
            throw new AdminAppointmentFinalPriceRequiredError();
          }

          const canApplyLegacyFinalPrice =
            !usesClientSpecialPrice &&
            hasLegacyPriceType &&
            input.finalPriceCents !==
              undefined;

          const shouldApplyFinalPrice =
            requiresFinalPrice ||
            canApplyLegacyFinalPrice;

          let chargedPriceCents =
            appointment
              .chargedPriceCents;

          if (
            shouldApplyFinalPrice
          ) {
            const finalPriceCents =
              input
                .finalPriceCents;

            if (
              finalPriceCents ===
                undefined ||
              !Number.isInteger(
                finalPriceCents,
              ) ||
              finalPriceCents <=
                0
            ) {
              throw new AdminAppointmentInvalidFinalPriceError();
            }

            if (
              finalPriceCents <
              appointment
                .chargedPriceCents
            ) {
              throw new AdminAppointmentFinalPriceBelowBaseError();
            }

            chargedPriceCents =
              finalPriceCents;
          }

          const now =
            Timestamp.now();

          this
            .appointmentRepository
            .updateInTransaction(
              transaction,
              appointment.id,
              {
                status:
                  APPOINTMENT_STATUS
                    .COMPLETED,

                chargedPriceCents,

                updatedAt:
                  now,
              },
            );

          return {
            ...appointment,

            status:
              APPOINTMENT_STATUS
                .COMPLETED,

            chargedPriceCents,

            updatedAt:
              now,
          };
        },
      );
  }

  /*
   * =================================
   * LEITURA PRELIMINAR
   * =================================
   */
  private async getPreliminaryAppointment(
    input:
      AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    if (
      !input.salonId ||
      input
        .salonId
        .trim()
        .length ===
        0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    if (
      !input.appointmentId ||
      input
        .appointmentId
        .trim()
        .length ===
        0
    ) {
      throw new Error(
        "Agendamento não informado.",
      );
    }

    const appointment =
      await this
        .appointmentRepository
        .findById(
          input.salonId,
          input.appointmentId,
        );

    if (!appointment) {
      throw new AdminAppointmentNotFoundError();
    }

    return appointment;
  }

  /*
   * =================================
   * DATA/HORÁRIO LOCAL
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

  /*
   * =================================
   * STATUS
   * =================================
   */

  private ensurePendingApproval(
    appointment:
      AppointmentEntity,
  ): void {
    if (
      appointment.status !==
      APPOINTMENT_STATUS
        .PENDING_APPROVAL
    ) {
      throw new AdminAppointmentInvalidStatusError(
        appointment.status,
      );
    }
  }

  private ensureConfirmed(
    appointment:
      AppointmentEntity,
  ): void {
    if (
      appointment.status !==
      APPOINTMENT_STATUS
        .CONFIRMED
    ) {
      throw new AdminAppointmentInvalidStatusError(
        appointment.status,
      );
    }
  }

  private ensureInProgress(
    appointment:
      AppointmentEntity,
  ): void {
    if (
      appointment.status !==
      APPOINTMENT_STATUS
        .IN_PROGRESS
    ) {
      throw new AdminAppointmentInvalidStatusError(
        appointment.status,
      );
    }
  }

  /*
   * ADMIN pode cancelar somente
   * solicitações pendentes ou
   * agendamentos confirmados.
   */
  private ensureAdminCancellable(
    appointment:
      AppointmentEntity,
  ): void {
    const canCancel =
      appointment.status ===
        APPOINTMENT_STATUS
          .PENDING_APPROVAL ||
      appointment.status ===
        APPOINTMENT_STATUS
          .CONFIRMED;

    if (!canCancel) {
      throw new AdminAppointmentInvalidStatusError(
        appointment.status,
      );
    }
  }

  /*
   * =================================
   * CONSISTÊNCIA
   * =================================
   */
  private ensureSameDateKey(
    preliminary:
      AppointmentEntity,

    current:
      AppointmentEntity,
  ): void {
    if (
      preliminary
        .dateKey !==
      current
        .dateKey
    ) {
      throw new AdminAppointmentConsistencyError();
    }
  }
}