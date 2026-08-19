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
   * Opcional no documento porque
   * serviços antigos do Firestore
   * ainda não possuem esse campo.
   *
   * O Mapper fará:
   *
   * undefined
   * ↓
   * FIXED
   */
  priceType?:
    ServicePriceType;

  /*
   * Opcional para manter
   * compatibilidade com serviços
   * antigos.
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