import type {
  AppointmentPriceSource,
} from "../enums/appointment-price-source.js";

import type {
  ServicePriceType,
} from "./service.js";

export type ClientBookableService = {
  id:
    string;

  name:
    string;

  description:
    string | null;

  category:
    string;

  durationMinutes:
    number;

  /*
   * Valor normal/base cadastrado
   * no serviço.
   */
  defaultPriceCents:
    number;

  /*
   * FIXED
   * ou
   * STARTING_FROM.
   */
  priceType:
    ServicePriceType;

  /*
   * =================================
   * PROMOÇÃO
   * =================================
   *
   * Estes campos permitem que o
   * frontend mostre:
   *
   * 🔥 PROMOÇÃO
   *
   * De R$ 300
   * Por R$ 250
   *
   * Mesmo quando a cliente possuir
   * um preço especial ainda menor,
   * a informação da promoção continua
   * disponível para apresentação.
   */
  promotionActive:
    boolean;

  promotionPriceCents:
    number | null;

  promotionLabel:
    string | null;

  /*
   * =================================
   * PREÇO EFETIVO DA CLIENTE
   * =================================
   *
   * Este é o valor escolhido
   * pelo BACKEND.
   *
   * Pode vir de:
   *
   * SERVICE_DEFAULT
   * CLIENT_SPECIAL
   * PROMOTION
   */
  priceCents:
    number;

  priceSource:
    AppointmentPriceSource;
};