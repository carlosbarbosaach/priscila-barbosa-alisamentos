import type {
  AppointmentEntity,
} from "./appointment.types.js";

import {
  AppointmentConflictService,
} from "./appointment-conflict.service.js";

import {
  AppointmentCreationService,
} from "./appointment-creation.service.js";

import {
  AppointmentDayTransactionService,
} from "./appointment-day-transaction.service.js";

import {
  AppointmentRepository,
} from "./appointment.repository.js";

import {
  ScheduleBlockoutRepository,
} from "./schedule-blockout.repository.js";

type CreateAppointmentInput = {
  /*
   * Estes dois valores serão resolvidos
   * pelo backend/autenticação.
   *
   * O frontend CLIENT não poderá escolher
   * salonId ou clientId livremente.
   */
  salonId: string;
  clientId: string;

  /*
   * Valores escolhidos pela cliente.
   */
  serviceId: string;
  dateKey: string;
  startTime: string;
};

/*
 * Erro específico para conseguirmos
 * responder HTTP 409 no Controller.
 *
 * Usamos o MESMO erro tanto para:
 *
 * - conflito com outro Appointment;
 * - bloqueio administrativo.
 *
 * Dessa forma a CLIENTE apenas recebe
 * que o horário não está disponível,
 * sem conhecer detalhes internos
 * da agenda administrativa.
 */
export class AppointmentSlotUnavailableError
  extends Error {
  constructor() {
    super(
      "O horário selecionado não está mais disponível.",
    );

    this.name =
      "AppointmentSlotUnavailableError";
  }
}

export class AppointmentBookingService {
  constructor(
    private readonly creationService =
      new AppointmentCreationService(),

    private readonly appointmentRepository =
      new AppointmentRepository(),

    private readonly conflictService =
      new AppointmentConflictService(),

    private readonly dayTransactionService =
      new AppointmentDayTransactionService(),

    private readonly scheduleBlockoutRepository =
      new ScheduleBlockoutRepository(),
  ) {}

  async create(
    input: CreateAppointmentInput,
  ): Promise<AppointmentEntity> {
    /*
     * =================================
     * 1. PREPARAÇÃO
     * =================================
     *
     * Prepara o Appointment.
     *
     * Aqui já são resolvidos:
     *
     * - cliente;
     * - serviço;
     * - duração;
     * - disponibilidade preliminar;
     * - timezone;
     * - fases;
     * - occupancy snapshot;
     * - preço padrão/especial;
     * - snapshots históricos;
     * - PENDING_APPROVAL.
     *
     * Ainda não existe gravação.
     */
    const preparedAppointment =
      await this.creationService
        .prepare({
          salonId:
            input.salonId,

          clientId:
            input.clientId,

          serviceId:
            input.serviceId,

          dateKey:
            input.dateKey,

          startTime:
            input.startTime,
        });

    /*
     * =================================
     * 2. ID
     * =================================
     *
     * Geramos o ID antes da Transaction.
     *
     * Se o Firestore precisar repetir
     * a Transaction por concorrência,
     * continuaremos trabalhando com
     * o mesmo appointmentId.
     */
    const appointmentId =
      this.appointmentRepository
        .generateId();

    /*
     * =================================
     * 3. TRANSACTION DO DIA
     * =================================
     *
     * Entramos no corredor protegido
     * daquele salão + daquele dia.
     */
    await this.dayTransactionService
      .run(
        {
          salonId:
            input.salonId,

          dateKey:
            preparedAppointment
              .dateKey,
        },

        async (
          transaction,
        ) => {
          /*
           * =================================
           * 4. AGENDAMENTOS EXISTENTES
           * =================================
           *
           * Esta consulta acontece dentro
           * da MESMA Transaction que leu
           * o appointmentDayLock.
           */
          const appointments =
            await this
              .appointmentRepository
              .findByDateKeyInTransaction(
                transaction,

                input.salonId,

                preparedAppointment
                  .dateKey,
              );

          /*
           * =================================
           * 5. BLOQUEIO ADMINISTRATIVO
           * =================================
           *
           * Agora também verificamos,
           * dentro da mesma Transaction,
           * se o ADMIN fechou exatamente
           * aquela data + horário.
           *
           * Exemplo:
           *
           * 2026-08-21
           * 13:00
           *
           * Se existir ScheduleBlockout,
           * a reserva NÃO pode continuar.
           */
          const scheduleBlockout =
            await this
              .scheduleBlockoutRepository
              .findBySlotInTransaction(
                transaction,

                input.salonId,

                preparedAppointment
                  .dateKey,

                input.startTime,
              );

          if (scheduleBlockout) {
            /*
             * Não informamos para a
             * CLIENTE que se trata de
             * um bloqueio administrativo.
             *
             * Para ela o horário apenas
             * não está mais disponível.
             */
            throw new AppointmentSlotUnavailableError();
          }

          /*
           * =================================
           * 6. CONFLITO COM APPOINTMENT
           * =================================
           *
           * Não confiamos somente na
           * disponibilidade calculada
           * antes da Transaction.
           *
           * Essa é a proteção real contra:
           *
           * Cliente A vê 13:00 livre
           * Cliente B vê 13:00 livre
           *
           * e ambas tentam reservar juntas.
           *
           * Apenas os estados bloqueantes
           * são considerados:
           *
           * PENDING_APPROVAL
           * CONFIRMED
           * IN_PROGRESS
           *
           * REJECTED
           * CANCELLED
           * COMPLETED
           *
           * não bloqueiam.
           */
          const hasConflict =
            this.conflictService
              .hasPreparedAppointmentConflict(
                preparedAppointment,
                appointments,
              );

          if (hasConflict) {
            /*
             * O throw aborta a Transaction.
             *
             * Portanto:
             *
             * Appointment NÃO é criado.
             * Lock NÃO é atualizado.
             */
            throw new AppointmentSlotUnavailableError();
          }

          /*
           * =================================
           * 7. CRIAÇÃO
           * =================================
           *
           * Nenhum bloqueio administrativo
           * e nenhum Appointment conflitante
           * foram encontrados.
           *
           * Registramos a criação dentro
           * da Transaction.
           *
           * Ainda não existe commit neste
           * momento.
           *
           * O commit será feito
           * atomicamente pelo Firestore
           * junto com o lock do dia.
           */
          this.appointmentRepository
            .createInTransaction(
              transaction,
              appointmentId,
              preparedAppointment,
            );
        },
      );

    /*
     * =================================
     * 8. RETORNO
     * =================================
     *
     * Só chegamos aqui se a Transaction
     * inteira tiver sido concluída.
     *
     * Podemos representar o Appointment
     * recém-criado sem uma segunda
     * leitura no Firestore.
     */
    return {
      id:
        appointmentId,

      ...preparedAppointment,
    };
  }
}