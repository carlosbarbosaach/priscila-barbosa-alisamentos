import {
  APPOINTMENT_PRICE_SOURCE,
  type AppointmentPriceSource,
} from "@priscila/shared";

import {
  ClientServicePriceRepository,
} from "../client-service-prices/client-service-price.repository.js";

import {
  ClientRepository,
} from "../clients/client.repository.js";

import {
  ServiceRepository,
} from "../services/service.repository.js";

type ResolveAppointmentPriceInput = {
  salonId: string;
  clientId: string;
  serviceId: string;
};

export type ResolvedAppointmentPrice = {
  priceCents: number;

  priceSource:
    AppointmentPriceSource;
};

export class AppointmentPriceResolverService {
  constructor(
    private readonly clientRepository =
      new ClientRepository(),

    private readonly serviceRepository =
      new ServiceRepository(),

    private readonly priceRepository =
      new ClientServicePriceRepository(),
  ) {}

  async resolve(
    input: ResolveAppointmentPriceInput,
  ): Promise<ResolvedAppointmentPrice> {
    const {
      salonId,
      clientId,
      serviceId,
    } = input;

    /*
     * 1. A cliente precisa existir
     * no mesmo salão.
     */
    const client =
      await this.clientRepository.findById(
        salonId,
        clientId,
      );

    if (!client) {
      throw new Error(
        "Cliente não encontrada.",
      );
    }

    /*
     * Cliente inativa não deve
     * realizar novos agendamentos.
     */
    if (!client.active) {
      throw new Error(
        "Cliente inativa não pode realizar novos agendamentos.",
      );
    }

    /*
     * 2. O serviço precisa existir
     * dentro do mesmo salão.
     */
    const service =
      await this.serviceRepository.findById(
        salonId,
        serviceId,
      );

    if (!service) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    /*
     * Serviço inativo não pode
     * receber novos agendamentos.
     */
    if (!service.active) {
      throw new Error(
        "Serviço indisponível para novos agendamentos.",
      );
    }

    /*
     * Segurança de dados:
     * preço padrão nunca pode ser
     * negativo.
     */
    if (
      !Number.isInteger(
        service.defaultPriceCents,
      ) ||
      service.defaultPriceCents < 0
    ) {
      throw new Error(
        "O serviço possui preço padrão inválido.",
      );
    }

    /*
     * 3. Procuramos preço especial
     * específico desta combinação:
     *
     * cliente + serviço.
     */
    const specialPrice =
      await this.priceRepository
        .findByClientAndService(
          salonId,
          clientId,
          serviceId,
        );

    /*
     * Existe preço especial ativo.
     */
    if (
      specialPrice &&
      specialPrice.active
    ) {
      if (
        !Number.isInteger(
          specialPrice.priceCents,
        ) ||
        specialPrice.priceCents <
          0
      ) {
        throw new Error(
          "O preço especial da cliente é inválido.",
        );
      }

      return {
        priceCents:
          specialPrice.priceCents,

        priceSource:
          APPOINTMENT_PRICE_SOURCE
            .CLIENT_SPECIAL,
      };
    }

    /*
     * 4. Sem preço especial ativo:
     * usamos o valor padrão atual
     * do serviço.
     */
    return {
      priceCents:
        service.defaultPriceCents,

      priceSource:
        APPOINTMENT_PRICE_SOURCE
          .SERVICE_DEFAULT,
    };
  }
}