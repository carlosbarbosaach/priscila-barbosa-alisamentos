import {
  SERVICE_PRICE_TYPES,
  type Service,
} from "@priscila/shared";

import type {
  ServiceEntity,
} from "./service.types.js";

export function mapServiceEntityToService(
  service:
    ServiceEntity,
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
     * Compatibilidade com documentos
     * antigos do Firestore.
     */
    priceType:
      service.priceType ??
      SERVICE_PRICE_TYPES.FIXED,

    /*
     * =================================
     * PROMOÇÃO
     * =================================
     *
     * Documentos antigos podem não
     * possuir esses campos.
     */
    promotionActive:
      service.promotionActive ??
      false,

    promotionPriceCents:
      service.promotionPriceCents ??
      null,

    promotionLabel:
      service.promotionLabel ??
      null,

    promotionStartsOn:
      service.promotionStartsOn ??
      null,

    promotionEndsOn:
      service.promotionEndsOn ??
      null,

    /*
     * Serviços antigos não possuem
     * phases no Firestore.
     */
    phases:
      service.phases ??
      [],

    active:
      service.active,

    createdAt:
      service
        .createdAt
        .toDate()
        .toISOString(),

    updatedAt:
      service
        .updatedAt
        .toDate()
        .toISOString(),
  };
}