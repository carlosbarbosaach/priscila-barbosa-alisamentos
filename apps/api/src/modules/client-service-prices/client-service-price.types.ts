import type { Timestamp } from "firebase-admin/firestore";

export type ClientServicePriceDocument = {
    salonId: string;

    clientId: string;
    serviceId: string;

    priceCents: number;

    active: boolean;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ClientServicePriceEntity =
    ClientServicePriceDocument & {
        id: string;
    };