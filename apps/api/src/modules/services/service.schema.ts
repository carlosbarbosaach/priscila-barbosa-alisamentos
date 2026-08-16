import { z } from "zod";

export const createServiceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "O nome do serviço é obrigatório.")
        .max(100, "O nome do serviço é muito longo."),

    defaultPriceCents: z
        .number()
        .int()
        .min(0, "O preço não pode ser negativo."),
});

export const updateServiceSchema =
    createServiceSchema.partial();

export const serviceParamsSchema = z.object({
    serviceId: z
        .string()
        .trim()
        .min(1, "O ID do serviço é obrigatório."),
});

export const serviceStatusSchema = z.object({
    active: z.boolean(),
});

export type CreateServiceInput = z.infer<
    typeof createServiceSchema
>;

export type UpdateServiceInput = z.infer<
    typeof updateServiceSchema
>;

export type ServiceParams = z.infer<
    typeof serviceParamsSchema
>;

export type ServiceStatusInput = z.infer<
    typeof serviceStatusSchema
>;