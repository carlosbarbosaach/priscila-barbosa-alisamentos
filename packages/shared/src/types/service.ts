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
   * Exemplo:
   *
   * FIXED
   * defaultPriceCents = 25000
   * → R$ 250,00
   *
   * STARTING_FROM
   * defaultPriceCents = 50000
   * → A partir de R$ 500,00
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
   * Etapas operacionais do serviço.
   *
   * Exemplo:
   *
   * Aplicação       60 min  ocupa
   * Ação produto    45 min  libera
   * Finalização     75 min  ocupa
   *
   * Serviço antigo sem configuração:
   * phases = []
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