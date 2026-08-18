import {
    APPOINTMENT_STATUS,
} from "@priscila/shared";

import {
    AppointmentRepository,
} from "../appointments/appointment.repository.js";

import type {
    AdminReportSummary,
    ReportServiceItem,
} from "./report.types.js";

type GetReportInput = {
    salonId: string;

    startDate: string;

    endDate: string;
};

export class ReportService {
    constructor(
        private readonly appointmentRepository =
            new AppointmentRepository(),
    ) { }

    async getSummary(
        input: GetReportInput,
    ): Promise<AdminReportSummary> {
        /*
         * V1:
         *
         * Reaproveitamos a consulta já existente
         * para evitar criar um novo índice
         * Firestore apenas para o relatório.
         *
         * Futuramente podemos trocar por uma
         * consulta específica por intervalo.
         */
        const appointments =
            await this.appointmentRepository
                .findAllBySalon(
                    input.salonId,
                );

        /*
         * dateKey já possui:
         *
         * YYYY-MM-DD
         *
         * Então podemos comparar as strings
         * diretamente com segurança.
         */
        const filteredAppointments =
            appointments.filter(
                (appointment) =>
                    appointment.dateKey >=
                    input.startDate &&
                    appointment.dateKey <=
                    input.endDate,
            );

        let pendingApproval = 0;
        let confirmed = 0;
        let inProgress = 0;
        let completed = 0;
        let cancelled = 0;
        let rejected = 0;
        let revenueCents = 0;

        const servicesMap =
            new Map<
                string,
                ReportServiceItem
            >();

        for (
            const appointment
            of filteredAppointments
        ) {
            switch (
            appointment.status
            ) {
                case APPOINTMENT_STATUS
                    .PENDING_APPROVAL:
                    pendingApproval += 1;
                    break;

                case APPOINTMENT_STATUS
                    .CONFIRMED:
                    confirmed += 1;
                    break;

                case APPOINTMENT_STATUS
                    .IN_PROGRESS:
                    inProgress += 1;
                    break;

                case APPOINTMENT_STATUS
                    .COMPLETED:
                    completed += 1;

                    /*
                     * Receita realizada:
                     * somente atendimento concluído.
                     */
                    revenueCents +=
                        appointment
                            .chargedPriceCents;

                    break;

                case APPOINTMENT_STATUS
                    .CANCELLED:
                    cancelled += 1;
                    break;

                case APPOINTMENT_STATUS
                    .REJECTED:
                    rejected += 1;
                    break;
            }

            const existingService =
                servicesMap.get(
                    appointment.serviceId,
                );

            if (existingService) {
                existingService
                    .appointments += 1;

                if (
                    appointment.status ===
                    APPOINTMENT_STATUS
                        .COMPLETED
                ) {
                    existingService
                        .completed += 1;

                    existingService
                        .revenueCents +=
                        appointment
                            .chargedPriceCents;
                }

                continue;
            }

            servicesMap.set(
                appointment.serviceId,
                {
                    serviceId:
                        appointment.serviceId,

                    serviceName:
                        appointment
                            .serviceNameSnapshot,

                    appointments:
                        1,

                    completed:
                        appointment.status ===
                            APPOINTMENT_STATUS
                                .COMPLETED
                            ? 1
                            : 0,

                    revenueCents:
                        appointment.status ===
                            APPOINTMENT_STATUS
                                .COMPLETED
                            ? appointment
                                .chargedPriceCents
                            : 0,
                },
            );
        }

        const services =
            Array.from(
                servicesMap.values(),
            ).sort(
                (
                    serviceA,
                    serviceB,
                ) =>
                    serviceB.appointments -
                    serviceA.appointments,
            );

        return {
            period: {
                startDate:
                    input.startDate,

                endDate:
                    input.endDate,
            },

            metrics: {
                totalAppointments:
                    filteredAppointments.length,

                pendingApproval,

                confirmed,

                inProgress,

                completed,

                cancelled,

                rejected,

                revenueCents,
            },

            services,

            generatedAt:
                new Date().toISOString(),
        };
    }
}