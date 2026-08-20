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
   * atualmente ativa.
   *
   * promotionPriceCents:
   * valor promocional do serviço.
   *
   * promotionLabel:
   * texto exibido na badge.
   *
   * Exemplo:
   *
   * promotionActive = true
   * promotionPriceCents = 25000
   * promotionLabel = "Promoção"
   *
   * Normal:
   * R$ 300,00
   *
   * Promoção:
   * R$ 250,00
   */
  promotionActive:
    boolean;

  promotionPriceCents:
    number | null;

  promotionLabel:
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