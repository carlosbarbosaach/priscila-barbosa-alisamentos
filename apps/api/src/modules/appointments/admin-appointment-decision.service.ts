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
 * O Appointment não está no status
 * necessário para executar determinada
 * ação administrativa.
 */
export class AdminAppointmentInvalidStatusError
  extends Error {
  constructor(
    currentStatus: string,
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
      input.rejectionReason
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

        this.ensureConfirmed(
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
   * Só entra como concluído
   * quando a equipe realmente
   * finalizar o atendimento.
   */
  async complete(
    input:
      AppointmentIdentificationInput,
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

        /*
         * Só é possível concluir
         * atendimento que realmente
         * esteja em andamento.
         */
        this.ensureInProgress(
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
                  .COMPLETED,

              updatedAt:
                now,
            },
          );

        return {
          ...appointment,

          status:
            APPOINTMENT_STATUS
              .COMPLETED,

          updatedAt:
            now,
        };
      },
    );
  }

  /*
   * Descobre dateKey antes
   * de abrir o lock do dia.
   */
  private async getPreliminaryAppointment(
    input:
      AppointmentIdentificationInput,
  ): Promise<AppointmentEntity> {
    if (
      !input.salonId ||
      input.salonId.trim()
        .length === 0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    if (
      !input.appointmentId ||
      input.appointmentId
        .trim()
        .length === 0
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
   * PENDING_APPROVAL necessário
   * para confirmar ou recusar.
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

  /*
   * CONFIRMED necessário
   * para iniciar atendimento.
   */
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

  /*
   * IN_PROGRESS necessário
   * para concluir atendimento.
   */
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
   * dateKey determina o lock
   * transacional daquele dia.
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