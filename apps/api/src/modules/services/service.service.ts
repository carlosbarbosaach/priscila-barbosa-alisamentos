import type {
  Service,
} from "@priscila/shared";

import {
  Timestamp,
} from "firebase-admin/firestore";

import {
  mapServiceEntityToService,
} from "./service.mapper.js";

import {
  ServiceRepository,
} from "./service.repository.js";

import type {
  CreateServiceInput,
  ServicePromotionInput,
  UpdateServiceInput,
} from "./service.schema.js";

import type {
  ServiceDocument,
} from "./service.types.js";

export class ServiceService {
  constructor(
    private readonly serviceRepository =
      new ServiceRepository(),
  ) {}

  async findById(
    salonId:
      string,

    serviceId:
      string,
  ): Promise<
    Service | null
  > {
    const service =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!service) {
      return null;
    }

    return mapServiceEntityToService(
      service,
    );
  }

  async findAll(
    salonId:
      string,
  ): Promise<
    Service[]
  > {
    const services =
      await this
        .serviceRepository
        .findAllBySalon(
          salonId,
        );

    return services.map(
      mapServiceEntityToService,
    );
  }

  /*
   * =================================
   * CRIAR SERVIÇO
   * =================================
   */
  async create(
    salonId:
      string,

    serviceId:
      string,

    input:
      CreateServiceInput,
  ): Promise<
    Service
  > {
    const existingService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (existingService) {
      throw new Error(
        "Já existe um serviço com esse ID.",
      );
    }

    const now =
      Timestamp.now();

    await this
      .serviceRepository
      .create(
        serviceId,
        {
          salonId,

          name:
            input.name,

          description:
            null,

          category:
            "SERVICOS",

          /*
           * Temporariamente usamos
           * 3 horas como duração padrão.
           */
          durationMinutes:
            180,

          defaultPriceCents:
            input
              .defaultPriceCents,

          priceType:
            input
              .priceType,

          /*
           * =================================
           * PROMOÇÃO
           * =================================
           *
           * Todo serviço nasce sem
           * promoção configurada.
           */
          promotionActive:
            false,

          promotionPriceCents:
            null,

          promotionLabel:
            null,

          promotionStartsOn:
            null,

          promotionEndsOn:
            null,

          active:
            true,

          createdAt:
            now,

          updatedAt:
            now,
        },
      );

    const createdService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!createdService) {
      throw new Error(
        "Não foi possível localizar o serviço após a criação.",
      );
    }

    return mapServiceEntityToService(
      createdService,
    );
  }

  /*
   * =================================
   * EDITAR SERVIÇO
   * =================================
   */
  async update(
    salonId:
      string,

    serviceId:
      string,

    input:
      UpdateServiceInput,
  ): Promise<
    Service
  > {
    const existingService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!existingService) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    /*
     * =================================
     * PROTEÇÃO DA PROMOÇÃO
     * =================================
     *
     * Imagine:
     *
     * preço normal = R$ 300
     * promoção = R$ 250
     *
     * ADMIN tenta alterar o preço
     * normal para R$ 200.
     *
     * A promoção de R$ 250 deixaria
     * de fazer sentido.
     *
     * Por isso impedimos a alteração
     * enquanto a promoção estiver
     * administrativamente ativa.
     */
    if (
      input.defaultPriceCents !==
        undefined &&
      existingService
        .promotionActive ===
        true &&
      existingService
        .promotionPriceCents !==
        undefined &&
      existingService
        .promotionPriceCents !==
        null &&
      existingService
        .promotionPriceCents >=
        input.defaultPriceCents
    ) {
      throw new Error(
        "O novo preço do serviço precisa ser maior que o preço promocional atual. Retire ou altere a promoção antes de continuar.",
      );
    }

    const updateData:
      Partial<ServiceDocument> = {
        updatedAt:
          Timestamp.now(),
      };

    if (
      input.name !==
      undefined
    ) {
      updateData.name =
        input.name;
    }

    if (
      input.defaultPriceCents !==
      undefined
    ) {
      updateData
        .defaultPriceCents =
        input
          .defaultPriceCents;
    }

    if (
      input.priceType !==
      undefined
    ) {
      updateData.priceType =
        input.priceType;
    }

    await this
      .serviceRepository
      .update(
        salonId,
        serviceId,
        updateData,
      );

    const updatedService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!updatedService) {
      throw new Error(
        "Não foi possível localizar o serviço após a atualização.",
      );
    }

    return mapServiceEntityToService(
      updatedService,
    );
  }

  /*
   * =================================
   * ATIVAR / DESATIVAR SERVIÇO
   * =================================
   */
  async setActive(
    salonId:
      string,

    serviceId:
      string,

    active:
      boolean,
  ): Promise<
    Service
  > {
    await this
      .serviceRepository
      .update(
        salonId,
        serviceId,
        {
          active,

          updatedAt:
            Timestamp.now(),
        },
      );

    const updatedService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!updatedService) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    return mapServiceEntityToService(
      updatedService,
    );
  }

  /*
   * =================================
   * PROMOÇÃO
   * =================================
   *
   * Permite ao ADMIN:
   *
   * - configurar promoção;
   * - alterar promoção existente;
   * - encerrar promoção antecipadamente.
   *
   * Encerrar antecipadamente NÃO
   * apaga os dados configurados.
   */
  async setPromotion(
    salonId:
      string,

    serviceId:
      string,

    input:
      ServicePromotionInput,
  ): Promise<
    Service
  > {
    const existingService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!existingService) {
      throw new Error(
        "Serviço não encontrado.",
      );
    }

    /*
     * =================================
     * ENCERRAR PROMOÇÃO
     * =================================
     *
     * Somente desativamos.
     *
     * Preservamos:
     *
     * - promotionPriceCents;
     * - promotionLabel;
     * - promotionStartsOn;
     * - promotionEndsOn.
     *
     * Isso mantém a configuração e
     * o histórico da promoção.
     */
    if (!input.active) {
      await this
        .serviceRepository
        .update(
          salonId,
          serviceId,
          {
            promotionActive:
              false,

            updatedAt:
              Timestamp.now(),
          },
        );

      const updatedService =
        await this
          .serviceRepository
          .findById(
            salonId,
            serviceId,
          );

      if (!updatedService) {
        throw new Error(
          "Não foi possível localizar o serviço após encerrar a promoção.",
        );
      }

      return mapServiceEntityToService(
        updatedService,
      );
    }

    /*
     * =================================
     * ATIVAR / ATUALIZAR PROMOÇÃO
     * =================================
     */
    const promotionPriceCents =
      input.promotionPriceCents;

    const promotionStartsOn =
      input.promotionStartsOn;

    const promotionEndsOn =
      input.promotionEndsOn;

    /*
     * Proteções defensivas.
     *
     * O schema já valida estes campos,
     * mas o Service também protege sua
     * regra de negócio caso futuramente
     * seja chamado por outro fluxo.
     */
    if (
      promotionPriceCents ===
        undefined ||
      promotionPriceCents ===
        null
    ) {
      throw new Error(
        "Informe o preço promocional.",
      );
    }

    if (
      promotionStartsOn ===
        undefined ||
      promotionStartsOn ===
        null
    ) {
      throw new Error(
        "Informe a data inicial da promoção.",
      );
    }

    if (
      promotionEndsOn ===
        undefined ||
      promotionEndsOn ===
        null
    ) {
      throw new Error(
        "Informe a data final da promoção.",
      );
    }

    if (
      promotionStartsOn >
      promotionEndsOn
    ) {
      throw new Error(
        "A data final da promoção deve ser igual ou posterior à data inicial.",
      );
    }

    /*
     * A promoção precisa ser realmente
     * menor que o preço padrão.
     *
     * Esta regra continua valendo tanto
     * para FIXED quanto STARTING_FROM.
     *
     * Em STARTING_FROM, esse valor
     * promocional representa o valor
     * inicial divulgado. A exigência
     * de preço final na conclusão
     * continuará sendo tratada no
     * fluxo do atendimento.
     */
    if (
      promotionPriceCents >=
      existingService
        .defaultPriceCents
    ) {
      throw new Error(
        "O preço promocional precisa ser menor que o preço normal do serviço.",
      );
    }

    const promotionLabel =
      input.promotionLabel
        ?.trim() ||
      "Promoção";

    await this
      .serviceRepository
      .update(
        salonId,
        serviceId,
        {
          promotionActive:
            true,

          promotionPriceCents,

          promotionLabel,

          promotionStartsOn,

          promotionEndsOn,

          updatedAt:
            Timestamp.now(),
        },
      );

    const updatedService =
      await this
        .serviceRepository
        .findById(
          salonId,
          serviceId,
        );

    if (!updatedService) {
      throw new Error(
        "Não foi possível localizar o serviço após ativar a promoção.",
      );
    }

    return mapServiceEntityToService(
      updatedService,
    );
  }
}