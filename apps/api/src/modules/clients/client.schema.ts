import { z } from "zod";

export const createClientSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "O nome da cliente é obrigatório.")
        .max(120, "O nome da cliente é muito longo."),

    phone: z
        .string()
        .trim()
        .min(10, "Informe um telefone válido.")
        .max(25, "Informe um telefone válido."),

    email: z
        .string()
        .trim()
        .email("Informe um e-mail válido.")
        .max(254, "O e-mail é muito longo.")
        .nullable()
        .optional(),
});

export const updateClientSchema =
    createClientSchema.partial();

export const clientParamsSchema = z.object({
    clientId: z
        .string()
        .trim()
        .min(1, "O ID da cliente é obrigatório."),
});

export const clientStatusSchema = z.object({
    active: z.boolean(),
});

export type CreateClientInput = z.infer<
    typeof createClientSchema
>;

export type UpdateClientInput = z.infer<
    typeof updateClientSchema
>;

export type ClientParams = z.infer<
    typeof clientParamsSchema
>;

export type ClientStatusInput = z.infer<
    typeof clientStatusSchema
>;