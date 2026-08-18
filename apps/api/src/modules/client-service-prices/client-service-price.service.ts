import type {
  ClientServicePrice,
} from "@priscila/shared";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  ClientRepository,
} from "../clients/client.repository.js";

import {
  ServiceRepository,
} from "../services/service.repository.js";

import {
  mapClientServicePriceEntityToClientServicePrice,
} from "./client-service-price.mapper.js";

import {
  ClientServicePriceRepository,
} from "./client-service-price.repository.js";

export type SpecialPriceOverviewItem = {
  id: string;

  clientId: string;
  clientName: string;
  clientPhone: string;

  serviceId: string;
  serviceName: string;

  defaultPriceCents: number;
  specialPriceCents: number;
  differenceCents: number;
};

export type SpecialPriceOverview = {
  summary: {
    clientsWithSpecialPrice: number;

    activeSpecialPrices: number;

    servicesWithSpecialPrice: number;
  };

  prices:
    SpecialPriceOverviewItem[];
};

export class ClientServicePriceService {
  constructor(
    private readonly priceRepository =
      new ClientServicePriceRepository(),

    private readonly clientRepository =
      new ClientRepository(),

    private readonly serviceRepository =
      new ServiceRepository(),
  ) {}

  /*
   * ==============================
   * VISÃO GERAL DOS PREÇOS ESPECIAIS
   * ==============================
   *
   * Utilizado pela página:
   *
   * /admin/precos-especiais
   *
   * Retorna somente preços especiais
   * que estejam ATIVOS.
   */
  async findOverviewBySalon(
    salonId: string,
  ): Promise<SpecialPriceOverview> {
    /*
     * As três consultas são
     * independentes.
     *
     * Portanto fazemos em paralelo
     * para evitar várias consultas
     * individuais no Firestore.
     */
    const [
      prices,
      clients,
      services,
    ] =
      await Promise.all([
        this.priceRepository
          .findAllBySalon(
            salonId,
          ),

        this.clientRepository
          .findAllBySalon(
            salonId,
          ),

        this.serviceRepository
          .findAllBySalon(
            salonId,
          ),
      ]);

    /*
     * A tela deve mostrar somente
     * clientes que atualmente possuem
     * preço especial ativo.
     */
    const activePrices =
      prices.filter(
        (price) =>
          price.active,
      );

    /*
     * Maps para evitar ficar procurando
     * cliente/serviço repetidamente.
     */
    const clientsById =
      new Map(
        clients.map(
          (client) => [
            client.id,
            client,
          ],
        ),
      );

    const servicesById =
      new Map(
        services.map(
          (service) => [
            service.id,
            service,
          ],
        ),
      );

    const overviewPrices:
      SpecialPriceOverviewItem[] =
      [];

    for (
      const price
      of activePrices
    ) {
      const client =
        clientsById.get(
          price.clientId,
        );

      const service =
        servicesById.get(
          price.serviceId,
        );

      /*
       * Proteção para documentos
       * órfãos.
       *
       * Se por algum motivo existir
       * preço apontando para cliente
       * ou serviço inexistente,
       * não exibimos uma linha
       * incompleta na administração.
       */
      if (
        !client ||
        !service
      ) {
        continue;
      }

      const differenceCents =
        Math.max(
          0,
          service.defaultPriceCents -
            price.priceCents,
        );

      overviewPrices.push({
        id:
          price.id,

        clientId:
          client.id,

        clientName:
          client.name,

        clientPhone:
          client.phone,

        serviceId:
          service.id,

        serviceName:
          service.name,

        defaultPriceCents:
          service.defaultPriceCents,

        specialPriceCents:
          price.priceCents,

        differenceCents,
      });
    }

    /*
     * Ordenação:
     *
     * 1. nome da cliente
     * 2. nome do serviço
     */
    overviewPrices.sort(
      (
        first,
        second,
      ) => {
        const clientComparison =
          first.clientName
            .localeCompare(
              second.clientName,
              "pt-BR",
            );

        if (
          clientComparison !==
          0
        ) {
          return clientComparison;
        }

        return first.serviceName
          .localeCompare(
            second.serviceName,
            "pt-BR",
          );
      },
    );

    /*
     * Clientes únicos.
     *
     * Uma cliente pode possuir vários
     * preços especiais e deve contar
     * apenas uma vez neste card.
     */
    const clientIds =
      new Set(
        overviewPrices.map(
          (price) =>
            price.clientId,
        ),
      );

    /*
     * Serviços únicos envolvidos
     * nos preços especiais.
     */
    const serviceIds =
      new Set(
        overviewPrices.map(
          (price) =>
            price.serviceId,
        ),
      );

    return {
      summary: {
        clientsWithSpecialPrice:
          clientIds.size,

        activeSpecialPrices:
          overviewPrices.length,

        servicesWithSpecialPrice:
          serviceIds.size,
      },

      prices:
        overviewPrices,
    };
  }

  /*
   * ==============================
   * LISTAR TODOS
   * ==============================
   */
  async findAllBySalon(
    salonId: string,
  ): Promise<ClientServicePrice[]> {
    const prices =
      await this.priceRepository
        .findAllBySalon(
          salonId,
        );

    return prices.map(
      mapClientServicePriceEntityToClientServicePrice,
    );
  }

  /*
   * ==============================
   * LISTAR POR CLIENTE
   * ==============================
   */
  async findAllByClient(
    salonId: string,
    clientId: string,
  ): Promise<ClientServicePrice[]> {
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

    const prices =
      await this.priceRepository
        .findAllByClient(
          salonId,
          clientId,
        );

    return prices.map(
      mapClientServicePriceEntityToClientServicePrice,
    );
  }

  /*
   * ==============================
   * CRIAR / ATUALIZAR
   * ==============================
   */
  async save(
    salonId: string,
    clientId: string,
    serviceId: string,
    priceCents: number,
  ): Promise<ClientServicePrice> {
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

    const service =
      await this.serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!service) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    const existingPrice =
      await this.priceRepository
        .findByClientAndService(
          salonId,
          clientId,
          serviceId,
        );

    const now =
      Timestamp.now();

    if (existingPrice) {
      await this.priceRepository
        .update(
          salonId,
          existingPrice.id,
          {
            priceCents,

            active:
              true,

            updatedAt:
              now,
          },
        );

      const updatedPrice =
        await this.priceRepository
          .findByClientAndService(
            salonId,
            clientId,
            serviceId,
          );

      if (!updatedPrice) {
        throw new Error(
          "Não foi possível localizar o preço especial após a atualização.",
        );
      }

      return mapClientServicePriceEntityToClientServicePrice(
        updatedPrice,
      );
    }

    const priceId =
      await this.priceRepository
        .create(
          clientId,
          serviceId,
          {
            salonId,

            clientId,

            serviceId,

            priceCents,

            active:
              true,

            createdAt:
              now,

            updatedAt:
              now,
          },
        );

    const createdPrice =
      await this.priceRepository
        .findById(
          salonId,
          priceId,
        );

    if (!createdPrice) {
      throw new Error(
        "Não foi possível localizar o preço especial após o cadastro.",
      );
    }

    return mapClientServicePriceEntityToClientServicePrice(
      createdPrice,
    );
  }

  /*
   * ==============================
   * ATIVAR / DESATIVAR
   * ==============================
   */
  async setActive(
    salonId: string,
    clientId: string,
    serviceId: string,
    active: boolean,
  ): Promise<ClientServicePrice> {
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

    const service =
      await this.serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!service) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    const existingPrice =
      await this.priceRepository
        .findByClientAndService(
          salonId,
          clientId,
          serviceId,
        );

    if (!existingPrice) {
      throw new Error(
        "Preço especial não encontrado.",
      );
    }

    await this.priceRepository
      .update(
        salonId,
        existingPrice.id,
        {
          active,

          updatedAt:
            Timestamp.now(),
        },
      );

    const updatedPrice =
      await this.priceRepository
        .findByClientAndService(
          salonId,
          clientId,
          serviceId,
        );

    if (!updatedPrice) {
      throw new Error(
        "Não foi possível localizar o preço especial após a alteração.",
      );
    }

    return mapClientServicePriceEntityToClientServicePrice(
      updatedPrice,
    );
  }
}