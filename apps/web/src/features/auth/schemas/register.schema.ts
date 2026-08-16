import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo.")
      .max(100, "O nome é muito longo."),

    email: z.email("Informe um e-mail válido."),

    password: z
      .string()
      .min(8, "A senha deve possuir pelo menos 8 caracteres.")
      .max(128, "A senha é muito longa."),

    confirmPassword: z
      .string()
      .min(1, "Confirme sua senha."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "As senhas não coincidem.",
      path: ["confirmPassword"],
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;