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

                    /*
                     * Informação interna.
                     */
                    category:
                        "SERVICOS",

                    /*
                     * Temporariamente
                     * usamos 3 horas como
                     * duração padrão.
                     */
                    durationMinutes:
                        180,

                    defaultPriceCents:
                        input
                            .defaultPriceCents,

                    /*
                     * FIXED
                     * ou
                     * STARTING_FROM
                     */
                    priceType:
                        input
                            .priceType,

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
            input
                .defaultPriceCents !==
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
}