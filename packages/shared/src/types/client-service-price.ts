export type ClientServicePrice = {
  id: string;

  salonId: string;

  clientId: string;
  serviceId: string;

  /**
   * Preço especial em centavos.
   *
   * Exemplo:
   * R$ 250,00 = 25000
   */
  priceCents: number;

  active: boolean;

  createdAt: string;
  updatedAt: string;
};