import {
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

    /*
     * false / undefined:
     *
     * o Appointment será recusado
     * e o horário volta a ficar
     * disponível.
     *
     * true:
     *
     * o Appointment será recusado
     * e será criado um bloqueio
     * administrativo separado.
     *
     * É opcional temporariamente para
     * manter compatibilidade com o
     * Controller/frontend atual.
     */
    blockSlot?:
      boolean;
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
   *
   * blockSlot = false
   * ↓
   * horário fica disponível.
   *
   * blockSlot = true
   * ↓
   * cria ScheduleBlockout
   * para data + horário.
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

    /*
     * Enquanto o frontend ainda não
     * envia blockSlot, o comportamento
     * continua exatamente como antes:
     *
     * recusar = liberar horário.
     */
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
          /*
           * =================================
           * 1. APPOINTMENT
           * =================================
           */
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

          /*
           * O horário administrativo é
           * calculado pelo BACKEND usando
           * startsAt.
           *
           * Não confiamos em startTime
           * enviado pelo frontend.
           */
          const appointmentStartTime =
            this.dateToLocalTime(
              appointment
                .startsAt
                .toDate(),
            );

          /*
           * =================================
           * 2. BLOQUEIO EXISTENTE
           * =================================
           *
           * IMPORTANTE:
           *
           * Todas as leituras da Transaction
           * acontecem antes das gravações.
           *
           * Só precisamos consultar um
           * ScheduleBlockout se o ADMIN
           * realmente escolheu bloquear
           * aquele horário.
           */
          const existingBlockout =
            blockSlot
              ? await this
                  .scheduleBlockoutRepository
                  .findBySlotInTransaction(
                    transaction,

                    input.salonId,

                    appointment
                      .dateKey,

                    appointmentStartTime,
                  )
              : null;

          const now =
            Timestamp.now();

          /*
           * =================================
           * 3. RECUSA
           * =================================
           *
           * O Appointment sempre vira
           * REJECTED.
           *
           * REJECTED por si só NÃO
           * bloqueia mais o horário.
           */
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

          /*
           * =================================
           * 4. BLOQUEIO ADMINISTRATIVO
           * =================================
           *
           * Somente quando:
           *
           * blockSlot === true
           *
           * e ainda não existir bloqueio
           * para exatamente aquela data
           * e horário.
           *
           * Utilizamos o motivo da recusa
           * também como motivo inicial do
           * bloqueio administrativo.
           */
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

          /*
           * Para a resposta desta operação
           * continuamos retornando somente
           * o Appointment.
           *
           * O ScheduleBlockout é uma
           * informação administrativa
           * separada.
           */
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
   * DATA/HORÁRIO LOCAL
   * =================================
   *
   * Firestore Timestamp
   * ↓
   * Date
   * ↓
   * horário do salão
   *
   * Exemplo:
   *
   * 13:00
   *
   * Utilizamos sempre o startsAt
   * salvo no Appointment.
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