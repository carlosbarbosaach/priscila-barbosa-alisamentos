import type { Timestamp } from "firebase-admin/firestore";

export type ClientDocument = {
    salonId: string;

    /**
     * Firebase Auth UID.
     * Pode ser null caso a cliente
     * tenha sido cadastrada manualmente.
     */
    userId: string | null;

    name: string;

    /**
     * Telefone armazenado já normalizado.
     * Exemplo:
     * 5548999999999
     */
    phone: string;

    email: string | null;

    active: boolean;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ClientEntity = ClientDocument & {
    id: string;
};