import {
  config,
} from "dotenv";

import {
  fileURLToPath,
} from "node:url";

import {
  z,
} from "zod";

const envPath =
  fileURLToPath(
    new URL(
      "../../.env",
      import.meta.url,
    ),
  );

config({
  path: envPath,
});

/*
 * Converte corretamente:
 *
 * "true"  -> true
 * "false" -> false
 *
 * Evitamos z.coerce.boolean()
 * porque strings como "false"
 * podem causar comportamento
 * indesejado.
 */
const booleanStringSchema =
  z
    .enum([
      "true",
      "false",
    ])
    .default(
      "false",
    )
    .transform(
      (value) =>
        value ===
        "true",
    );

const envSchema =
  z
    .object({
      /*
       * ==============================
       * APLICAÇÃO
       * ==============================
       */

      NODE_ENV:
        z
          .enum([
            "development",
            "test",
            "production",
          ])
          .default(
            "development",
          ),

      PORT:
        z.coerce
          .number()
          .int()
          .positive()
          .max(
            65535,
          )
          .default(
            3333,
          ),

      HOST:
        z
          .string()
          .min(
            1,
          )
          .default(
            "0.0.0.0",
          ),

      /*
       * ==============================
       * FIREBASE ADMIN
       * ==============================
       */

      GOOGLE_APPLICATION_CREDENTIALS:
        z
          .string()
          .min(
            1,
            "GOOGLE_APPLICATION_CREDENTIALS é obrigatório.",
          ),

      FIREBASE_PROJECT_ID:
        z
          .string()
          .min(
            1,
            "FIREBASE_PROJECT_ID é obrigatório.",
          ),

      /*
       * ==============================
       * FRONTEND / CORS
       * ==============================
       */

      FRONTEND_ORIGIN:
        z
          .string()
          .min(
            1,
            "FRONTEND_ORIGIN é obrigatório.",
          ),

      /*
       * ==============================
       * SALÃO
       * ==============================
       */

      DEFAULT_SALON_ID:
        z
          .string()
          .min(
            1,
            "DEFAULT_SALON_ID é obrigatório.",
          ),

      /*
       * ==============================
       * WHATSAPP / META
       * ==============================
       *
       * Por padrão fica desligado.
       *
       * Isso permite desenvolver e
       * executar o sistema normalmente
       * antes de configurar a Meta.
       */

      WHATSAPP_ENABLED:
        booleanStringSchema,

      /*
       * Token da WhatsApp Cloud API.
       *
       * Nunca utilizar NEXT_PUBLIC_.
       * Essa credencial pertence
       * exclusivamente ao backend.
       */
      WHATSAPP_ACCESS_TOKEN:
        z
          .string()
          .trim()
          .min(
            1,
          )
          .optional(),

      /*
       * ID do número de telefone
       * fornecido pela Meta.
       */
      WHATSAPP_PHONE_NUMBER_ID:
        z
          .string()
          .trim()
          .min(
            1,
          )
          .optional(),

      /*
       * Versão da Graph API.
       *
       * Amanhã configuraremos a versão
       * utilizada pela conta Meta.
       */
      WHATSAPP_GRAPH_API_VERSION:
        z
          .string()
          .trim()
          .min(
            1,
          )
          .optional(),

      /*
       * Número que receberá os avisos
       * de novos agendamentos do salão.
       *
       * Exemplo de formato:
       *
       * 5548999999999
       *
       * sem +, espaços, parênteses
       * ou hífens.
       */
      WHATSAPP_ADMIN_PHONE:
        z
          .string()
          .trim()
          .min(
            10,
          )
          .optional(),
    })
    .superRefine(
      (
        env,
        context,
      ) => {
        /*
         * Enquanto:
         *
         * WHATSAPP_ENABLED=false
         *
         * nenhuma credencial do
         * WhatsApp é obrigatória.
         */
        if (
          !env.WHATSAPP_ENABLED
        ) {
          return;
        }

        /*
         * Quando ativarmos o WhatsApp,
         * aí sim todas as configurações
         * abaixo passam a ser
         * obrigatórias.
         */

        if (
          !env
            .WHATSAPP_ACCESS_TOKEN
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "WHATSAPP_ACCESS_TOKEN",
            ],

            message:
              "WHATSAPP_ACCESS_TOKEN é obrigatório quando WHATSAPP_ENABLED=true.",
          });
        }

        if (
          !env
            .WHATSAPP_PHONE_NUMBER_ID
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "WHATSAPP_PHONE_NUMBER_ID",
            ],

            message:
              "WHATSAPP_PHONE_NUMBER_ID é obrigatório quando WHATSAPP_ENABLED=true.",
          });
        }

        if (
          !env
            .WHATSAPP_GRAPH_API_VERSION
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "WHATSAPP_GRAPH_API_VERSION",
            ],

            message:
              "WHATSAPP_GRAPH_API_VERSION é obrigatório quando WHATSAPP_ENABLED=true.",
          });
        }

        if (
          !env
            .WHATSAPP_ADMIN_PHONE
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "WHATSAPP_ADMIN_PHONE",
            ],

            message:
              "WHATSAPP_ADMIN_PHONE é obrigatório quando WHATSAPP_ENABLED=true.",
          });
        }
      },
    );

const parsedEnv =
  envSchema.safeParse(
    process.env,
  );

if (
  !parsedEnv.success
) {
  console.error(
    "Variáveis de ambiente inválidas:",
    parsedEnv.error
      .issues,
  );

  process.exit(
    1,
  );
}

export const env =
  parsedEnv.data;

export type Env =
  typeof env;