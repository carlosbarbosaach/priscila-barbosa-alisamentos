import type {
  ServicePhase,
} from "./service-phase.js";

/*
 * Forma como o preço do serviço
 * deve ser apresentado.
 *
 * FIXED:
 * R$ 250,00
 *
 * STARTING_FROM:
 * A partir de R$ 500,00
 */
export const SERVICE_PRICE_TYPES = {
  FIXED:
    "FIXED",

  STARTING_FROM:
    "STARTING_FROM",
} as const;

export type ServicePriceType =
  typeof SERVICE_PRICE_TYPES[
    keyof typeof SERVICE_PRICE_TYPES
  ];

export type Service = {
  id:
    string;

  salonId:
    string;

  name:
    string;

  description:
    string | null;

  category:
    string;

  /*
   * Duração total prevista
   * do serviço.
   */
  durationMinutes:
    number;

  /*
   * Valor base do serviço.
   *
   * FIXED:
   * R$ 250,00
   *
   * STARTING_FROM:
   * A partir de R$ 500,00
   */
  defaultPriceCents:
    number;

  /*
   * Define se o preço é fixo
   * ou "a partir de".
   */
  priceType:
    ServicePriceType;

  /*
   * =================================
   * PROMOÇÃO
   * =================================
   *
   * promotionActive:
   * informa se a promoção está
   * habilitada administrativamente.
   *
   * Isso não significa, sozinho,
   * que ela esteja válida para a
   * data atual.
   *
   * promotionPriceCents:
   * valor promocional do serviço.
   *
   * promotionLabel:
   * texto exibido na badge.
   *
   * promotionStartsOn:
   * primeira data em que a promoção
   * pode ser aplicada.
   *
   * promotionEndsOn:
   * última data em que a promoção
   * pode ser aplicada.
   *
   * As datas utilizam o formato:
   *
   * YYYY-MM-DD
   *
   * Exemplo:
   *
   * promotionActive = true
   * promotionPriceCents = 25000
   * promotionLabel = "Promoção de setembro"
   * promotionStartsOn = "2026-09-01"
   * promotionEndsOn = "2026-09-30"
   *
   * A validade por data será calculada
   * considerando America/Sao_Paulo.
   *
   * A data inicial e a data final
   * são inclusivas.
   *
   * Ao encerrar antecipadamente uma
   * promoção, somente promotionActive
   * será alterado para false.
   *
   * Os demais dados permanecem salvos
   * para histórico/configuração.
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
   * Etapas operacionais do serviço.
   */
  phases:
    ServicePhase[];

  active:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
};