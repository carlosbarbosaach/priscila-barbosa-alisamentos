import {
    APPOINTMENT_STATUS,
    type Appointment,
    type AppointmentStatus,
} from "@priscila/shared";

import {
    mapAppointmentEntityToAppointment,
} from "./appointment.mapper.js";

import {
    AppointmentRepository,
} from "./appointment.repository.js";

type GetClientAppointmentsInput = {
    salonId: string;
    clientId: string;
};

export type ClientAppointmentsResult = {
    nextAppointment:
    Appointment | null;

    upcoming:
    Appointment[];

    history:
    Appointment[];
};

/*
 * Status que representam um
 * atendimento ainda ativo na agenda.
 */
const ACTIVE_APPOINTMENT_STATUSES:
    readonly AppointmentStatus[] = [
        APPOINTMENT_STATUS
            .PENDING_APPROVAL,

        APPOINTMENT_STATUS
            .CONFIRMED,

        APPOINTMENT_STATUS
            .IN_PROGRESS,
    ];

export class ClientAppointmentQueryService {
    constructor(
        private readonly appointmentRepository =
            new AppointmentRepository(),
    ) { }

    async findMine(
        input: GetClientAppointmentsInput,
    ): Promise<ClientAppointmentsResult> {
        const {
            salonId,
            clientId,
        } = input;

        if (
            !salonId ||
            salonId.trim().length === 0
        ) {
            throw new Error(
                "Salão não informado.",
            );
        }

        if (
            !clientId ||
            clientId.trim().length === 0
        ) {
            throw new Error(
                "Cliente não informada.",
            );
        }

        const appointments =
            await this.appointmentRepository
                .findAllByClient(
                    salonId,
                    clientId,
                );

        const now =
            Date.now();

        /*
         * Próximos:
         *
         * - PENDING_APPROVAL
         * - CONFIRMED
         * - IN_PROGRESS
         *
         * E ainda não terminaram.
         */
        const upcomingEntities =
            appointments
                .filter(
                    (appointment) =>
                        ACTIVE_APPOINTMENT_STATUSES
                            .includes(
                                appointment.status,
                            ) &&
                        appointment.endsAt
                            .toMillis() >=
                        now,
                )
                .sort(
                    (a, b) =>
                        a.startsAt.toMillis() -
                        b.startsAt.toMillis(),
                );

        /*
         * Histórico:
         *
         * tudo que não pertence mais
         * aos próximos.
         *
         * Isso inclui:
         *
         * COMPLETED
         * CANCELLED
         * REJECTED
         *
         * e também atendimentos antigos.
         */
        const upcomingIds =
            new Set(
                upcomingEntities.map(
                    (appointment) =>
                        appointment.id,
                ),
            );

        const historyEntities =
            appointments
                .filter(
                    (appointment) =>
                        !upcomingIds.has(
                            appointment.id,
                        ),
                )
                .sort(
                    (a, b) =>
                        b.startsAt.toMillis() -
                        a.startsAt.toMillis(),
                );

        const upcoming =
            upcomingEntities.map(
                mapAppointmentEntityToAppointment,
            );

        const history =
            historyEntities.map(
                mapAppointmentEntityToAppointment,
            );

        return {
            nextAppointment:
                upcoming[0] ??
                null,

            upcoming,

            history,
        };
    }
}