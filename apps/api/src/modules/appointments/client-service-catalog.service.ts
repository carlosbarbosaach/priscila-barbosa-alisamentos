import {
    APPOINTMENT_PRICE_SOURCE,
    SERVICE_PRICE_TYPES,
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

import {
    AppointmentDateTimeService,
} from "./appointment-datetime.service.js";

type GetClientServiceCatalogInput = {
    salonId:
        string;

    clientId:
        string;
};

export class ClientServiceCatalogService {
    constructor(
        private readonly clientRepository =
            new ClientRepository(),

        private readonly serviceRepository =
            new ServiceRepository(),

        private readonly priceRepository =
            new ClientServicePriceRepository(),

        private readonly dateTimeService =
            new AppointmentDateTimeService(),
    ) {}

    async getCatalog(
        input:
            GetClientServiceCatalogInput,
    ): Promise<
        ClientBookableService[]
    > {
        const {
            salonId,
            clientId,
        } =
            input;

        if (
            !salonId ||
            salonId
                .trim()
                .length ===
                0
        ) {
            throw new Error(
                "Salão não informado.",
            );
        }

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
                "Cliente inativa.",
            );
        }

        /*
         * =================================
         * 2. DADOS NECESSÁRIOS
         * =================================
         *
         * Mantemos somente duas consultas:
         *
         * - serviços do salão;
         * - preços especiais da cliente.
         */
        const [
            services,
            specialPrices,
        ] =
            await Promise.all([
                this
                    .serviceRepository
                    .findAllBySalon(
                        salonId,
                    ),

                this
                    .priceRepository
                    .findAllByClient(
                        salonId,
                        clientId,
                    ),
            ]);

        /*
         * serviceId
         * ↓
         * preço especial ativo.
         */
        const specialPriceByServiceId =
            new Map(
                specialPrices
                    .filter(
                        (
                            price,
                        ) =>
                            price.active,
                    )
                    .map(
                        (
                            price,
                        ) => [
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
                (
                    service,
                ) =>
                    service.active,
            );

        /*
         * =================================
         * DATA ATUAL DO SALÃO
         * =================================
         *
         * Calculamos uma única vez para
         * todo o catálogo.
         *
         * Formato:
         *
         * YYYY-MM-DD
         *
         * Timezone:
         *
         * America/Sao_Paulo
         */
        const todayDateKey =
            this
                .dateTimeService
                .toSalonDateKey();

        return activeServices.map(
            (
                service,
            ) => {
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
                        `O serviço "${service.name}" possui preço inválido.`,
                    );
                }

                /*
                 * =================================
                 * DURAÇÃO
                 * =================================
                 */
                if (
                    !Number.isInteger(
                        service
                            .durationMinutes,
                    ) ||
                    service
                        .durationMinutes <=
                        0
                ) {
                    throw new Error(
                        `O serviço "${service.name}" possui duração inválida.`,
                    );
                }

                /*
                 * =================================
                 * TIPO DE PREÇO
                 * =================================
                 *
                 * Serviço antigo sem priceType
                 * continua sendo FIXED.
                 */
                const priceType =
                    service.priceType ??
                    SERVICE_PRICE_TYPES
                        .FIXED;

                /*
                 * =================================
                 * PROMOÇÃO
                 * =================================
                 *
                 * Para a CLIENTE, promotionActive
                 * representa uma promoção
                 * efetivamente válida AGORA.
                 *
                 * Não basta estar habilitada
                 * administrativamente.
                 *
                 * É necessário:
                 *
                 * promotionActive === true
                 *
                 * E
                 *
                 * hoje >= promotionStartsOn
                 *
                 * E
                 *
                 * hoje <= promotionEndsOn
                 */
                const promotionConfiguredAsActive =
                    service
                        .promotionActive ??
                    false;

                const configuredPromotionStartsOn =
                    service
                        .promotionStartsOn ??
                    null;

                const configuredPromotionEndsOn =
                    service
                        .promotionEndsOn ??
                    null;

                const promotionIsValidToday =
                    promotionConfiguredAsActive &&
                    configuredPromotionStartsOn !==
                        null &&
                    configuredPromotionEndsOn !==
                        null &&
                    todayDateKey >=
                        configuredPromotionStartsOn &&
                    todayDateKey <=
                        configuredPromotionEndsOn;

                /*
                 * Os campos abaixo são os dados
                 * promocionais efetivamente
                 * apresentados à CLIENTE.
                 *
                 * Promoção futura, expirada ou
                 * encerrada não será apresentada
                 * como promoção ativa.
                 */
                const promotionActive =
                    promotionIsValidToday;

                let promotionPriceCents:
                    number | null =
                    null;

                let promotionLabel:
                    string | null =
                    null;

                let promotionStartsOn:
                    string | null =
                    null;

                let promotionEndsOn:
                    string | null =
                    null;

                if (
                    promotionIsValidToday
                ) {
                    const rawPromotionPrice =
                        service
                            .promotionPriceCents;

                    /*
                     * Uma promoção válida precisa
                     * possuir um preço válido.
                     */
                    if (
                        rawPromotionPrice ===
                            undefined ||
                        rawPromotionPrice ===
                            null ||
                        !Number.isInteger(
                            rawPromotionPrice,
                        ) ||
                        rawPromotionPrice <=
                            0
                    ) {
                        throw new Error(
                            `A promoção do serviço "${service.name}" possui preço inválido.`,
                        );
                    }

                    /*
                     * Proteção contra inconsistência
                     * direta no Firestore.
                     *
                     * A promoção precisa ser
                     * realmente menor que o preço
                     * normal.
                     */
                    if (
                        rawPromotionPrice >=
                        service
                            .defaultPriceCents
                    ) {
                        throw new Error(
                            `A promoção do serviço "${service.name}" precisa ser menor que o preço normal.`,
                        );
                    }

                    promotionPriceCents =
                        rawPromotionPrice;

                    promotionLabel =
                        service
                            .promotionLabel
                            ?.trim() ||
                        "Promoção";

                    promotionStartsOn =
                        configuredPromotionStartsOn;

                    promotionEndsOn =
                        configuredPromotionEndsOn;
                }

                /*
                 * =================================
                 * PREÇO ESPECIAL
                 * =================================
                 */
                const specialPrice =
                    specialPriceByServiceId
                        .get(
                            service.id,
                        );

                if (
                    specialPrice
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
                            `O preço especial do serviço "${service.name}" é inválido.`,
                        );
                    }
                }

                /*
                 * =================================
                 * RESOLUÇÃO DO MELHOR PREÇO
                 * =================================
                 *
                 * Começamos sempre pelo
                 * preço normal.
                 */
                let priceCents =
                    service
                        .defaultPriceCents;

                let priceSource:
                    ClientBookableService["priceSource"] =
                    APPOINTMENT_PRICE_SOURCE
                        .SERVICE_DEFAULT;

                /*
                 * =================================
                 * PROMOÇÃO VÁLIDA
                 * =================================
                 */
                if (
                    promotionActive &&
                    promotionPriceCents !==
                        null &&
                    promotionPriceCents <
                        priceCents
                ) {
                    priceCents =
                        promotionPriceCents;

                    priceSource =
                        APPOINTMENT_PRICE_SOURCE
                            .PROMOTION;
                }

                /*
                 * =================================
                 * PREÇO ESPECIAL DA CLIENTE
                 * =================================
                 *
                 * O menor preço vence.
                 *
                 * Usamos <= propositalmente.
                 *
                 * Em caso de empate:
                 *
                 * CLIENT_SPECIAL vence.
                 */
                if (
                    specialPrice &&
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

                /*
                 * =================================
                 * CATÁLOGO DA CLIENTE
                 * =================================
                 */
                return {
                    id:
                        service.id,

                    name:
                        service.name,

                    description:
                        service
                            .description,

                    category:
                        service.category,

                    durationMinutes:
                        service
                            .durationMinutes,

                    defaultPriceCents:
                        service
                            .defaultPriceCents,

                    priceType,

                    promotionActive,

                    promotionPriceCents,

                    promotionLabel,

                    promotionStartsOn,

                    promotionEndsOn,

                    priceCents,

                    priceSource,
                };
            },
        );
    }
}