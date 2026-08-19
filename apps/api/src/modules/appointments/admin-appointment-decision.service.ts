import {
  APPOINTMENT_PRICE_SOURCE,
  APPOINTMENT_STATUS,
  SERVICE_PRICE_TYPES,
} from "@priscila/shared";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  AppointmentDayTransactionService,
} from "./appointment-day-transaction.service.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

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
 *
 * Mesmo existindo Zod no Controller,
 * não confiamos apenas na camada HTTP.
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
  };

type CompleteAppointmentInput =
  AppointmentIdentificationInput & {
    /*
     * Valor final em centavos.
     *
     * Exemplo:
     *
     * R$ 650,00
     * ↓
     * 65000
     */
    finalPriceCents?:
      number;
  };

export class AdminAppointmentDecisionService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly dayTransactionService =
      new AppointmentDayTransactionService(),
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
  ): Promise<
    AppointmentEntity
  > {
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
  ): Promise<
    AppointmentEntity
  > {
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
                    .REJECTED,

                rejectionReason,

                updatedAt:
                  now,
              },
            );

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
  ): Promise<
    AppointmentEntity
  > {
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
   *
   * FIXED:
   * mantém chargedPriceCents.
   *
   * CLIENT_SPECIAL:
   * mantém chargedPriceCents.
   *
   * STARTING_FROM + SERVICE_DEFAULT:
   * exige finalPriceCents.
   */
  async complete(
    input:
      CompleteAppointmentInput,
  ): Promise<
    AppointmentEntity
  > {
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
           * Só é possível concluir
           * atendimento que realmente
           * esteja em andamento.
           */
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
           * Novo agendamento:
           *
           * sabemos com certeza que
           * o serviço era STARTING_FROM.
           *
           * Se não existir preço especial,
           * exigimos o valor final.
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

          /*
           * Agendamento antigo:
           *
           * não possui snapshot do tipo
           * de preço.
           *
           * Se o frontend enviar
           * finalPriceCents, aceitamos
           * como compatibilidade.
           */
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

            /*
             * "A partir de R$ 500"
             * não deve terminar em,
             * por exemplo, R$ 450.
             */
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
   *
   * Descobre dateKey antes
   * de abrir o lock do dia.
   */
  private async getPreliminaryAppointment(
    input:
      AppointmentIdentificationInput,
  ): Promise<
    AppointmentEntity
  > {
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