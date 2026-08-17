import type { Client } from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

type ListClientsResponse = {
    clients: Client[];
};

type ClientResponse = {
    client: Client;
};

export type CreateClientInput = {
    name: string;
    phone: string;
    email?: string | null;
};

export type UpdateClientInput = {
    name?: string;
    phone?: string;
    email?: string | null;
};

export async function getClients(): Promise<Client[]> {
    const response =
        await apiFetch<ListClientsResponse>(
            "/admin/clients/",
        );

    return response.clients;
}

export async function createClient(
    input: CreateClientInput,
): Promise<Client> {
    const response =
        await apiFetch<ClientResponse>(
            "/admin/clients/",
            {
                method: "POST",
                body: JSON.stringify(input),
            },
        );

    return response.client;
}

export async function updateClient(
    clientId: string,
    input: UpdateClientInput,
): Promise<Client> {
    const response =
        await apiFetch<ClientResponse>(
            `/admin/clients/${clientId}`,
            {
                method: "PATCH",
                body: JSON.stringify(input),
            },
        );

    return response.client;
}

export async function updateClientStatus(
    clientId: string,
    active: boolean,
): Promise<Client> {
    const response =
        await apiFetch<ClientResponse>(
            `/admin/clients/${clientId}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    active,
                }),
            },
        );

    return response.client;
}