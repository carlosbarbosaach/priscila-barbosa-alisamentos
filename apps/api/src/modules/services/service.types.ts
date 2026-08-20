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
   * Estes campos são opcionais no
   * Firestore porque documentos
   * antigos ainda podem não possuir
   * configuração de promoção.
   */
  promotionActive?:
    boolean;

  promotionPriceCents?:
    number | null;

  promotionLabel?:
    string | null;

  /*
   * Datas da promoção no formato:
   *
   * YYYY-MM-DD
   *
   * Também opcionais para manter
   * compatibilidade com documentos
   * criados antes da implementação
   * de promoção com período.
   */
  promotionStartsOn?:
    string | null;

  promotionEndsOn?:
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