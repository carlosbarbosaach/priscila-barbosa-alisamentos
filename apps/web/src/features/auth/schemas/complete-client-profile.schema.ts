import {
    z,
} from "zod";

export const completeClientProfileSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                3,
                "Informe seu nome completo.",
            )
            .max(
                100,
                "O nome é muito longo.",
            ),

        phone: z
            .string()
            .trim()
            .refine(
                (value) => {
                    const digits =
                        value.replace(
                            /\D/g,
                            "",
                        );

                    return (
                        digits.length ===
                        10 ||
                        digits.length ===
                        11
                    );
                },
                {
                    message:
                        "Informe um WhatsApp válido com DDD.",
                },
            ),
    });

export type CompleteClientProfileInput =
    z.infer<
        typeof completeClientProfileSchema
    >;