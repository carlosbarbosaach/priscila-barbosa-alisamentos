import type { ClientServicePrice } from "@priscila/shared";

import type {
    ClientServicePriceEntity,
} from "./client-service-price.types.js";

export function mapClientServicePriceEntityToClientServicePrice(
    price: ClientServicePriceEntity,
): ClientServicePrice {
    return {
        id: price.id,

        salonId: price.salonId,

        clientId: price.clientId,
        serviceId: price.serviceId,

        priceCents: price.priceCents,

        active: price.active,

        createdAt:
            price.createdAt.toDate().toISOString(),

        updatedAt:
            price.updatedAt.toDate().toISOString(),
    };
}