import type { Client } from "@priscila/shared";

import type { ClientEntity } from "./client.types.js";

export function mapClientEntityToClient(
    client: ClientEntity,
): Client {
    return {
        id: client.id,

        salonId: client.salonId,

        userId: client.userId,

        name: client.name,
        phone: client.phone,
        email: client.email,

        active: client.active,

        createdAt:
            client.createdAt.toDate().toISOString(),

        updatedAt:
            client.updatedAt.toDate().toISOString(),
    };
}