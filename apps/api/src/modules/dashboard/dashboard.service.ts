import {
    addDays,
    startOfDay,
} from "date-fns";

import {
    fromZonedTime,
    toZonedTime,
} from "date-fns-tz";

import { Timestamp } from "firebase-admin/firestore";

import { SalonRepository } from "../salons/salon.repository.js";

import { DashboardRepository } from "./dashboard.repository.js";

import type { DashboardSummary } from "./dashboard.types.js";

export class DashboardService {
    constructor(
        private readonly dashboardRepository =
            new DashboardRepository(),

        private readonly salonRepository =
            new SalonRepository(),
    ) { }

    async getSummary(
        salonId: string,
    ): Promise<DashboardSummary> {
        const salon =
            await this.salonRepository.findById(
                salonId,
            );

        if (!salon) {
            throw new Error(
                "Salão não encontrado.",
            );
        }

        if (!salon.active) {
            throw new Error(
                "Salão inativo.",
            );
        }

        const now = new Date();

        const zonedNow = toZonedTime(
            now,
            salon.timezone,
        );

        const zonedStartOfDay =
            startOfDay(zonedNow);

        const zonedStartOfNextDay =
            addDays(zonedStartOfDay, 1);

        const startAt = Timestamp.fromDate(
            fromZonedTime(
                zonedStartOfDay,
                salon.timezone,
            ),
        );

        const endAt = Timestamp.fromDate(
            fromZonedTime(
                zonedStartOfNextDay,
                salon.timezone,
            ),
        );

        const metrics =
            await this.dashboardRepository.getMetrics(
                salonId,
                {
                    startAt,
                    endAt,
                },
            );

        return {
            metrics,
            timezone: salon.timezone,
            generatedAt: now.toISOString(),
        };
    }
}