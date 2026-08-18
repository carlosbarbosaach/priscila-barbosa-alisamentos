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
 * futuramente responder HTTP 409
 * no Controller.
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
  ) {}

  async create(
    input: CreateAppointmentInput,
  ): Promise<AppointmentEntity> {
    /*
     * 1. Prepara o Appointment.
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
     * 2. Geramos o ID antes da
     * Transaction.
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
     * 3. Entramos no corredor protegido
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
           * IMPORTANTE:
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
           * 4. Revalidamos o conflito.
           *
           * Não confiamos somente na
           * disponibilidade calculada
           * antes da Transaction.
           *
           * Essa é a proteção real contra:
           *
           * Cliente A vê 09:00 livre
           * Cliente B vê 09:00 livre
           * e ambas tentam reservar juntas.
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
           * 5. Nenhum conflito.
           *
           * Registramos a criação dentro
           * da Transaction.
           *
           * Ainda não existe commit neste
           * momento; o commit será feito
           * atomicamente pelo Firestore
           * junto com o lock.
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
     * Só chegamos aqui se a Transaction
     * inteira tiver sido concluída.
     *
     * Então podemos representar o
     * Appointment recém-criado sem fazer
     * uma segunda leitura no Firestore.
     */
    return {
      id:
        appointmentId,

      ...preparedAppointment,
    };
  }
}