import {
    APPOINTMENT_STATUS,
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
    ) { }

    async prepare(
        input: PrepareAppointmentInput,
    ): Promise<AppointmentDocument> {
        /*
         * 1. Cliente.
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
         * 2. Serviço.
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
         * 3. Verificamos se o horário
         * aparece realmente entre os
         * slots disponíveis.
         *
         * Esta ainda é uma validação
         * preliminar.
         *
         * No Passo 141F faremos novamente
         * dentro da proteção contra corrida.
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
         * 4. Transformamos horário local
         * em instante real.
         */
        const startsAtDate =
            this.dateTimeService
                .localDateTimeToDate(
                    input.dateKey,
                    input.startTime,
                );

        /*
         * Não aceitamos novo agendamento
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

        const endsAtDate =
            this.dateTimeService
                .addMinutes(
                    startsAtDate,
                    service.durationMinutes,
                );

        /*
         * 5. Calculamos os períodos
         * efetivos de ocupação.
         */
        const professionalOccupancySnapshot =
            this.occupancyService
                .buildProfessionalOccupancy({
                    durationMinutes:
                        service.durationMinutes,

                    phases,
                });

        /*
         * 6. Resolve:
         *
         * preço especial
         * OU
         * preço padrão.
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
         * 7. Montamos o documento completo.
         *
         * Ainda NÃO gravamos.
         *
         * A persistência segura será feita
         * no próximo passo.
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

            clientNameSnapshot:
                client.name,

            clientPhoneSnapshot:
                client.phone,

            serviceNameSnapshot:
                service.name,

            chargedPriceCents:
                resolvedPrice
                    .priceCents,

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