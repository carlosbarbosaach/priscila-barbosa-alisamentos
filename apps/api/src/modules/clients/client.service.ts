import type { Client } from "@priscila/shared";
import { Timestamp } from "firebase-admin/firestore";

import { mapClientEntityToClient } from "./client.mapper.js";
import { normalizeBrazilPhone } from "./client-phone.js";
import { ClientRepository } from "./client.repository.js";

import type {
    CreateClientInput,
    UpdateClientInput,
} from "./client.schema.js";

import type { ClientDocument } from "./client.types.js";

export class ClientService {
    constructor(
        private readonly clientRepository =
            new ClientRepository(),
    ) { }

    async findById(
        salonId: string,
        clientId: string,
    ): Promise<Client | null> {
        const client =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!client) {
            return null;
        }

        return mapClientEntityToClient(client);
    }

    async findAll(
        salonId: string,
    ): Promise<Client[]> {
        const clients =
            await this.clientRepository.findAllBySalon(
                salonId,
            );

        return clients.map(
            mapClientEntityToClient,
        );
    }

    async create(
        salonId: string,
        clientId: string,
        input: CreateClientInput,
    ): Promise<Client> {
        const normalizedPhone =
            normalizeBrazilPhone(input.phone);

        const clientWithSamePhone =
            await this.clientRepository.findByPhone(
                salonId,
                normalizedPhone,
            );

        if (clientWithSamePhone) {
            throw new Error(
                "Já existe uma cliente cadastrada com este telefone.",
            );
        }

        const now = Timestamp.now();

        await this.clientRepository.create(
            clientId,
            {
                salonId,

                // Cadastro manual feito pelo ADMIN.
                // O vínculo com Firebase Auth poderá
                // acontecer futuramente.
                userId: null,

                name: input.name,

                phone: normalizedPhone,

                email:
                    input.email?.toLowerCase() ??
                    null,

                active: true,

                createdAt: now,
                updatedAt: now,
            },
        );

        const createdClient =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!createdClient) {
            throw new Error(
                "Não foi possível localizar a cliente após o cadastro.",
            );
        }

        return mapClientEntityToClient(
            createdClient,
        );
    }

    async update(
        salonId: string,
        clientId: string,
        input: UpdateClientInput,
    ): Promise<Client> {
        const existingClient =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!existingClient) {
            throw new Error(
                "Cliente não encontrada.",
            );
        }

        const updateData: Partial<ClientDocument> = {
            updatedAt: Timestamp.now(),
        };

        if (input.name !== undefined) {
            updateData.name = input.name;
        }

        if (input.email !== undefined) {
            updateData.email =
                input.email?.toLowerCase() ??
                null;
        }

        if (input.phone !== undefined) {
            const normalizedPhone =
                normalizeBrazilPhone(
                    input.phone,
                );

            const clientWithSamePhone =
                await this.clientRepository.findByPhone(
                    salonId,
                    normalizedPhone,
                );

            if (
                clientWithSamePhone &&
                clientWithSamePhone.id !== clientId
            ) {
                throw new Error(
                    "Já existe outra cliente cadastrada com este telefone.",
                );
            }

            updateData.phone =
                normalizedPhone;
        }

        await this.clientRepository.update(
            salonId,
            clientId,
            updateData,
        );

        const updatedClient =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!updatedClient) {
            throw new Error(
                "Não foi possível localizar a cliente após a atualização.",
            );
        }

        return mapClientEntityToClient(
            updatedClient,
        );
    }

    async setActive(
        salonId: string,
        clientId: string,
        active: boolean,
    ): Promise<Client> {
        const existingClient =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!existingClient) {
            throw new Error(
                "Cliente não encontrada.",
            );
        }

        await this.clientRepository.update(
            salonId,
            clientId,
            {
                active,
                updatedAt: Timestamp.now(),
            },
        );

        const updatedClient =
            await this.clientRepository.findById(
                salonId,
                clientId,
            );

        if (!updatedClient) {
            throw new Error(
                "Não foi possível localizar a cliente após a alteração de status.",
            );
        }

        return mapClientEntityToClient(
            updatedClient,
        );
    }
}