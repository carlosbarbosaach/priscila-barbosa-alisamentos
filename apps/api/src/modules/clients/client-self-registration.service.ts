import type {
    Client,
} from "@priscila/shared";

import {
    Timestamp,
} from "firebase-admin/firestore";

import {
    mapClientEntityToClient,
} from "./client.mapper.js";

import {
    normalizeBrazilPhone,
} from "./client-phone.js";

import {
    ClientRepository,
} from "./client.repository.js";

type CompleteSelfRegistrationInput = {
    salonId: string;
    userId: string;

    email: string;
    name: string;
    phone: string;
};

export class ClientSelfRegistrationError
    extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);

        this.name =
            "ClientSelfRegistrationError";
    }
}

export class ClientSelfRegistrationService {
    constructor(
        private readonly clientRepository =
            new ClientRepository(),
    ) { }

    async complete(
        input: CompleteSelfRegistrationInput,
    ): Promise<Client> {
        /*
         * 1. Este Firebase UID já possui
         * uma cliente vinculada?
         *
         * Se sim, operação idempotente:
         * simplesmente retorna.
         */
        const existingByUserId =
            await this.clientRepository.findByUserId(
                input.salonId,
                input.userId,
            );

        if (existingByUserId) {
            return mapClientEntityToClient(
                existingByUserId,
            );
        }

        const normalizedEmail =
            input.email
                .trim()
                .toLowerCase();

        /*
         * 2. Verificamos novamente o e-mail.
         *
         * Isso protege contra corrida entre
         * /auth/me e completar cadastro.
         */
        const clientsByEmail =
            await this.clientRepository.findAllByEmail(
                input.salonId,
                normalizedEmail,
            );

        if (
            clientsByEmail.length > 1
        ) {
            throw new ClientSelfRegistrationError(
                "Existem cadastros duplicados com este e-mail. Entre em contato com o salão.",
                409,
            );
        }

        const existingByEmail =
            clientsByEmail[0];

        /*
         * Pode acontecer de uma cliente
         * manual ter sido cadastrada
         * enquanto esta tela estava aberta.
         *
         * Nesse caso não criamos duplicata:
         * fazemos o vínculo.
         */
        if (existingByEmail) {
            if (!existingByEmail.active) {
                throw new ClientSelfRegistrationError(
                    "Seu cadastro está inativo. Entre em contato com o salão.",
                    403,
                );
            }

            if (
                existingByEmail.userId !== null &&
                existingByEmail.userId !==
                input.userId
            ) {
                throw new ClientSelfRegistrationError(
                    "Este cadastro já está vinculado a outra conta.",
                    409,
                );
            }

            if (
                existingByEmail.userId ===
                input.userId
            ) {
                return mapClientEntityToClient(
                    existingByEmail,
                );
            }

            await this.clientRepository.linkUserId(
                input.salonId,
                existingByEmail.id,
                input.userId,
                Timestamp.now(),
            );

            const linkedClient =
                await this.clientRepository.findById(
                    input.salonId,
                    existingByEmail.id,
                );

            if (!linkedClient) {
                throw new Error(
                    "Não foi possível localizar a cliente após o vínculo.",
                );
            }

            return mapClientEntityToClient(
                linkedClient,
            );
        }

        /*
         * 3. Cliente realmente nova.
         *
         * WhatsApp é obrigatório porque
         * será importante para o fluxo
         * de agendamentos/notificações.
         */
        const normalizedPhone =
            normalizeBrazilPhone(
                input.phone,
            );

        const existingByPhone =
            await this.clientRepository.findByPhone(
                input.salonId,
                normalizedPhone,
            );

        /*
         * Não vinculamos automaticamente
         * somente pelo telefone informado.
         *
         * Isso evitaria alguém assumir
         * cadastro de outra cliente apenas
         * digitando o telefone dela.
         */
        if (existingByPhone) {
            throw new ClientSelfRegistrationError(
                "Este WhatsApp já está associado a outra cliente. Entre em contato com o salão.",
                409,
            );
        }

        const now =
            Timestamp.now();

        /*
         * Para clientes criadas pela própria
         * conta utilizamos o Firebase UID
         * como clientId.
         *
         * Clientes cadastradas manualmente
         * continuam mantendo seus IDs atuais.
         */
        const clientId =
            input.userId;

        await this.clientRepository.create(
            clientId,
            {
                salonId:
                    input.salonId,

                userId:
                    input.userId,

                name:
                    input.name.trim(),

                phone:
                    normalizedPhone,

                email:
                    normalizedEmail,

                active: true,

                createdAt: now,
                updatedAt: now,
            },
        );

        const createdClient =
            await this.clientRepository.findById(
                input.salonId,
                clientId,
            );

        if (!createdClient) {
            throw new Error(
                "Não foi possível localizar a cliente após a criação.",
            );
        }

        return mapClientEntityToClient(
            createdClient,
        );
    }
}