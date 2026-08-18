import {
  APPOINTMENT_STATUS,
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
 * Tentativa de alterar um Appointment
 * que já saiu de PENDING_APPROVAL.
 */
export class AdminAppointmentInvalidStatusError
  extends Error {
  constructor(
    currentStatus: string,
  ) {
    super(
      `Este agendamento não pode mais ser alterado porque está com status ${currentStatus}.`,
    );

    this.name =
      "AdminAppointmentInvalidStatusError";
  }
}

/*
 * Proteção caso o Appointment
 * mude de data de forma inesperada
 * entre a leitura inicial e a
 * Transaction.
 *
 * Hoje dateKey não é editável.
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

type AppointmentIdentificationInput = {
  salonId: string;
  appointmentId: string;
};

type RejectAppointmentInput =
  AppointmentIdentificationInput & {
    rejectionReason: string;
  };

export class AdminAppointmentDecisionService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly dayTransactionService =
      new AppointmentDayTransactionService(),
  ) {}

  /*
   * ADMIN confirma uma solicitação.
   *
   * PENDING_APPROVAL
   * ↓
   * CONFIRMED
   */
  async confirm(
    input: AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    const preliminaryAppointment =
      await this.getPreliminaryAppointment(
        input,
      );

    return this.dayTransactionService.run(
      {
        salonId:
          input.salonId,

        dateKey:
          preliminaryAppointment.dateKey,
      },

      async (
        transaction,
      ) => {
        /*
         * Releitura obrigatória dentro
         * da Transaction.
         *
         * Nunca confiamos somente na
         * leitura feita anteriormente.
         */
        const appointment =
          await this.appointmentRepository
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

        /*
         * PENDING já bloqueava a agenda.
         *
         * CONFIRMED também bloqueia.
         *
         * Portanto não precisamos
         * recalcular conflito aqui.
         */
        this.appointmentRepository
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
   * ADMIN recusa uma solicitação.
   *
   * PENDING_APPROVAL
   * ↓
   * REJECTED
   *
   * Como REJECTED não bloqueia a
   * agenda, o horário voltará a ser
   * considerado pela disponibilidade.
   */
  async reject(
    input: RejectAppointmentInput,
  ): Promise<AppointmentEntity> {
    const rejectionReason =
      input.rejectionReason
        .trim();

    /*
     * Validação defensiva.
     *
     * Depois também teremos Zod
     * na camada HTTP.
     */
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
      await this.getPreliminaryAppointment(
        input,
      );

    return this.dayTransactionService.run(
      {
        salonId:
          input.salonId,

        dateKey:
          preliminaryAppointment.dateKey,
      },

      async (
        transaction,
      ) => {
        const appointment =
          await this.appointmentRepository
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

        this.appointmentRepository
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
   * Precisamos descobrir dateKey
   * antes de abrir o lock daquele dia.
   *
   * Depois o Appointment é lido
   * novamente dentro da Transaction.
   */
  private async getPreliminaryAppointment(
    input: AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    if (
      !input.salonId ||
      input.salonId.trim().length ===
        0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    if (
      !input.appointmentId ||
      input.appointmentId.trim().length ===
        0
    ) {
      throw new Error(
        "Agendamento não informado.",
      );
    }

    const appointment =
      await this.appointmentRepository
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
   * Neste momento apenas solicitações
   * pendentes podem ser decididas.
   */
  private ensurePendingApproval(
    appointment: AppointmentEntity,
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

  /*
   * dateKey é a chave que determina
   * qual appointmentDayLock estamos
   * utilizando.
   *
   * Portanto não permitimos continuar
   * caso ela tenha mudado.
   */
  private ensureSameDateKey(
    preliminary:
      AppointmentEntity,

    current:
      AppointmentEntity,
  ): void {
    if (
      preliminary.dateKey !==
      current.dateKey
    ) {
      throw new AdminAppointmentConsistencyError();
    }
  }
}