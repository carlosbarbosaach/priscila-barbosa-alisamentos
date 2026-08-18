import type {
  Service,
} from "@priscila/shared";

import type {
  ServiceEntity,
} from "./service.types.js";

export function mapServiceEntityToService(
  service: ServiceEntity,
): Service {
  return {
    id:
      service.id,

    salonId:
      service.salonId,

    name:
      service.name,

    description:
      service.description,

    category:
      service.category,

    durationMinutes:
      service.durationMinutes,

    defaultPriceCents:
      service.defaultPriceCents,

    /*
     * Serviços antigos não possuem
     * phases no Firestore.
     *
     * Para o restante da aplicação,
     * sempre devolvemos array.
     */
    phases:
      service.phases ?? [],

    active:
      service.active,

    createdAt:
      service.createdAt
        .toDate()
        .toISOString(),

    updatedAt:
      service.updatedAt
        .toDate()
        .toISOString(),
  };
}