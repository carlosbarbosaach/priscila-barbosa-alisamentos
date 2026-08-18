import {
  APPOINTMENT_PRICE_SOURCE,
  type ClientBookableService,
} from "@priscila/shared";

import {
  ClientRepository,
} from "../clients/client.repository.js";

import {
  ClientServicePriceRepository,
} from "../client-service-prices/client-service-price.repository.js";

import {
  ServiceRepository,
} from "../services/service.repository.js";

type GetClientServiceCatalogInput = {
  salonId: string;
  clientId: string;
};

export class ClientServiceCatalogService {
  constructor(
    private readonly clientRepository =
      new ClientRepository(),

    private readonly serviceRepository =
      new ServiceRepository(),

    private readonly priceRepository =
      new ClientServicePriceRepository(),
  ) {}

  async getCatalog(
    input: GetClientServiceCatalogInput,
  ): Promise<ClientBookableService[]> {
    const {
      salonId,
      clientId,
    } = input;

    if (
      !salonId ||
      salonId.trim().length === 0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    /*
     * 1. Confirma que a CLIENT
     * realmente pertence ao salão.
     */
    const client =
      await this.clientRepository
        .findById(
          salonId,
          clientId,
        );

    if (!client) {
      throw new Error(
        "Cliente não encontrada.",
      );
    }

    if (!client.active) {
      throw new Error(
        "Cliente inativa.",
      );
    }

    /*
     * 2. Fazemos somente duas consultas:
     *
     * - serviços do salão
     * - preços especiais da cliente
     */
    const [
      services,
      specialPrices,
    ] =
      await Promise.all([
        this.serviceRepository
          .findAllBySalon(
            salonId,
          ),

        this.priceRepository
          .findAllByClient(
            salonId,
            clientId,
          ),
      ]);

    /*
     * Criamos um Map:
     *
     * serviceId
     * ↓
     * preço especial
     *
     * Isso evita ficar percorrendo
     * todos os preços para cada serviço.
     */
    const specialPriceByServiceId =
      new Map(
        specialPrices
          .filter(
            (price) =>
              price.active,
          )
          .map(
            (price) => [
              price.serviceId,
              price,
            ],
          ),
      );

    /*
     * A CLIENT somente enxerga
     * serviços ativos.
     */
    const activeServices =
      services.filter(
        (service) =>
          service.active,
      );

    return activeServices.map(
      (service) => {
        if (
          !Number.isInteger(
            service.defaultPriceCents,
          ) ||
          service.defaultPriceCents <
            0
        ) {
          throw new Error(
            `O serviço "${service.name}" possui preço inválido.`,
          );
        }

        if (
          !Number.isInteger(
            service.durationMinutes,
          ) ||
          service.durationMinutes <=
            0
        ) {
          throw new Error(
            `O serviço "${service.name}" possui duração inválida.`,
          );
        }

        const specialPrice =
          specialPriceByServiceId.get(
            service.id,
          );

        /*
         * Existe preço especial ativo.
         */
        if (specialPrice) {
          if (
            !Number.isInteger(
              specialPrice.priceCents,
            ) ||
            specialPrice.priceCents <
              0
          ) {
            throw new Error(
              `O preço especial do serviço "${service.name}" é inválido.`,
            );
          }

          return {
            id:
              service.id,

            name:
              service.name,

            description:
              service.description,

            category:
              service.category,

            durationMinutes:
              service.durationMinutes,

            defaultPriceCents:
              service.defaultPriceCents,

            priceCents:
              specialPrice.priceCents,

            priceSource:
              APPOINTMENT_PRICE_SOURCE
                .CLIENT_SPECIAL,
          };
        }

        /*
         * Sem preço especial:
         * preço padrão do serviço.
         */
        return {
          id:
            service.id,

          name:
            service.name,

          description:
            service.description,

          category:
            service.category,

          durationMinutes:
            service.durationMinutes,

          defaultPriceCents:
            service.defaultPriceCents,

          priceCents:
            service.defaultPriceCents,

          priceSource:
            APPOINTMENT_PRICE_SOURCE
              .SERVICE_DEFAULT,
        };
      },
    );
  }
}