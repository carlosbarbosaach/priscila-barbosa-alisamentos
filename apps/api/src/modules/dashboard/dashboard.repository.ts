import { APPOINTMENT_STATUS } from "@priscila/shared";
import type { Timestamp } from "firebase-admin/firestore";

import { firestore } from "../../shared/firebase/firebase-firestore.js";

import type { DashboardMetrics } from "./dashboard.types.js";

const COLLECTION_NAME = "appointments";

type DashboardPeriod = {
    startAt: Timestamp;
    endAt: Timestamp;
};

export class DashboardRepository {
    async getMetrics(
        salonId: string,
        period: DashboardPeriod,
    ): Promise<DashboardMetrics> {
        const appointments = firestore
            .collection(COLLECTION_NAME)
            .where("salonId", "==", salonId);

        const appointmentsToday = appointments
            .where("startAt", ">=", period.startAt)
            .where("startAt", "<", period.endAt);

        const pendingApproval = appointments
            .where(
                "status",
                "==",
                APPOINTMENT_STATUS.PENDING_APPROVAL,
            );

        const confirmedToday = appointmentsToday
            .where(
                "status",
                "==",
                APPOINTMENT_STATUS.CONFIRMED,
            );

        const cancelledToday = appointmentsToday
            .where(
                "status",
                "==",
                APPOINTMENT_STATUS.CANCELLED,
            );

        const [
            appointmentsTodaySnapshot,
            pendingApprovalSnapshot,
            confirmedTodaySnapshot,
            cancelledTodaySnapshot,
        ] = await Promise.all([
            appointmentsToday.count().get(),
            pendingApproval.count().get(),
            confirmedToday.count().get(),
            cancelledToday.count().get(),
        ]);

        return {
            appointmentsToday:
                appointmentsTodaySnapshot.data().count,

            pendingApproval:
                pendingApprovalSnapshot.data().count,

            confirmedToday:
                confirmedTodaySnapshot.data().count,

            cancelledToday:
                cancelledTodaySnapshot.data().count,
        };
    }
}