import {
  APPOINTMENT_CANCELLED_BY,
  APPOINTMENT_STATUS,
} from "@priscila/shared";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  firestore,
} from "../../shared/firebase/firebase-firestore.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

import type {
  AppointmentEntity,
} from "./appointment.types.js";

const CLIENT_CANCELLATION_LIMIT_HOURS =
  24;

const CLIENT_CANCELLATION_LIMIT_MS =
  CLIENT_CANCELLATION_LIMIT_HOURS *
  60 *
  60 *
  1000;

/*
 * =================================
 * ERROS DE DOMÍNIO
 * =================================
 */

export class ClientAppointmentNotFoundError
  extends Error {
  constructor() {
    super(
      "Agendamento não encontrado.",
    );

    this.name =
      "ClientAppointmentNotFoundError";
  }
}

export class ClientAppointmentCancellationNotAllowedError
  extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "ClientAppointmentCancellationNotAllowedError";
  }
}

export class ClientAppointmentCancellationTooLateError
  extends Error {
  constructor() {
    super(
      "Este agendamento não pode mais ser cancelado pelo sistema porque faltam 24 horas ou menos para o atendimento. Entre em contato diretamente com o salão.",
    );

    this.name =
      "ClientAppointmentCancellationTooLateError";
  }
}

type CancelClientAppointmentInput = {
  salonId:
    string;

  clientId:
    string;

  appointmentId:
    string;
};

export class ClientAppointmentCancellationService {
  constructor(
    private readonly appointmentRepository =
      new AppointmentRepository(),
  ) {}

  async cancel(
    input:
      CancelClientAppointmentInput,
  ): Promise<AppointmentEntity> {
    const salonId =
      input.salonId.trim();

    const clientId =
      input.clientId.trim();

    const appointmentId =
      input.appointmentId.trim();

    if (!salonId) {
      throw new Error(
        "Salão não informado.",
      );
    }

    if (!clientId) {
      throw new Error(
        "Cliente não informada.",
      );
    }

    if (!appointmentId) {
      throw new ClientAppointmentNotFoundError();
    }

    /*
     * =================================
     * TRANSAÇÃO
     * =================================
     *
     * O status é lido e alterado dentro
     * da mesma transação.
     *
     * Isso evita, por exemplo:
     *
     * CLIENT cancela
     * exatamente enquanto
     * ADMIN confirma.
     */
    await firestore.runTransaction(
      async (
        transaction,
      ) => {
        const appointment =
          await this
            .appointmentRepository
            .findByIdInTransaction(
              transaction,
              salonId,
              appointmentId,
            );

        if (!appointment) {
          throw new ClientAppointmentNotFoundError();
        }

        /*
         * =================================
         * PROTEÇÃO DE PROPRIEDADE
         * =================================
         *
         * Mesmo sabendo o ID de outro
         * agendamento, a cliente não
         * consegue cancelá-lo.
         *
         * Retornamos "não encontrado"
         * para não revelar informações
         * de outra cliente.
         */
        if (
          appointment.clientId !==
          clientId
        ) {
          throw new ClientAppointmentNotFoundError();
        }

        /*
         * =================================
         * PENDING_APPROVAL
         * =================================
         *
         * Uma solicitação ainda não
         * confirmada pode ser retirada
         * pela cliente sem a regra
         * das 24 horas.
         */
        if (
          appointment.status ===
          APPOINTMENT_STATUS
            .PENDING_APPROVAL
        ) {
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
                    .CLIENT,

                cancelledAt:
                  now,

                cancellationReason:
                  null,

                updatedAt:
                  now,
              },
            );

          return;
        }

        /*
         * =================================
         * CONFIRMED
         * =================================
         *
         * Após confirmação existe uma
         * proteção para o salão:
         *
         * só pode cancelar quando faltam
         * MAIS de 24 horas.
         */
        if (
          appointment.status ===
          APPOINTMENT_STATUS
            .CONFIRMED
        ) {
          const nowMs =
            Date.now();

          const startsAtMs =
            appointment
              .startsAt
              .toMillis();

          const millisecondsUntilAppointment =
            startsAtMs -
            nowMs;

          /*
           * Exatamente 24h também
           * é bloqueado.
           *
           * Permitido:
           * > 24 horas
           *
           * Bloqueado:
           * <= 24 horas
           */
          if (
            millisecondsUntilAppointment <=
            CLIENT_CANCELLATION_LIMIT_MS
          ) {
            throw new ClientAppointmentCancellationTooLateError();
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
                    .CANCELLED,

                cancelledBy:
                  APPOINTMENT_CANCELLED_BY
                    .CLIENT,

                cancelledAt:
                  now,

                cancellationReason:
                  null,

                updatedAt:
                  now,
              },
            );

          return;
        }

        /*
         * =================================
         * OUTROS STATUS
         * =================================
         *
         * IN_PROGRESS
         * COMPLETED
         * REJECTED
         * CANCELLED
         *
         * nenhum pode ser cancelado
         * pela cliente.
         */
        throw new ClientAppointmentCancellationNotAllowedError(
          "Este agendamento não pode ser cancelado.",
        );
      },
    );

    /*
     * Depois do commit buscamos novamente
     * o documento para devolver ao
     * controller já atualizado.
     */
    const updatedAppointment =
      await this
        .appointmentRepository
        .findById(
          salonId,
          appointmentId,
        );

    if (!updatedAppointment) {
      throw new ClientAppointmentNotFoundError();
    }

    return updatedAppointment;
  }
}