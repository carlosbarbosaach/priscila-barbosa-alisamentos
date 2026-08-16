import type { Service } from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

type ListServicesResponse = {
    services: Service[];
};

export async function getServices(): Promise<Service[]> {
    const response = await apiFetch<ListServicesResponse>(
        "/admin/services/",
    );

    return response.services;
}