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
   * Valor padrão/base cadastrado
   * no serviço.
   */
  defaultPriceCents:
    number;

  /*
   * Define como o preço padrão
   * deve ser apresentado:
   *
   * FIXED
   * → R$ 250,00
   *
   * STARTING_FROM
   * → A partir de R$ 500,00
   */
  priceType:
    ServicePriceType;

  /*
   * Valor efetivamente apresentado
   * para esta cliente.
   *
   * Pode ser:
   *
   * - preço padrão;
   * - preço especial da cliente.
   */
  priceCents:
    number;

  priceSource:
    AppointmentPriceSource;
};