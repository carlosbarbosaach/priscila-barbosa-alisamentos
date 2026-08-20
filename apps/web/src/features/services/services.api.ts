import type {
    Service,
    ServicePriceType,
} from "@priscila/shared";

import {
    apiFetch,
} from "@/services/api/api-client";

type ListServicesResponse = {
    services:
        Service[];
};

type ServiceResponse = {
    service:
        Service;
};

export type CreateServiceInput = {
    name:
        string;

    defaultPriceCents:
        number;

    priceType:
        ServicePriceType;
};

export type UpdateServiceInput = {
    name?:
        string;

    defaultPriceCents?:
        number;

    priceType?:
        ServicePriceType;
};

/*
 * =================================
 * PROMOÇÃO
 * =================================
 *
 * ATIVAR / ALTERAR:
 *
 * {
 *   active: true,
 *   promotionPriceCents: 25000,
 *   promotionLabel: "Promoção de setembro",
 *   promotionStartsOn: "2026-09-01",
 *   promotionEndsOn: "2026-09-30"
 * }
 *
 * ENCERRAR ANTECIPADAMENTE:
 *
 * {
 *   active: false
 * }
 *
 * Ao encerrar, o backend mantém:
 *
 * - promotionPriceCents;
 * - promotionLabel;
 * - promotionStartsOn;
 * - promotionEndsOn.
 */
export type UpdateServicePromotionInput =
    | {
          active:
              true;

          promotionPriceCents:
              number;

          promotionLabel?:
              string | null;

          promotionStartsOn:
              string;

          promotionEndsOn:
              string;
      }
    | {
          active:
              false;
      };

export async function getServices(): Promise<
    Service[]
> {
    const response =
        await apiFetch<ListServicesResponse>(
            "/admin/services/",
        );

    return response.services;
}

export async function createService(
    input:
        CreateServiceInput,
): Promise<Service> {
    const response =
        await apiFetch<ServiceResponse>(
            "/admin/services/",
            {
                method:
                    "POST",

                body:
                    JSON.stringify(
                        input,
                    ),
            },
        );

    return response.service;
}

export async function updateService(
    serviceId:
        string,

    input:
        UpdateServiceInput,
): Promise<Service> {
    const response =
        await apiFetch<ServiceResponse>(
            `/admin/services/${serviceId}`,
            {
                method:
                    "PATCH",

                body:
                    JSON.stringify(
                        input,
                    ),
            },
        );

    return response.service;
}

export async function updateServiceStatus(
    serviceId:
        string,

    active:
        boolean,
): Promise<Service> {
    const response =
        await apiFetch<ServiceResponse>(
            `/admin/services/${serviceId}/status`,
            {
                method:
                    "PATCH",

                body:
                    JSON.stringify({
                        active,
                    }),
            },
        );

    return response.service;
}

/*
 * =================================
 * ATIVAR / ALTERAR / ENCERRAR PROMOÇÃO
 * =================================
 */
export async function updateServicePromotion(
    serviceId:
        string,

    input:
        UpdateServicePromotionInput,
): Promise<Service> {
    const response =
        await apiFetch<ServiceResponse>(
            `/admin/services/${serviceId}/promotion`,
            {
                method:
                    "PATCH",

                body:
                    JSON.stringify(
                        input,
                    ),
            },
        );

    return response.service;
}