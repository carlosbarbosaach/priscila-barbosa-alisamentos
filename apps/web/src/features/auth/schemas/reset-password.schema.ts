import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;