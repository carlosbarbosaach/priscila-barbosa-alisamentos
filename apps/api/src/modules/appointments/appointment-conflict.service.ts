import {
    APPOINTMENT_CONFIG,
    isBlockingAppointmentStatus,
} from "./appointment.config.js";

import type {
    ProfessionalOccupancyInterval,
} from "./appointment-occupancy.types.js";

import type {
    AppointmentDocument,
    AppointmentEntity,
    AppointmentOccupancyIntervalDocument,
} from "./appointment.types.js";

type HasConflictAtLocalStartInput = {
    candidateStartMinutes: number;

    candidateDurationMinutes: number;

    candidateOccupancy:
    ProfessionalOccupancyInterval[];

    appointments: AppointmentEntity[];
};

type AbsoluteOccupancyInterval = {
    startMinutes: number;
    endMinutes: number;
};

export class AppointmentConflictService {
    /*
     * Utilizado pela tela/listagem
     * de disponibilidade.
     *
     * Exemplo:
     *
     * candidato começa 09:00
     * startMinutes = 540
     */
    hasConflictAtLocalStart(
        input: HasConflictAtLocalStartInput,
    ): boolean {
        const candidateIntervals =
            this.toAbsoluteIntervals(
                input.candidateStartMinutes,
                input.candidateOccupancy,
            );

        if (
            candidateIntervals.length === 0
        ) {
            return false;
        }

        const blockingAppointments =
            input.appointments.filter(
                (appointment) =>
                    isBlockingAppointmentStatus(
                        appointment.status,
                    ),
            );

        return blockingAppointments.some(
            (appointment) => {
                const occupiedIntervals =
                    this.appointmentToAbsoluteOccupancy(
                        appointment,
                    );

                return this.intervalsConflict(
                    candidateIntervals,
                    occupiedIntervals,
                );
            },
        );
    }

    /*
     * Utilizado no momento da gravação
     * transacional.
     *
     * Recebe o AppointmentDocument já
     * preparado pelo 141E.
     */
    hasPreparedAppointmentConflict(
        candidate: AppointmentDocument,
        appointments: AppointmentEntity[],
    ): boolean {
        const candidateStartMinutes =
            this.dateToLocalMinutes(
                candidate.startsAt.toDate(),
            );

        const candidateOccupancy =
            this.resolveOccupancySnapshot(
                candidate
                    .professionalOccupancySnapshot,
                candidate.durationMinutes,
            );

        return this.hasConflictAtLocalStart({
            candidateStartMinutes,

            candidateDurationMinutes:
                candidate.durationMinutes,

            candidateOccupancy,

            appointments,
        });
    }

    private appointmentToAbsoluteOccupancy(
        appointment: AppointmentEntity,
    ): AbsoluteOccupancyInterval[] {
        const appointmentStartMinutes =
            this.dateToLocalMinutes(
                appointment.startsAt.toDate(),
            );

        const occupancy =
            this.resolveOccupancySnapshot(
                appointment
                    .professionalOccupancySnapshot,
                appointment.durationMinutes,
            );

        return this.toAbsoluteIntervals(
            appointmentStartMinutes,
            occupancy,
        );
    }

    /*
     * Compatibilidade com documentos
     * antigos:
     *
     * sem snapshot
     * ↓
     * considera toda a duração ocupada.
     *
     * snapshot []
     * ↓
     * nenhum período ocupa profissional.
     */
    private resolveOccupancySnapshot(
        snapshot:
            | AppointmentOccupancyIntervalDocument[]
            | undefined,

        durationMinutes: number,
    ): ProfessionalOccupancyInterval[] {
        if (!snapshot) {
            return [
                {
                    startOffsetMinutes: 0,
                    endOffsetMinutes:
                        durationMinutes,
                },
            ];
        }

        this.validateOccupancySnapshot(
            snapshot,
            durationMinutes,
        );

        return snapshot.map(
            (interval) => ({
                startOffsetMinutes:
                    interval.startOffsetMinutes,

                endOffsetMinutes:
                    interval.endOffsetMinutes,
            }),
        );
    }

    private validateOccupancySnapshot(
        snapshot:
            AppointmentOccupancyIntervalDocument[],

        durationMinutes: number,
    ): void {
        for (
            const interval of snapshot
        ) {
            const isValid =
                Number.isInteger(
                    interval.startOffsetMinutes,
                ) &&
                Number.isInteger(
                    interval.endOffsetMinutes,
                ) &&
                interval.startOffsetMinutes >=
                0 &&
                interval.endOffsetMinutes >
                interval.startOffsetMinutes &&
                interval.endOffsetMinutes <=
                durationMinutes;

            if (!isValid) {
                throw new Error(
                    "Agendamento possui snapshot de ocupação inválido.",
                );
            }
        }
    }

    private toAbsoluteIntervals(
        startMinutes: number,

        occupancy:
            ProfessionalOccupancyInterval[],
    ): AbsoluteOccupancyInterval[] {
        return occupancy.map(
            (interval) => ({
                startMinutes:
                    startMinutes +
                    interval.startOffsetMinutes,

                endMinutes:
                    startMinutes +
                    interval.endOffsetMinutes,
            }),
        );
    }

    private intervalsConflict(
        candidateIntervals:
            AbsoluteOccupancyInterval[],

        occupiedIntervals:
            AbsoluteOccupancyInterval[],
    ): boolean {
        return candidateIntervals.some(
            (candidate) =>
                occupiedIntervals.some(
                    (occupied) =>
                        this.hasOverlap(
                            candidate.startMinutes,
                            candidate.endMinutes,

                            occupied.startMinutes,
                            occupied.endMinutes,
                        ),
                ),
        );
    }

    /*
     * Exemplo:
     *
     * 08:00 → 09:00
     * 09:00 → 10:00
     *
     * NÃO conflitam.
     *
     * Mas:
     *
     * 08:00 → 09:15
     * 09:00 → 10:00
     *
     * conflitam.
     */
    private hasOverlap(
        candidateStart: number,
        candidateEnd: number,

        occupiedStart: number,
        occupiedEnd: number,
    ): boolean {
        return (
            candidateStart <
            occupiedEnd &&
            candidateEnd >
            occupiedStart
        );
    }

    /*
     * Firestore Timestamp
     * ↓
     * minutos desde meia-noite
     * no fuso do salão.
     */
    private dateToLocalMinutes(
        date: Date,
    ): number {
        const formatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        APPOINTMENT_CONFIG.timeZone,

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23",
                },
            );

        const parts =
            formatter.formatToParts(
                date,
            );

        const hourPart =
            parts.find(
                (part) =>
                    part.type ===
                    "hour",
            );

        const minutePart =
            parts.find(
                (part) =>
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