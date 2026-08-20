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

import {
  AppointmentDateTimeService,
} from "./appointment-datetime.service.js";

type ResolveAppointmentPriceInput = {
  salonId:
  string;

  clientId:
  string;

  serviceId:
  string;
};

export type ResolvedAppointmentPrice = {
  priceCents:
  number;

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

    private readonly dateTimeService =
      new AppointmentDateTimeService(),
  ) { }

  async resolve(
    input:
      ResolveAppointmentPriceInput,
  ): Promise<
    ResolvedAppointmentPrice
  > {
    const {
      salonId,
      clientId,
      serviceId,
    } =
      input;

    /*
     * =================================
     * 1. CLIENTE
     * =================================
     */
    const client =
      await this
        .clientRepository
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
        "Cliente inativa não pode realizar novos agendamentos.",
      );
    }

    /*
     * =================================
     * 2. SERVIÇO
     * =================================
     */
    const service =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!service) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    if (!service.active) {
      throw new Error(
        "Serviço indisponível para novos agendamentos.",
      );
    }

    /*
     * =================================
     * PREÇO PADRÃO
     * =================================
     */
    if (
      !Number.isInteger(
        service
          .defaultPriceCents,
      ) ||
      service
        .defaultPriceCents <
      0
    ) {
      throw new Error(
        "O serviço possui preço padrão inválido.",
      );
    }

    /*
     * Começamos sempre pelo
     * preço normal do serviço.
     */
    let priceCents =
      service
        .defaultPriceCents;

    let priceSource:
      AppointmentPriceSource =
      APPOINTMENT_PRICE_SOURCE
        .SERVICE_DEFAULT;

    /*
     * =================================
     * 3. PROMOÇÃO
     * =================================
     *
     * Uma promoção somente pode
     * participar da resolução do
     * preço quando:
     *
     * - estiver ativa;
     * - possuir data inicial;
     * - possuir data final;
     * - hoje for >= data inicial;
     * - hoje for <= data final.
     *
     * A data atual é calculada no
     * timezone oficial do salão:
     *
     * America/Sao_Paulo.
     *
     * As duas extremidades são
     * inclusivas.
     */
    const promotionActive =
      service
        .promotionActive ??
      false;

    const promotionStartsOn =
      service
        .promotionStartsOn ??
      null;

    const promotionEndsOn =
      service
        .promotionEndsOn ??
      null;

    const todayDateKey =
      this
        .dateTimeService
        .toSalonDateKey();

    const promotionIsValidToday =
      promotionActive &&
      promotionStartsOn !==
      null &&
      promotionEndsOn !==
      null &&
      todayDateKey >=
      promotionStartsOn &&
      todayDateKey <=
      promotionEndsOn;

    /*
     * Serviços antigos podem possuir
     * promotionActive = true sem as
     * novas datas.
     *
     * Nesse caso a promoção NÃO é
     * aplicada.
     *
     * Isso evita conceder preço
     * promocional fora de um período
     * explicitamente configurado.
     */
    if (
      promotionIsValidToday
    ) {
      const promotionPriceCents =
        service
          .promotionPriceCents;

      if (
        promotionPriceCents ===
        undefined ||
        promotionPriceCents ===
        null ||
        !Number.isInteger(
          promotionPriceCents,
        ) ||
        promotionPriceCents <=
        0
      ) {
        throw new Error(
          "O serviço possui preço promocional inválido.",
        );
      }

      /*
       * A promoção precisa ser
       * menor que o valor normal.
       *
       * Esta proteção impede que
       * uma alteração manual no
       * Firestore gere cobrança
       * incorreta.
       */
      if (
        promotionPriceCents >=
        service
          .defaultPriceCents
      ) {
        throw new Error(
          "O preço promocional precisa ser menor que o preço normal do serviço.",
        );
      }

      priceCents =
        promotionPriceCents;

      priceSource =
        APPOINTMENT_PRICE_SOURCE
          .PROMOTION;
    }

    /*
     * =================================
     * 4. PREÇO ESPECIAL
     * =================================
     *
     * cliente + serviço
     */
    const specialPrice =
      await this
        .priceRepository
        .findByClientAndService(
          salonId,
          clientId,
          serviceId,
        );

    if (
      specialPrice &&
      specialPrice.active
    ) {
      if (
        !Number.isInteger(
          specialPrice
            .priceCents,
        ) ||
        specialPrice
          .priceCents <
        0
      ) {
        throw new Error(
          "O preço especial da cliente é inválido.",
        );
      }

      /*
       * =================================
       * MENOR PREÇO VENCE
       * =================================
       *
       * Exemplo:
       *
       * normal    300
       * promoção  270
       * especial  250
       *
       * ↓
       *
       * 250 CLIENT_SPECIAL
       *
       *
       * Exemplo:
       *
       * normal    300
       * promoção  220
       * especial  250
       *
       * ↓
       *
       * 220 PROMOTION
       *
       *
       * EMPATE:
       *
       * promoção  250
       * especial  250
       *
       * ↓
       *
       * 250 CLIENT_SPECIAL
       *
       * O <= é proposital para
       * garantir essa prioridade.
       */
      if (
        specialPrice
          .priceCents <=
        priceCents
      ) {
        priceCents =
          specialPrice
            .priceCents;

        priceSource =
          APPOINTMENT_PRICE_SOURCE
            .CLIENT_SPECIAL;
      }
    }

    return {
      priceCents,
      priceSource,
    };
  }
}