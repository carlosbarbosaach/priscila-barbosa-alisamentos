import { z } from "zod";

export const completeClientProfileSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                3,
                "Informe o nome completo.",
            )
            .max(
                100,
                "O nome é muito longo.",
            ),

        phone: z
            .string()
            .trim()
            .min(
                10,
                "Informe um WhatsApp válido.",
            )
            .max(
                20,
                "Informe um WhatsApp válido.",
            ),
    });

export type CompleteClientProfileInput =
    z.infer<
        typeof completeClientProfileSchema
    >;