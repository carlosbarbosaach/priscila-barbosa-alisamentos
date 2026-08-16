import { firestore } from "../../shared/firebase/firebase-firestore.js";

import type {
    ServiceDocument,
    ServiceEntity,
} from "./service.types.js";

const COLLECTION_NAME = "services";

export class ServiceRepository {
    async findById(
        salonId: string,
        serviceId: string,
    ): Promise<ServiceEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .doc(serviceId)
            .get();

        if (!snapshot.exists) {
            return null;
        }

        const data = snapshot.data() as ServiceDocument;

        if (data.salonId !== salonId) {
            return null;
        }

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async findAllBySalon(
        salonId: string,
    ): Promise<ServiceEntity[]> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where("salonId", "==", salonId)
            .orderBy("name", "asc")
            .get();

        return snapshot.docs.map((document) => ({
            id: document.id,
            ...(document.data() as ServiceDocument),
        }));
    }

    async create(
        serviceId: string,
        data: ServiceDocument,
    ): Promise<void> {
        await firestore
            .collection(COLLECTION_NAME)
            .doc(serviceId)
            .create(data);
    }

    async update(
        salonId: string,
        serviceId: string,
        data: Partial<ServiceDocument>,
    ): Promise<void> {
        const service = await this.findById(
            salonId,
            serviceId,
        );

        if (!service) {
            throw new Error(
                "Serviço não encontrado.",
            );
        }

        await firestore
            .collection(COLLECTION_NAME)
            .doc(serviceId)
            .update(data);
    }
}