import type { Timestamp } from "firebase-admin/firestore";

export type SalonDocument = {
    name: string;
    slug: string;

    active: boolean;

    timezone: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type SalonEntity = SalonDocument & {
    id: string;
};