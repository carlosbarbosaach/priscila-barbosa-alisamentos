import type { Service } from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

type ListServicesResponse = {
  services: Service[];
};

type ServiceResponse = {
  service: Service;
};

export type CreateServiceInput = {
  name: string;
  defaultPriceCents: number;
};

export type UpdateServiceInput = {
  name?: string;
  defaultPriceCents?: number;
};

export async function getServices(): Promise<Service[]> {
  const response = await apiFetch<ListServicesResponse>(
    "/admin/services/",
  );

  return response.services;
}

export async function createService(
  input: CreateServiceInput,
): Promise<Service> {
  const response = await apiFetch<ServiceResponse>(
    "/admin/services/",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.service;
}

export async function updateService(
  serviceId: string,
  input: UpdateServiceInput,
): Promise<Service> {
  const response = await apiFetch<ServiceResponse>(
    `/admin/services/${serviceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.service;
}

export async function updateServiceStatus(
  serviceId: string,
  active: boolean,
): Promise<Service> {
  const response = await apiFetch<ServiceResponse>(
    `/admin/services/${serviceId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        active,
      }),
    },
  );

  return response.service;
}