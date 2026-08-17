import type {
    ClientServicePrice,
} from "@priscila/shared";

import { Timestamp } from "firebase-admin/firestore";

import { ClientRepository } from "../clients/client.repository.js";
import { ServiceRepository } from "../services/service.repository.js";

import { mapClientServicePriceEntityToClientServicePrice } from "./client-service-price.mapper.js";

import { ClientServicePriceRepository } from "./client-service-price.repository.js";

export class ClientServicePriceService {
    constructor(
        private readonly priceRepository =
            new ClientServicePriceRepository(),

        private readonly clientRepository =
            new ClientRepository(),

        private readonly serviceRepository =
            new ServiceRepository(),
    ) {}

    async findAllBySalon(
        salonId: string,
    ): Promise<ClientServicePrice[]> {
        const prices =
            await this.priceRepository.findAllBySalon(
                salonId,
            );

        return prices.map(
            mapClientServicePriceEntityToClientServicePrice,
        );
    }

    async findAllByClient(
        salonId: string,
        clientId: string,
    ): Promise<ClientServicePrice[]> {
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

        const prices =
            await this.priceRepository.findAllByClient(
                salonId,
                clientId,
            );

        return prices.map(
            mapClientServicePriceEntityToClientServicePrice,
        );
    }

    async save(
        salonId: string,
        clientId: string,
        serviceId: string,
        priceCents: number,
    ): Promise<ClientServicePrice> {
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

        const existingPrice =
            await this.priceRepository.findByClientAndService(
                salonId,
                clientId,
                serviceId,
            );

        const now = Timestamp.now();

        if (existingPrice) {
            await this.priceRepository.update(
                salonId,
                existingPrice.id,
                {
                    priceCents,
                    active: true,
                    updatedAt: now,
                },
            );

            const updatedPrice =
                await this.priceRepository.findByClientAndService(
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
            await this.priceRepository.create(
                clientId,
                serviceId,
                {
                    salonId,

                    clientId,
                    serviceId,

                    priceCents,

                    active: true,

                    createdAt: now,
                    updatedAt: now,
                },
            );

        const createdPrice =
            await this.priceRepository.findById(
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

    async setActive(
        salonId: string,
        clientId: string,
        serviceId: string,
        active: boolean,
    ): Promise<ClientServicePrice> {
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

        const existingPrice =
            await this.priceRepository.findByClientAndService(
                salonId,
                clientId,
                serviceId,
            );

        if (!existingPrice) {
            throw new Error(
                "Preço especial não encontrado.",
            );
        }

        await this.priceRepository.update(
            salonId,
            existingPrice.id,
            {
                active,
                updatedAt: Timestamp.now(),
            },
        );

        const updatedPrice =
            await this.priceRepository.findByClientAndService(
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