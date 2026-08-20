export const APPOINTMENT_PRICE_SOURCE = {
  SERVICE_DEFAULT:
    "SERVICE_DEFAULT",

  CLIENT_SPECIAL:
    "CLIENT_SPECIAL",

  /*
   * O valor utilizado no agendamento
   * veio de uma promoção ativa
   * do serviço.
   */
  PROMOTION:
    "PROMOTION",
} as const;

export type AppointmentPriceSource =
  typeof APPOINTMENT_PRICE_SOURCE[
    keyof typeof APPOINTMENT_PRICE_SOURCE
  ];