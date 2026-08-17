export type Client = {
    id: string;

    salonId: string;

    /**
     * UID do Firebase Auth.
     * Pode ser null enquanto a cliente
     * ainda não tiver acessado o sistema.
     */
    userId: string | null;

    name: string;

    /**
     * Telefone/WhatsApp normalizado pelo backend.
     */
    phone: string;

    email: string | null;

    active: boolean;

    createdAt: string;
    updatedAt: string;
};