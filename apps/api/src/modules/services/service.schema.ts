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

    priceType:
      servicePriceTypeSchema
        .optional(),
  });

/*
 * =================================
 * PROMOÇÃO
 * =================================
 *
 * ATIVAR:
 *
 * {
 *   "active": true,
 *   "promotionPriceCents": 25000,
 *   "promotionLabel": "Promoção"
 * }
 *
 * DESATIVAR:
 *
 * {
 *   "active": false
 * }
 */
export const servicePromotionSchema =
  z
    .object({
      active:
        z.boolean(),

      promotionPriceCents:
        z
          .number()
          .int()
          .min(
            0,
            "O preço promocional não pode ser negativo.",
          )
          .nullable()
          .optional(),

      promotionLabel:
        z
          .string()
          .trim()
          .min(
            2,
            "O nome da promoção é muito curto.",
          )
          .max(
            40,
            "O nome da promoção deve possuir no máximo 40 caracteres.",
          )
          .nullable()
          .optional(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        /*
         * Para ativar uma promoção,
         * obrigatoriamente precisamos
         * receber um preço.
         *
         * A comparação com o preço
         * normal será feita no Service,
         * porque somente ele conhece
         * o serviço atual.
         */
        if (
          value.active &&
          (
            value.promotionPriceCents ===
              undefined ||
            value.promotionPriceCents ===
              null
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "promotionPriceCents",
            ],

            message:
              "Informe o preço promocional.",
          });
        }
      },
    );

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

export type ServicePromotionInput =
  z.infer<
    typeof servicePromotionSchema
  >;

export type ServiceParams =
  z.infer<
    typeof serviceParamsSchema
  >;

export type ServiceStatusInput =
  z.infer<
    typeof serviceStatusSchema
  >;