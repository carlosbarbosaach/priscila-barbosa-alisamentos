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

import {
  whatsappNotificationService,
} from "../whatsapp/whatsapp.factory.js";

type CreateAppointmentInput = {
  /*
   * Estes dois valores serão resolvidos
   * pelo backend/autenticação.
   *
   * O frontend CLIENT não poderá escolher
   * salonId ou clientId livremente.
   */
  salonId:
    string;

  clientId:
    string;

  /*
   * Valores escolhidos pela cliente.
   */
  serviceId:
    string;

  dateKey:
    string;

  startTime:
    string;
};

/*
 * =================================
 * FORMATAÇÃO
 * =================================
 *
 * Converte:
 *
 * 2026-08-22
 *
 * para:
 *
 * 22/08/2026
 *
 * Não criamos Date porque dateKey
 * já representa uma data local do
 * salão e não precisamos introduzir
 * conversão de timezone aqui.
 */
function formatDateKeyForNotification(
  dateKey:
    string,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey.split(
      "-",
    );

  if (
    !year ||
    !month ||
    !day
  ) {
    return dateKey;
  }

  return `${day}/${month}/${year}`;
}

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
    input:
      CreateAppointmentInput,
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
     * - preço padrão/especial/promoção;
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

          if (
            scheduleBlockout
          ) {
            /*
             * Não informamos para a
             * CLIENTE que se trata de
             * um bloqueio administrativo.
             */
            throw new AppointmentSlotUnavailableError();
          }

          /*
           * =================================
           * 6. CONFLITO COM APPOINTMENT
           * =================================
           */
          const hasConflict =
            this.conflictService
              .hasPreparedAppointmentConflict(
                preparedAppointment,

                appointments,
              );

          if (
            hasConflict
          ) {
            /*
             * O throw aborta a Transaction.
             *
             * Appointment NÃO é criado.
             */
            throw new AppointmentSlotUnavailableError();
          }

          /*
           * =================================
           * 7. CRIAÇÃO
           * =================================
           *
           * O Appointment é registrado
           * dentro da Transaction.
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
     * 8. WHATSAPP — NOVA SOLICITAÇÃO
     * =================================
     *
     * MUITO IMPORTANTE:
     *
     * só chegamos aqui depois que a
     * Transaction foi concluída.
     *
     * Portanto o Appointment já está
     * persistido no Firestore.
     *
     * Se:
     *
     * - WhatsApp estiver desativado;
     * - Meta estiver indisponível;
     * - token estiver inválido;
     * - template falhar;
     *
     * o agendamento NÃO será perdido.
     *
     * WhatsAppNotificationService
     * transforma essas situações em:
     *
     * SENT
     * SKIPPED
     * FAILED
     *
     * sem lançar erro para este fluxo.
     */
    await whatsappNotificationService
      .notifyAppointmentRequested({
        clientName:
          preparedAppointment
            .clientNameSnapshot,

        serviceName:
          preparedAppointment
            .serviceNameSnapshot,

        date:
          formatDateKeyForNotification(
            preparedAppointment
              .dateKey,
          ),

        time:
          input.startTime,
      });

    /*
     * =================================
     * 9. RETORNO
     * =================================
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