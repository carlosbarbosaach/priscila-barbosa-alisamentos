import {
    APPOINTMENT_STATUS,
    SERVICE_PRICE_TYPES,
} from "@priscila/shared";

import {
    Timestamp,
} from "firebase-admin/firestore";

import {
    ClientRepository,
} from "../clients/client.repository.js";

import {
    ServiceRepository,
} from "../services/service.repository.js";

import {
    AppointmentAvailabilityService,
} from "./appointment-availability.service.js";

import {
    AppointmentDateTimeService,
} from "./appointment-datetime.service.js";

import {
    AppointmentOccupancyService,
} from "./appointment-occupancy.service.js";

import {
    AppointmentPriceResolverService,
} from "./appointment-price-resolver.service.js";

import type {
    AppointmentDocument,
} from "./appointment.types.js";

type PrepareAppointmentInput = {
    salonId: string;

    /*
     * Resolvido pelo backend através
     * da conta autenticada.
     */
    clientId: string;

    serviceId: string;

    dateKey: string;

    startTime: string;
};

export class AppointmentCreationService {
    constructor(
        private readonly clientRepository =
            new ClientRepository(),

        private readonly serviceRepository =
            new ServiceRepository(),

        private readonly availabilityService =
            new AppointmentAvailabilityService(),

        private readonly occupancyService =
            new AppointmentOccupancyService(),

        private readonly priceResolver =
            new AppointmentPriceResolverService(),

        private readonly dateTimeService =
            new AppointmentDateTimeService(),
    ) {}

    async prepare(
        input: PrepareAppointmentInput,
    ): Promise<AppointmentDocument> {
        /*
         * 1. CLIENTE
         */
        const client =
            await this.clientRepository
                .findById(
                    input.salonId,
                    input.clientId,
                );

        if (!client) {
            throw new Error(
                "Cliente não encontrada.",
            );
        }

        if (!client.active) {
            throw new Error(
                "Cliente inativa não pode realizar novos agendamentos.",
            );
        }

        /*
         * 2. SERVIÇO
         */
        const service =
            await this.serviceRepository
                .findById(
                    input.salonId,
                    input.serviceId,
                );

        if (!service) {
            throw new Error(
                "Serviço não encontrado.",
            );
        }

        if (!service.active) {
            throw new Error(
                "Serviço indisponível.",
            );
        }

        const phases =
            service.phases ?? [];

        /*
         * 3. DISPONIBILIDADE
         *
         * Confirma se o horário escolhido
         * ainda faz parte dos horários
         * disponíveis para aquele dia.
         */
        const availableSlots =
            await this.availabilityService
                .getAvailableSlotsForSalon(
                    input.salonId,
                    {
                        dateKey:
                            input.dateKey,

                        durationMinutes:
                            service.durationMinutes,

                        phases,
                    },
                );

        const selectedSlot =
            availableSlots.find(
                (slot) =>
                    slot.startTime ===
                    input.startTime,
            );

        if (!selectedSlot) {
            throw new Error(
                "O horário selecionado não está mais disponível.",
            );
        }

        /*
         * 4. DATA / HORÁRIO
         *
         * Converte a data e o horário
         * locais do salão para um Date
         * real.
         */
        const startsAtDate =
            this.dateTimeService
                .localDateTimeToDate(
                    input.dateKey,
                    input.startTime,
                );

        /*
         * Não permitimos agendamento
         * no passado.
         */
        if (
            startsAtDate.getTime() <=
            Date.now()
        ) {
            throw new Error(
                "Não é possível agendar um horário no passado.",
            );
        }

        /*
         * O horário final continua sendo
         * calculado pela duração prevista
         * do serviço.
         *
         * Essa duração NÃO bloqueia outros
         * horários fixos da agenda.
         */
        const endsAtDate =
            this.dateTimeService
                .addMinutes(
                    startsAtDate,
                    service.durationMinutes,
                );

        /*
         * 5. SNAPSHOT DE OCUPAÇÃO
         *
         * Mantemos essa informação para
         * histórico e futuras regras,
         * mesmo que atualmente a duração
         * não bloqueie os outros horários
         * fixos da Priscila.
         */
        const professionalOccupancySnapshot =
            this.occupancyService
                .buildProfessionalOccupancy({
                    durationMinutes:
                        service.durationMinutes,

                    phases,
                });

        /*
         * 6. PREÇO
         *
         * Resolve:
         *
         * - preço especial da cliente;
         * ou
         * - preço padrão do serviço.
         */
        const resolvedPrice =
            await this.priceResolver
                .resolve({
                    salonId:
                        input.salonId,

                    clientId:
                        input.clientId,

                    serviceId:
                        input.serviceId,
                });

        const now =
            Timestamp.now();

        /*
         * 7. DOCUMENTO DO AGENDAMENTO
         *
         * Aqui montamos os snapshots que
         * devem permanecer históricos.
         */
        return {
            salonId:
                input.salonId,

            clientId:
                client.id,

            serviceId:
                service.id,

            status:
                APPOINTMENT_STATUS
                    .PENDING_APPROVAL,

            dateKey:
                input.dateKey,

            startsAt:
                Timestamp.fromDate(
                    startsAtDate,
                ),

            endsAt:
                Timestamp.fromDate(
                    endsAtDate,
                ),

            durationMinutes:
                service.durationMinutes,

            professionalOccupancySnapshot,

            /*
             * Snapshot da cliente.
             */
            clientNameSnapshot:
                client.name,

            clientPhoneSnapshot:
                client.phone,

            /*
             * Snapshot do serviço.
             */
            serviceNameSnapshot:
                service.name,

            /*
             * Guarda como o preço do
             * serviço era apresentado
             * quando o agendamento foi
             * criado.
             *
             * FIXED
             * ou
             * STARTING_FROM
             *
             * Serviços antigos que ainda
             * não possuem priceType são
             * considerados FIXED.
             */
            servicePriceTypeSnapshot:
                service.priceType ??
                SERVICE_PRICE_TYPES.FIXED,

            /*
             * Valor aplicado inicialmente
             * ao agendamento.
             *
             * Se existir preço especial,
             * será o preço especial.
             *
             * Se o serviço for
             * STARTING_FROM, este valor
             * representa o valor inicial.
             */
            chargedPriceCents:
                resolvedPrice
                    .priceCents,

            /*
             * SERVICE_DEFAULT
             * ou
             * CLIENT_SPECIAL
             */
            priceSource:
                resolvedPrice
                    .priceSource,

            rejectionReason:
                null,

            cancellationReason:
                null,

            createdAt:
                now,

            updatedAt:
                now,
        };
    }
}