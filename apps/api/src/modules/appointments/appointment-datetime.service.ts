import {
    APPOINTMENT_CONFIG,
} from "./appointment.config.js";

export class AppointmentDateTimeService {
    localDateTimeToDate(
        dateKey: string,
        time: string,
    ): Date {
        const dateMatch =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                dateKey,
            );

        const timeMatch =
            /^(\d{2}):(\d{2})$/.exec(
                time,
            );

        if (
            !dateMatch ||
            !timeMatch
        ) {
            throw new Error(
                "Data ou horário inválido.",
            );
        }

        const year =
            Number(
                dateMatch[1],
            );

        const month =
            Number(
                dateMatch[2],
            );

        const day =
            Number(
                dateMatch[3],
            );

        const hours =
            Number(
                timeMatch[1],
            );

        const minutes =
            Number(
                timeMatch[2],
            );

        if (
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {
            throw new Error(
                "Horário inválido.",
            );
        }

        /*
         * Primeiro criamos uma aproximação
         * em UTC.
         */
        const utcGuess =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                    hours,
                    minutes,
                    0,
                    0,
                ),
            );

        /*
         * Descobrimos como esse instante
         * é representado no timezone
         * oficial do salão.
         */
        const formatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        APPOINTMENT_CONFIG
                            .timeZone,

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hourCycle:
                        "h23",
                },
            );

        const parts =
            formatter.formatToParts(
                utcGuess,
            );

        const getPart = (
            type: Intl.DateTimeFormatPartTypes,
        ): number => {
            const part =
                parts.find(
                    (item) =>
                        item.type === type,
                );

            if (!part) {
                throw new Error(
                    "Não foi possível interpretar o fuso horário do salão.",
                );
            }

            return Number(
                part.value,
            );
        };

        const representedAsUtc =
            Date.UTC(
                getPart("year"),
                getPart("month") - 1,
                getPart("day"),
                getPart("hour"),
                getPart("minute"),
                getPart("second"),
            );

        const offsetMilliseconds =
            representedAsUtc -
            utcGuess.getTime();

        /*
         * Ajustamos a data para que
         * represente exatamente o horário
         * local solicitado.
         */
        const result =
            new Date(
                utcGuess.getTime() -
                offsetMilliseconds,
            );

        /*
         * Validação final:
         * convertemos novamente para o
         * timezone do salão e verificamos
         * se chegamos exatamente ao valor
         * solicitado.
         */
        const validationParts =
            formatter.formatToParts(
                result,
            );

        const validation = (
            type: Intl.DateTimeFormatPartTypes,
        ) => {
            const part =
                validationParts.find(
                    (item) =>
                        item.type === type,
                );

            return part
                ? Number(
                    part.value,
                )
                : null;
        };

        const valid =
            validation("year") ===
            year &&
            validation("month") ===
            month &&
            validation("day") ===
            day &&
            validation("hour") ===
            hours &&
            validation("minute") ===
            minutes;

        if (!valid) {
            throw new Error(
                "Não foi possível interpretar a data e o horário informados.",
            );
        }

        return result;
    }

    addMinutes(
        date: Date,
        minutes: number,
    ): Date {
        if (
            !Number.isInteger(
                minutes,
            ) ||
            minutes <= 0
        ) {
            throw new Error(
                "Duração inválida.",
            );
        }

        return new Date(
            date.getTime() +
            minutes *
            60 *
            1000,
        );
    }
}