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
   * frontend mostre os dados da
   * promoção configurada para o
   * serviço.
   *
   * promotionActive:
   * informa se a promoção está
   * habilitada administrativamente.
   *
   * A validade real da promoção
   * depende também das datas.
   *
   * promotionStartsOn:
   * primeira data válida da promoção.
   *
   * promotionEndsOn:
   * última data válida da promoção.
   *
   * Formato das datas:
   *
   * YYYY-MM-DD
   *
   * A data inicial e final são
   * inclusivas.
   *
   * Mesmo quando a cliente possuir
   * um preço especial ainda menor,
   * as informações da promoção podem
   * continuar disponíveis para
   * apresentação no frontend.
   */
  promotionActive:
    boolean;

  promotionPriceCents:
    number | null;

  promotionLabel:
    string | null;

  promotionStartsOn:
    string | null;

  promotionEndsOn:
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