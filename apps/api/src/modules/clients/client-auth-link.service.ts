import type { Client } from "@priscila/shared";

import { Timestamp } from "firebase-admin/firestore";

import { mapClientEntityToClient } from "./client.mapper.js";
import { ClientRepository } from "./client.repository.js";

export const CLIENT_AUTH_LINK_STATUS = {
    ALREADY_LINKED: "ALREADY_LINKED",
    LINKED: "LINKED",

    NO_EMAIL: "NO_EMAIL",
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",

    NO_MATCH: "NO_MATCH",
    AMBIGUOUS_EMAIL: "AMBIGUOUS_EMAIL",

    CLIENT_INACTIVE: "CLIENT_INACTIVE",
    CLIENT_ALREADY_LINKED: "CLIENT_ALREADY_LINKED",
} as const;

export type ClientAuthLinkStatus =
    (typeof CLIENT_AUTH_LINK_STATUS)[keyof typeof CLIENT_AUTH_LINK_STATUS];

export type ClientAuthLinkResult = {
    status: ClientAuthLinkStatus;
    client: Client | null;
};

type EnsureClientAuthLinkInput = {
    salonId: string;

    userId: string;

    email: string | undefined;

    emailVerified: boolean;
};

export class ClientAuthLinkService {
    constructor(
        private readonly clientRepository =
            new ClientRepository(),
    ) { }

    async ensureLink(
        input: EnsureClientAuthLinkInput,
    ): Promise<ClientAuthLinkResult> {
        /*
         * 1. Primeiro verificamos se este UID
         * já está ligado a alguma cliente.
         *
         * Este é o caminho normal depois
         * do primeiro vínculo.
         */
        const clientAlreadyLinked =
            await this.clientRepository.findByUserId(
                input.salonId,
                input.userId,
            );

        if (clientAlreadyLinked) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.ALREADY_LINKED,

                client:
                    mapClientEntityToClient(
                        clientAlreadyLinked,
                    ),
            };
        }

        /*
         * 2. Sem e-mail não fazemos
         * vínculo automático.
         */
        if (!input.email) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.NO_EMAIL,

                client: null,
            };
        }

        /*
         * 3. O vínculo automático por e-mail
         * exige e-mail verificado pelo
         * provedor/Firebase Auth.
         */
        if (!input.emailVerified) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.EMAIL_NOT_VERIFIED,

                client: null,
            };
        }

        const normalizedEmail =
            input.email
                .trim()
                .toLowerCase();

        /*
         * 4. Procuramos cadastros manuais
         * daquele salão com o mesmo e-mail.
         */
        const clientsByEmail =
            await this.clientRepository.findAllByEmail(
                input.salonId,
                normalizedEmail,
            );

        /*
         * Nenhum cadastro administrativo
         * existente com aquele e-mail.
         */
        if (clientsByEmail.length === 0) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.NO_MATCH,

                client: null,
            };
        }

        /*
         * Mais de um resultado é ambíguo.
         *
         * Não escolhemos uma cliente
         * aleatoriamente.
         */
        if (clientsByEmail.length > 1) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.AMBIGUOUS_EMAIL,

                client: null,
            };
        }

        const client =
            clientsByEmail[0];

        if (!client) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.NO_MATCH,

                client: null,
            };
        }

        /*
         * Cliente administrativa inativa
         * não é vinculada automaticamente.
         */
        if (!client.active) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.CLIENT_INACTIVE,

                client:
                    mapClientEntityToClient(
                        client,
                    ),
            };
        }

        /*
         * Segurança:
         *
         * se esta cliente já tiver userId,
         * nunca substituímos por outro UID.
         */
        if (
            client.userId !== null &&
            client.userId !== input.userId
        ) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.CLIENT_ALREADY_LINKED,

                client:
                    mapClientEntityToClient(
                        client,
                    ),
            };
        }

        /*
         * Pode acontecer de o registro já
         * conter exatamente o mesmo UID.
         */
        if (
            client.userId ===
            input.userId
        ) {
            return {
                status:
                    CLIENT_AUTH_LINK_STATUS.ALREADY_LINKED,

                client:
                    mapClientEntityToClient(
                        client,
                    ),
            };
        }

        /*
         * 5. Vínculo seguro:
         *
         * cadastro manual
         *        +
         * conta Firebase autenticada
         *        ↓
         * clients.userId = Firebase UID
         */
        await this.clientRepository.linkUserId(
            input.salonId,
            client.id,
            input.userId,
            Timestamp.now(),
        );

        const linkedClient =
            await this.clientRepository.findById(
                input.salonId,
                client.id,
            );

        if (!linkedClient) {
            throw new Error(
                "Não foi possível localizar a cliente após o vínculo da conta.",
            );
        }

        return {
            status:
                CLIENT_AUTH_LINK_STATUS.LINKED,

            client:
                mapClientEntityToClient(
                    linkedClient,
                ),
        };
    }
}