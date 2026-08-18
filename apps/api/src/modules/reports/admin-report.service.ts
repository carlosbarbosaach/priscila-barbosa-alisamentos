import {
    APPOINTMENT_STATUS,
} from "@priscila/shared";

import {
    AppointmentRepository,
} from "../appointments/appointment.repository.js";

import type {
    AppointmentEntity,
} from "../appointments/appointment.types.js";

type AdminReportInput = {
    salonId: string;

    startDate: string;

    endDate: string;
};

type AdminReportMetrics = {
    totalAppointments: number;

    pendingApproval: number;

    confirmed: number;

    inProgress: number;

    completed: number;

    cancelled: number;

    rejected: number;

    revenueCents: number;
};

type AdminReportServiceItem = {
    serviceId: string;

    serviceName: string;

    appointments: number;

    completed: number;

    revenueCents: number;
};

export type AdminReportSummary = {
    period: {
        startDate: string;

        endDate: string;
    };

    metrics:
    AdminReportMetrics;

    services:
    AdminReportServiceItem[];

    generatedAt: string;
};

type MutableServiceReport = {
    serviceId: string;

    serviceName: string;

    appointments: number;

    completed: number;

    revenueCents: number;
};

export class AdminReportService {
    constructor(
        private readonly appointmentRepository =
            new AppointmentRepository(),
    ) { }

    async getSummary(
        input:
            AdminReportInput,
    ): Promise<AdminReportSummary> {
        this.validateInput(
            input,
        );

        /*
         * Busca dados REAIS da coleção
         * appointments no Firestore.
         *
         * O Repository já aplica salonId,
         * mantendo isolamento entre salões.
         */
        const appointments =
            await this.appointmentRepository
                .findAllBySalon(
                    input.salonId,
                );

        /*
         * dateKey está no formato
         * YYYY-MM-DD.
         *
         * Nesse formato a comparação
         * lexicográfica funciona para
         * intervalos de datas.
         */
        const appointmentsInPeriod =
            appointments.filter(
                (
                    appointment,
                ) =>
                    appointment.dateKey >=
                    input.startDate &&
                    appointment.dateKey <=
                    input.endDate,
            );

        const metrics:
            AdminReportMetrics = {
            totalAppointments:
                appointmentsInPeriod.length,

            pendingApproval:
                0,

            confirmed:
                0,

            inProgress:
                0,

            completed:
                0,

            cancelled:
                0,

            rejected:
                0,

            revenueCents:
                0,
        };

        const servicesMap =
            new Map<
                string,
                MutableServiceReport
            >();

        for (
            const appointment
            of appointmentsInPeriod
        ) {
            this.addAppointmentToMetrics(
                metrics,
                appointment,
            );

            this.addAppointmentToServiceReport(
                servicesMap,
                appointment,
            );
        }

        const services =
            Array.from(
                servicesMap.values(),
            ).sort(
                (
                    first,
                    second,
                ) => {
                    /*
                     * Primeiro:
                     * mais agendamentos.
                     */
                    if (
                        second.appointments !==
                        first.appointments
                    ) {
                        return (
                            second.appointments -
                            first.appointments
                        );
                    }

                    /*
                     * Empate:
                     * maior receita realizada.
                     */
                    if (
                        second.revenueCents !==
                        first.revenueCents
                    ) {
                        return (
                            second.revenueCents -
                            first.revenueCents
                        );
                    }

                    /*
                     * Segundo empate:
                     * ordem alfabética.
                     */
                    return first.serviceName
                        .localeCompare(
                            second.serviceName,
                            "pt-BR",
                        );
                },
            );

        return {
            period: {
                startDate:
                    input.startDate,

                endDate:
                    input.endDate,
            },

            metrics,

            services,

            generatedAt:
                new Date()
                    .toISOString(),
        };
    }

    /*
     * =================================
     * MÉTRICAS GERAIS
     * =================================
     */
    private addAppointmentToMetrics(
        metrics:
            AdminReportMetrics,

        appointment:
            AppointmentEntity,
    ): void {
        switch (
        appointment.status
        ) {
            case APPOINTMENT_STATUS
                .PENDING_APPROVAL:
                metrics.pendingApproval +=
                    1;

                break;

            case APPOINTMENT_STATUS
                .CONFIRMED:
                metrics.confirmed +=
                    1;

                break;

            case APPOINTMENT_STATUS
                .IN_PROGRESS:
                metrics.inProgress +=
                    1;

                break;

            case APPOINTMENT_STATUS
                .COMPLETED:
                metrics.completed +=
                    1;

                /*
                 * Receita realizada:
                 *
                 * SOMENTE atendimentos
                 * efetivamente concluídos.
                 *
                 * Usamos o valor histórico
                 * gravado no Appointment.
                 */
                metrics.revenueCents +=
                    appointment
                        .chargedPriceCents;

                break;

            case APPOINTMENT_STATUS
                .CANCELLED:
                metrics.cancelled +=
                    1;

                break;

            case APPOINTMENT_STATUS
                .REJECTED:
                metrics.rejected +=
                    1;

                break;
        }
    }

    /*
     * =================================
     * RELATÓRIO POR SERVIÇO
     * =================================
     */
    private addAppointmentToServiceReport(
        servicesMap:
            Map<
                string,
                MutableServiceReport
            >,

        appointment:
            AppointmentEntity,
    ): void {
        const existing =
            servicesMap.get(
                appointment.serviceId,
            );

        const service =
            existing ?? {
                serviceId:
                    appointment.serviceId,

                /*
                 * Snapshot histórico.
                 *
                 * Se o nome do serviço mudar
                 * futuramente, o Appointment
                 * continua representando o que
                 * foi registrado na época.
                 */
                serviceName:
                    appointment
                        .serviceNameSnapshot,

                appointments:
                    0,

                completed:
                    0,

                revenueCents:
                    0,
            };

        service.appointments +=
            1;

        if (
            appointment.status ===
            APPOINTMENT_STATUS
                .COMPLETED
        ) {
            service.completed +=
                1;

            service.revenueCents +=
                appointment
                    .chargedPriceCents;
        }

        servicesMap.set(
            appointment.serviceId,
            service,
        );
    }

    /*
     * =================================
     * VALIDAÇÕES
     * =================================
     */
    private validateInput(
        input:
            AdminReportInput,
    ): void {
        if (
            !input.salonId ||
            input.salonId
                .trim()
                .length === 0
        ) {
            throw new Error(
                "Salão não informado.",
            );
        }

        this.ensureValidDate(
            input.startDate,
        );

        this.ensureValidDate(
            input.endDate,
        );

        if (
            input.startDate >
            input.endDate
        ) {
            throw new Error(
                "A data inicial não pode ser posterior à data final.",
            );
        }
    }

    private ensureValidDate(
        dateKey: string,
    ): void {
        /*
         * Primeiro garantimos o formato.
         */
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                dateKey,
            )
        ) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }

        /*
         * Pegamos cada parte separadamente.
         *
         * Fazemos essa validação porque,
         * com TypeScript strict,
         * split()[0], split()[1] etc.
         * podem ser considerados undefined.
         */
        const parts =
            dateKey.split("-");

        const yearText =
            parts[0];

        const monthText =
            parts[1];

        const dayText =
            parts[2];

        if (
            yearText === undefined ||
            monthText === undefined ||
            dayText === undefined
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

        /*
         * Validação defensiva.
         */
        if (
            !Number.isInteger(
                year,
            ) ||
            !Number.isInteger(
                month,
            ) ||
            !Number.isInteger(
                day,
            )
        ) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }

        /*
         * Criamos a data em UTC para evitar
         * interferência de timezone.
         */
        const date =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                ),
            );

        /*
         * Evita datas impossíveis como:
         *
         * 2026-02-31
         * 2026-13-10
         * 2026-00-15
         */
        const valid =
            date.getUTCFullYear() ===
            year &&
            date.getUTCMonth() ===
            month - 1 &&
            date.getUTCDate() ===
            day;

        if (!valid) {
            throw new Error(
                "Data inválida. Utilize o formato YYYY-MM-DD.",
            );
        }
    }
}