import type {
  ServicePriceType,
} from "@priscila/shared";

import type {
  Timestamp,
} from "firebase-admin/firestore";

export type ServicePhaseDocument = {
  id:
    string;

  name:
    string;

  durationMinutes:
    number;

  occupiesProfessional:
    boolean;

  order:
    number;
};

export type ServiceDocument = {
  salonId:
    string;

  name:
    string;

  description:
    string | null;

  category:
    string;

  durationMinutes:
    number;

  defaultPriceCents:
    number;

  /*
   * Opcional para compatibilidade
   * com serviços antigos.
   */
  priceType?:
    ServicePriceType;

  /*
   * =================================
   * PROMOÇÃO
   * =================================
   *
   * Também opcionais no Firestore
   * porque documentos antigos ainda
   * não possuem esses campos.
   */
  promotionActive?:
    boolean;

  promotionPriceCents?:
    number | null;

  promotionLabel?:
    string | null;

  /*
   * Opcional para compatibilidade
   * com serviços antigos.
   */
  phases?:
    ServicePhaseDocument[];

  active:
    boolean;

  createdAt:
    Timestamp;

  updatedAt:
    Timestamp;
};

export type ServiceEntity =
  ServiceDocument & {
    id:
      string;
  };