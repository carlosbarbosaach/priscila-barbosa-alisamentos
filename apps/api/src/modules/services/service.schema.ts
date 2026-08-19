import {
    z,
} from "zod";

export const servicePriceTypeSchema =
    z.enum([
        "FIXED",
        "STARTING_FROM",
    ]);

const serviceNameSchema =
    z
        .string()
        .trim()
        .min(
            2,
            "O nome do serviço é obrigatório.",
        )
        .max(
            100,
            "O nome do serviço é muito longo.",
        );

const serviceDefaultPriceCentsSchema =
    z
        .number()
        .int()
        .min(
            0,
            "O preço não pode ser negativo.",
        );

export const createServiceSchema =
    z.object({
        name:
            serviceNameSchema,

        defaultPriceCents:
            serviceDefaultPriceCentsSchema,

        /*
         * Compatibilidade com o frontend
         * atual.
         *
         * Enquanto a tela ainda não enviar
         * priceType, novos serviços serão
         * criados como FIXED.
         */
        priceType:
            servicePriceTypeSchema
                .optional()
                .default(
                    "FIXED",
                ),
    });

export const updateServiceSchema =
    z.object({
        name:
            serviceNameSchema
                .optional(),

        defaultPriceCents:
            serviceDefaultPriceCentsSchema
                .optional(),

        /*
         * IMPORTANTE:
         *
         * Sem default no update.
         *
         * Dessa forma editar somente
         * nome/preço não altera
         * acidentalmente o tipo
         * já cadastrado.
         */
        priceType:
            servicePriceTypeSchema
                .optional(),
    });

export const serviceParamsSchema =
    z.object({
        serviceId:
            z
                .string()
                .trim()
                .min(
                    1,
                    "O ID do serviço é obrigatório.",
                ),
    });

export const serviceStatusSchema =
    z.object({
        active:
            z.boolean(),
    });

export type CreateServiceInput =
    z.infer<
        typeof createServiceSchema
    >;

export type UpdateServiceInput =
    z.infer<
        typeof updateServiceSchema
    >;

export type ServiceParams =
    z.infer<
        typeof serviceParamsSchema
    >;

export type ServiceStatusInput =
    z.infer<
        typeof serviceStatusSchema
    >;