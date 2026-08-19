import type {
    ServicePhase,
} from "@priscila/shared";

import {
    APPOINTMENT_CONFIG,
} from "./appointment.config.js";

import {
    AppointmentConflictService,
} from "./appointment-conflict.service.js";

import {
    AppointmentRepository,
} from "./appointment.repository.js";

import type {
    AvailabilitySlot,
} from "./appointment-availability.types.js";

type GenerateSlotsInput = {
    dateKey:
        string;

    durationMinutes:
        number;
};

type GetAvailableSlotsInput = {
    dateKey:
        string;

    durationMinutes:
        number;

    /*
     * Mantemos phases no contrato
     * porque a duração/fases continuam
     * fazendo parte do serviço.
     *
     * Porém elas não determinam mais
     * o bloqueio de outro horário fixo.
     */
    phases:
        ServicePhase[];
};

export class AppointmentAvailabilityService {
    constructor(
        private readonly appointmentRepository =
            new AppointmentRepository(),

        private readonly conflictService =
            new AppointmentConflictService(),
    ) {}

    /*
     * =================================
     * HORÁRIOS OFICIAIS
     * =================================
     *
     * Segunda a sexta:
     *
     * 08:00
     * 13:00
     * 17:00
     *
     * Sábado:
     *
     * 07:00
     * 08:00
     * 13:00
     * 17:00
     *
     * Domingo:
     *
     * sem atendimento.
     */
    generatePossibleSlots(
        input:
            GenerateSlotsInput,
    ): AvailabilitySlot[] {
        const {
            dateKey,
            durationMinutes,
        } =
            input;

        if (
            !Number.isInteger(
                durationMinutes,
            ) ||
            durationMinutes <=
                0
        ) {
            throw new Error(
                "A duração do serviço deve ser maior que zero.",
            );
        }

        const date =
            this.parseDateKey(
                dateKey,
            );

        const weekDay =
            date.getUTCDay();

        const isWorkingDay =
            APPOINTMENT_CONFIG
                .workingWeekDays
                .some(
                    (
                        day,
                    ) =>
                        day ===
                        weekDay,
                );

        if (!isWorkingDay) {
            return [];
        }

        const configuredStartTimes =
            APPOINTMENT_CONFIG
                .startTimesByWeekDay[
                    weekDay
                ];

        if (
            !configuredStartTimes ||
            configuredStartTimes
                .length === 0
        ) {
            return [];
        }

        return configuredStartTimes.map(
            (
                startTime,
            ) => {
                const startMinutes =
                    this.timeToMinutes(
                        startTime,
                    );

                /*
                 * A duração continua
                 * definindo o término
                 * PREVISTO do serviço.
                 *
                 * Ela apenas não bloqueia
                 * outro horário fixo.
                 */
                const endMinutes =
                    startMinutes +
                    durationMinutes;

                return {
                    dateKey,

                    startTime,

                    endTime:
                        this.minutesToTime(
                            endMinutes,
                        ),

                    startMinutes,

                    endMinutes,
                };
            },
        );
    }

    /*
     * =================================
     * DISPONIBILIDADE
     * =================================
     */
    async getAvailableSlotsForSalon(
        salonId:
            string,

        input:
            GetAvailableSlotsInput,
    ): Promise<
        AvailabilitySlot[]
    > {
        /*
         * phases continua fazendo parte
         * do contrato, mas não participa
         * mais do cálculo de conflito.
         */
        void input.phases;

        /*
         * 1. Gera somente os horários
         * oficiais daquele dia.
         */
        const possibleSlots =
            this.generatePossibleSlots({
                dateKey:
                    input.dateKey,

                durationMinutes:
                    input
                        .durationMinutes,
            });

        if (
            possibleSlots.length ===
            0
        ) {
            return [];
        }

        /*
         * 2. Busca os agendamentos
         * existentes naquele dia.
         */
        const appointments =
            await this
                .appointmentRepository
                .findByDateKey(
                    salonId,
                    input.dateKey,
                );

        /*
         * 3. Remove somente horários
         * que já possuam outro
         * Appointment bloqueante
         * começando EXATAMENTE naquele
         * mesmo horário.
         *
         * Exemplo:
         *
         * 07:00 confirmado
         *
         * 07:00 ❌
         * 08:00 ✅
         * 13:00 ✅
         * 17:00 ✅
         */
        return possibleSlots.filter(
            (
                slot,
            ) =>
                !this
                    .conflictService
                    .hasConflictAtLocalStart({
                        candidateStartMinutes:
                            slot
                                .startMinutes,

                        appointments,
                    }),
        );
    }

    /*
     * =================================
     * DATA
     * =================================
     */
    private parseDateKey(
        dateKey:
            string,
    ): Date {
        const match =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                dateKey,
            );

        if (!match) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }

        const yearText =
            match[1];

        const monthText =
            match[2];

        const dayText =
            match[3];

        if (
            yearText ===
                undefined ||
            monthText ===
                undefined ||
            dayText ===
                undefined
        ) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }

        const year =
            Number(
                yearText,
            );

        const month =
            Number(
                monthText,
            );

        const day =
            Number(
                dayText,
            );

        const date =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                    12,
                    0,
                    0,
                ),
            );

        const valid =
            date
                .getUTCFullYear() ===
                year &&
            date
                .getUTCMonth() ===
                month - 1 &&
            date
                .getUTCDate() ===
                day;

        if (!valid) {
            throw new Error(
                "Data inválida.",
            );
        }

        return date;
    }

    /*
     * =================================
     * HORÁRIO → MINUTOS
     * =================================
     */
    private timeToMinutes(
        time:
            string,
    ): number {
        const match =
            /^(\d{2}):(\d{2})$/.exec(
                time,
            );

        if (!match) {
            throw new Error(
                "Horário de configuração inválido.",
            );
        }

        const hourText =
            match[1];

        const minuteText =
            match[2];

        if (
            hourText ===
                undefined ||
            minuteText ===
                undefined
        ) {
            throw new Error(
                "Horário de configuração inválido.",
            );
        }

        const hours =
            Number(
                hourText,
            );

        const minutes =
            Number(
                minuteText,
            );

        if (
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {
            throw new Error(
                "Horário de configuração inválido.",
            );
        }

        return (
            hours * 60 +
            minutes
        );
    }

    /*
     * =================================
     * MINUTOS → HORÁRIO
     * =================================
     */
    private minutesToTime(
        totalMinutes:
            number,
    ): string {
        const hours =
            Math.floor(
                totalMinutes /
                    60,
            );

        const minutes =
            totalMinutes %
            60;

        return `${String(
            hours,
        ).padStart(
            2,
            "0",
        )}:${String(
            minutes,
        ).padStart(
            2,
            "0",
        )}`;
    }
}