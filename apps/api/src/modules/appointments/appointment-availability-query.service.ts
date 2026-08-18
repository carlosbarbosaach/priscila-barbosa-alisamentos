import {
  ServiceRepository,
} from "../services/service.repository.js";

import {
  AppointmentAvailabilityService,
} from "./appointment-availability.service.js";

import {
  AppointmentDateTimeService,
} from "./appointment-datetime.service.js";

export type PublicAvailabilitySlot = {
  /*
   * Não expomos startMinutes/endMinutes.
   *
   * Esses valores pertencem ao
   * mecanismo interno da agenda.
   */
  startTime: string;
  endTime: string;
};

export type AppointmentAvailabilityResult = {
  serviceId: string;

  serviceName: string;

  dateKey: string;

  durationMinutes: number;

  slots: PublicAvailabilitySlot[];
};

type GetAvailabilityInput = {
  salonId: string;

  serviceId: string;

  dateKey: string;
};

export class AppointmentAvailabilityQueryService {
  constructor(
    private readonly serviceRepository =
      new ServiceRepository(),

    private readonly availabilityService =
      new AppointmentAvailabilityService(),

    private readonly dateTimeService =
      new AppointmentDateTimeService(),
  ) {}

  async getAvailability(
    input: GetAvailabilityInput,
  ): Promise<AppointmentAvailabilityResult> {
    const {
      salonId,
      serviceId,
      dateKey,
    } = input;

    if (
      !salonId ||
      salonId.trim().length === 0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    /*
     * 1. O frontend informa somente
     * serviceId.
     *
     * Duração e fases continuam sendo
     * autoridade do backend.
     */
    const service =
      await this.serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!service) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    /*
     * Serviço desativado não deve
     * disponibilizar novos horários.
     */
    if (!service.active) {
      throw new Error(
        "Serviço indisponível para novos agendamentos.",
      );
    }

    if (
      !Number.isInteger(
        service.durationMinutes,
      ) ||
      service.durationMinutes <= 0
    ) {
      throw new Error(
        "O serviço possui duração inválida.",
      );
    }

    /*
     * Compatibilidade com serviços
     * antigos que ainda não possuem
     * phases no Firestore.
     *
     * phases = []
     * ↓
     * Availability/Occupancy usa
     * duração inteira como ocupada.
     */
    const phases =
      service.phases ?? [];

    /*
     * 2. Calcula disponibilidade
     * real considerando:
     *
     * - expediente;
     * - duração;
     * - fases;
     * - períodos de espera;
     * - appointments do dia;
     * - status bloqueadores;
     * - conflitos.
     */
    const availableSlots =
      await this.availabilityService
        .getAvailableSlotsForSalon(
          salonId,
          {
            dateKey,

            durationMinutes:
              service.durationMinutes,

            phases,
          },
        );

    /*
     * 3. Remove horários cujo início
     * já está no passado.
     *
     * Isso é especialmente importante
     * quando a cliente consulta a agenda
     * do dia atual.
     *
     * Exemplo:
     *
     * agora = 10:02
     *
     * 08:00 ❌
     * 08:30 ❌
     * 09:00 ❌
     * 09:30 ❌
     * 10:00 ❌
     * 10:30 ✅
     */
    const now =
      Date.now();

    const futureSlots =
      availableSlots.filter(
        (slot) => {
          const startsAt =
            this.dateTimeService
              .localDateTimeToDate(
                dateKey,
                slot.startTime,
              );

          return (
            startsAt.getTime() >
            now
          );
        },
      );

    /*
     * 4. Retornamos apenas informações
     * que fazem sentido para o frontend.
     *
     * startMinutes/endMinutes ficam
     * internos ao backend.
     */
    return {
      serviceId:
        service.id,

      serviceName:
        service.name,

      dateKey,

      durationMinutes:
        service.durationMinutes,

      slots:
        futureSlots.map(
          (slot) => ({
            startTime:
              slot.startTime,

            endTime:
              slot.endTime,
          }),
        ),
    };
  }
}