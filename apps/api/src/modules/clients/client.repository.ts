import type { Timestamp } from "firebase-admin/firestore";

import { firestore } from "../../shared/firebase/firebase-firestore.js";

import type {
    ClientDocument,
    ClientEntity,
} from "./client.types.js";

const COLLECTION_NAME = "clients";

export class ClientRepository {
    async findById(
        salonId: string,
        clientId: string,
    ): Promise<ClientEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .doc(clientId)
            .get();

        if (!snapshot.exists) {
            return null;
        }

        const data =
            snapshot.data() as ClientDocument;

        if (data.salonId !== salonId) {
            return null;
        }

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async findByPhone(
        salonId: string,
        phone: string,
    ): Promise<ClientEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .where(
                "phone",
                "==",
                phone,
            )
            .limit(1)
            .get();

        const document =
            snapshot.docs[0];

        if (!document) {
            return null;
        }

        return {
            id: document.id,
            ...(document.data() as ClientDocument),
        };
    }

    async findByUserId(
        salonId: string,
        userId: string,
    ): Promise<ClientEntity | null> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .where(
                "userId",
                "==",
                userId,
            )
            .limit(1)
            .get();

        const document =
            snapshot.docs[0];

        if (!document) {
            return null;
        }

        return {
            id: document.id,
            ...(document.data() as ClientDocument),
        };
    }

    async findAllByEmail(
        salonId: string,
        email: string,
    ): Promise<ClientEntity[]> {
        const normalizedEmail =
            email
                .trim()
                .toLowerCase();

        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .where(
                "email",
                "==",
                normalizedEmail,
            )
            .limit(2)
            .get();

        return snapshot.docs.map(
            (document) => ({
                id: document.id,
                ...(document.data() as ClientDocument),
            }),
        );
    }

    async findAllBySalon(
        salonId: string,
    ): Promise<ClientEntity[]> {
        const snapshot = await firestore
            .collection(COLLECTION_NAME)
            .where(
                "salonId",
                "==",
                salonId,
            )
            .orderBy(
                "name",
                "asc",
            )
            .get();

        return snapshot.docs.map(
            (document) => ({
                id: document.id,
                ...(document.data() as ClientDocument),
            }),
        );
    }

    async create(
        clientId: string,
        data: ClientDocument,
    ): Promise<void> {
        await firestore
            .collection(COLLECTION_NAME)
            .doc(clientId)
            .create(data);
    }

    async update(
        salonId: string,
        clientId: string,
        data: Partial<ClientDocument>,
    ): Promise<void> {
        const client =
            await this.findById(
                salonId,
                clientId,
            );

        if (!client) {
            throw new Error(
                "Cliente não encontrada.",
            );
        }

        await firestore
            .collection(COLLECTION_NAME)
            .doc(clientId)
            .update(data);
    }

    async linkUserId(
        salonId: string,
        clientId: string,
        userId: string,
        updatedAt: Timestamp,
    ): Promise<void> {
        await this.update(
            salonId,
            clientId,
            {
                userId,
                updatedAt,
            },
        );
    }
}