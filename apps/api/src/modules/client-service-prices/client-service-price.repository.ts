import { firestore } from "../../shared/firebase/firebase-firestore.js";

import { buildClientServicePriceId } from "./client-service-price-id.js";

import type {
    ClientServicePriceDocument,
    ClientServicePriceEntity,
} from "./client-service-price.types.js";

const COLLECTION_NAME =
    "clientServicePrices";

export class ClientServicePriceRepository {
    async findById(
        salonId: string,
        priceId: string,
    ): Promise<ClientServicePriceEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .doc(priceId)
            .get();

        if (!snapshot.exists) {
            return null;
        }

        const data =
            snapshot.data() as ClientServicePriceDocument;

        if (data.salonId !== salonId) {
            return null;
        }

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async findByClientAndService(
        salonId: string,
        clientId: string,
        serviceId: string,
    ): Promise<ClientServicePriceEntity | null> {
        const priceId =
            buildClientServicePriceId(
                clientId,
                serviceId,
            );

        const price = await this.findById(
            salonId,
            priceId,
        );

        if (!price) {
            return null;
        }

        if (
            price.clientId !== clientId ||
            price.serviceId !== serviceId
        ) {
            return null;
        }

        return price;
    }

    async findAllByClient(
        salonId: string,
        clientId: string,
    ): Promise<ClientServicePriceEntity[]> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .where(
                "clientId",
                "==",
                clientId,
            )
            .get();

        return snapshot.docs.map(
            (document) => ({
                id: document.id,
                ...(document.data() as ClientServicePriceDocument),
            }),
        );
    }

    async findAllBySalon(
        salonId: string,
    ): Promise<ClientServicePriceEntity[]> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .get();

        return snapshot.docs.map(
            (document) => ({
                id: document.id,
                ...(document.data() as ClientServicePriceDocument),
            }),
        );
    }

    async create(
        clientId: string,
        serviceId: string,
        data: ClientServicePriceDocument,
    ): Promise<string> {
        const priceId =
            buildClientServicePriceId(
                clientId,
                serviceId,
            );

        await firestore
            .collection(COLLECTION_NAME)
            .doc(priceId)
            .create(data);

        return priceId;
    }

    async update(
        salonId: string,
        priceId: string,
        data: Partial<ClientServicePriceDocument>,
    ): Promise<void> {
        const price = await this.findById(
            salonId,
            priceId,
        );

        if (!price) {
            throw new Error(
                "Preço especial não encontrado.",
            );
        }

        await firestore
            .collection(COLLECTION_NAME)
            .doc(priceId)
            .update(data);
    }
}