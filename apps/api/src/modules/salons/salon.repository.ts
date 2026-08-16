import { firestore } from "../../shared/firebase/firebase-firestore.js";

import type {
    SalonDocument,
    SalonEntity,
} from "./salon.types.js";

const COLLECTION_NAME = "salons";

export class SalonRepository {
    async findById(
        salonId: string,
    ): Promise<SalonEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .doc(salonId)
            .get();

        if (!snapshot.exists) {
            return null;
        }

        const data = snapshot.data() as SalonDocument;

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async create(
        salonId: string,
        data: SalonDocument,
    ): Promise<void> {
        await firestore
            .collection(COLLECTION_NAME)
            .doc(salonId)
            .set(data);
    }
}