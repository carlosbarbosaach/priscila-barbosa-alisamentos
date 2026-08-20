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

/*
 * =================================
 * DATA YYYY-MM-DD
 * =================================
 *
 * Além do formato, validamos se a
 * data realmente existe.
 *
 * Exemplos válidos:
 *
 * 2026-09-01
 * 2028-02-29
 *
 * Exemplos inválidos:
 *
 * 01/09/2026
 * 2026-02-30
 * 2026-13-01
 */
const DATE_ONLY_REGEX =
  /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(
  value:
    string,
): boolean {
  if (
    !DATE_ONLY_REGEX.test(
      value,
    )
  ) {
    return false;
  }

  const [
    yearText,
    monthText,
    dayText,
  ] =
    value.split("-");

  const year =
    Number(
      yearText,
    );

  const month =
    Number(
      monthText,
    );

  const day =
    Number(
      dayText,
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
}

const promotionDateSchema =
  z
    .string()
    .trim()
    .refine(
      isValidDateOnly,
      {
        message:
          "Informe uma data válida no formato YYYY-MM-DD.",
      },
    )
    .nullable()
    .optional();

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
 *   "promotionLabel": "Promoção de setembro",
 *   "promotionStartsOn": "2026-09-01",
 *   "promotionEndsOn": "2026-09-30"
 * }
 *
 * ENCERRAR ANTECIPADAMENTE:
 *
 * {
 *   "active": false
 * }
 *
 * Ao desativar, os dados configurados
 * da promoção NÃO devem ser apagados.
 *
 * Essa preservação será tratada no
 * ServiceService.
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
            1,
            "O preço promocional deve ser maior que zero.",
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

      promotionStartsOn:
        promotionDateSchema,

      promotionEndsOn:
        promotionDateSchema,
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        /*
         * =================================
         * PROMOÇÃO ATIVA
         * =================================
         *
         * Para ativar precisamos de:
         *
         * - preço promocional;
         * - data inicial;
         * - data final.
         */
        if (
          value.active
        ) {
          if (
            value.promotionPriceCents ===
              undefined ||
            value.promotionPriceCents ===
              null
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

          if (
            value.promotionStartsOn ===
              undefined ||
            value.promotionStartsOn ===
              null
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "promotionStartsOn",
              ],

              message:
                "Informe a data inicial da promoção.",
            });
          }

          if (
            value.promotionEndsOn ===
              undefined ||
            value.promotionEndsOn ===
              null
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "promotionEndsOn",
              ],

              message:
                "Informe a data final da promoção.",
            });
          }
        }

        /*
         * =================================
         * ORDEM DAS DATAS
         * =================================
         *
         * Como o formato é YYYY-MM-DD,
         * datas válidas podem ser
         * comparadas diretamente.
         *
         * Permitimos:
         *
         * início === fim
         *
         * Exemplo:
         *
         * promoção válida somente
         * durante 2026-09-15.
         */
        if (
          typeof value
            .promotionStartsOn ===
            "string" &&
          typeof value
            .promotionEndsOn ===
            "string" &&
          isValidDateOnly(
            value
              .promotionStartsOn,
          ) &&
          isValidDateOnly(
            value
              .promotionEndsOn,
          ) &&
          value
            .promotionStartsOn >
            value
              .promotionEndsOn
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "promotionEndsOn",
            ],

            message:
              "A data final da promoção deve ser igual ou posterior à data inicial.",
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