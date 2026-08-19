import {
    APPOINTMENT_CONFIG,
    isBlockingAppointmentStatus,
} from "./appointment.config.js";

import type {
    AppointmentDocument,
    AppointmentEntity,
} from "./appointment.types.js";

type HasConflictAtLocalStartInput = {
    /*
     * Horário de início da nova
     * solicitação em minutos.
     *
     * Exemplo:
     *
     * 08:00 = 480
     */
    candidateStartMinutes:
        number;

    /*
     * Agendamentos existentes
     * naquele mesmo dia.
     */
    appointments:
        AppointmentEntity[];
};

export class AppointmentConflictService {
    /*
     * =================================
     * REGRA OFICIAL DE CONFLITO
     * =================================
     *
     * A duração de um atendimento
     * NÃO bloqueia outro horário fixo.
     *
     * Exemplo:
     *
     * 07:00 → atendimento de 4 horas
     * 08:00 → disponível ✅
     *
     * Porém duas solicitações no
     * MESMO horário não são permitidas:
     *
     * 08:00 → PENDING_APPROVAL
     * 08:00 → nova solicitação ❌
     */
    hasConflictAtLocalStart(
        input:
            HasConflictAtLocalStartInput,
    ): boolean {
        /*
         * Consideramos somente
         * agendamentos que ainda
         * ocupam aquele horário.
         *
         * REJECTED
         * CANCELLED
         * COMPLETED
         *
         * não impedem nova solicitação.
         */
        const blockingAppointments =
            input.appointments.filter(
                (
                    appointment,
                ) =>
                    isBlockingAppointmentStatus(
                        appointment.status,
                    ),
            );

        /*
         * Agora não verificamos mais
         * sobreposição entre intervalos.
         *
         * Apenas verificamos se existe
         * outro Appointment começando
         * exatamente no mesmo horário.
         */
        return blockingAppointments.some(
            (
                appointment,
            ) => {
                const appointmentStartMinutes =
                    this.dateToLocalMinutes(
                        appointment
                            .startsAt
                            .toDate(),
                    );

                return (
                    appointmentStartMinutes ===
                    input
                        .candidateStartMinutes
                );
            },
        );
    }

    /*
     * =================================
     * VALIDAÇÃO TRANSACIONAL
     * =================================
     *
     * Utilizado pelo
     * AppointmentBookingService.
     *
     * Esta é a proteção real contra
     * duas clientes tentando reservar
     * exatamente o mesmo horário
     * simultaneamente.
     */
    hasPreparedAppointmentConflict(
        candidate:
            AppointmentDocument,

        appointments:
            AppointmentEntity[],
    ): boolean {
        const candidateStartMinutes =
            this.dateToLocalMinutes(
                candidate
                    .startsAt
                    .toDate(),
            );

        return this
            .hasConflictAtLocalStart({
                candidateStartMinutes,

                appointments,
            });
    }

    /*
     * =================================
     * DATA → MINUTOS LOCAIS
     * =================================
     *
     * Firestore Timestamp
     * ↓
     * horário no fuso do salão
     * ↓
     * minutos desde meia-noite
     *
     * Exemplo:
     *
     * 08:00
     * ↓
     * 480
     */
    private dateToLocalMinutes(
        date:
            Date,
    ): number {
        const formatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        APPOINTMENT_CONFIG
                            .timeZone,

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23",
                },
            );

        const parts =
            formatter
                .formatToParts(
                    date,
                );

        const hourPart =
            parts.find(
                (
                    part,
                ) =>
                    part.type ===
                    "hour",
            );

        const minutePart =
            parts.find(
                (
                    part,
                ) =>
                    part.type ===
                    "minute",
            );

        if (
            !hourPart ||
            !minutePart
        ) {
            throw new Error(
                "Não foi possível interpretar o horário do agendamento.",
            );
        }

        const hours =
            Number(
                hourPart.value,
            );

        const minutes =
            Number(
                minutePart.value,
            );

        return (
            hours * 60 +
            minutes
        );
    }
}