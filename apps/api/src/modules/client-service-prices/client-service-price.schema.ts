import { z } from "zod";

export const clientPricesClientParamsSchema =
    z.object({
        clientId: z
            .string()
            .trim()
            .min(
                1,
                "O ID da cliente é obrigatório.",
            ),
    });

export const clientServicePriceParamsSchema =
    z.object({
        clientId: z
            .string()
            .trim()
            .min(
                1,
                "O ID da cliente é obrigatório.",
            ),

        serviceId: z
            .string()
            .trim()
            .min(
                1,
                "O ID do serviço é obrigatório.",
            ),
    });

export const saveClientServicePriceSchema =
    z.object({
        priceCents: z
            .number()
            .int()
            .min(
                0,
                "O preço não pode ser negativo.",
            ),
    });

export const clientServicePriceStatusSchema =
    z.object({
        active: z.boolean(),
    });

export type ClientPricesClientParams =
    z.infer<
        typeof clientPricesClientParamsSchema
    >;

export type ClientServicePriceParams =
    z.infer<
        typeof clientServicePriceParamsSchema
    >;

export type SaveClientServicePriceInput =
    z.infer<
        typeof saveClientServicePriceSchema
    >;

export type ClientServicePriceStatusInput =
    z.infer<
        typeof clientServicePriceStatusSchema
    >;