import type { Timestamp } from "firebase-admin/firestore";

export type ServiceDocument = {
    salonId: string;

    name: string;
    description: string | null;
    category: string;

    durationMinutes: number;
    defaultPriceCents: number;

    active: boolean;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ServiceEntity = ServiceDocument & {
    id: string;
};