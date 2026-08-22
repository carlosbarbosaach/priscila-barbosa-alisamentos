import {
  whatsappConfig,
} from "./whatsapp.config.js";

import type {
  WhatsAppGateway,
} from "./whatsapp.gateway.js";

import type {
  WhatsAppGatewaySendResult,
  WhatsAppTemplateMessage,
} from "./whatsapp.types.js";

/*
 * =================================
 * RESPOSTAS INTERNAS DA META
 * =================================
 *
 * Estes tipos ficam somente neste
 * arquivo.
 *
 * O restante do sistema não precisa
 * conhecer o formato da Meta.
 */
type MetaWhatsAppSuccessResponse = {
  messages?: {
    id?: string;
  }[];
};

type MetaWhatsAppErrorResponse = {
  error?: {
    message?: string;

    type?: string;

    code?: number;

    error_subcode?: number;

    fbtrace_id?: string;
  };
};

/*
 * =================================
 * ERROS DO GATEWAY
 * =================================
 */

export class WhatsAppDisabledError extends Error {
  constructor() {
    super(
      "Integração com WhatsApp está desativada.",
    );

    this.name =
      "WhatsAppDisabledError";
  }
}

export class WhatsAppConfigurationError extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "WhatsAppConfigurationError";
  }
}

export class WhatsAppProviderError extends Error {
  constructor(
    message:
      string,

    public readonly statusCode:
      number,

    public readonly providerCode?:
      number,
  ) {
    super(
      message,
    );

    this.name =
      "WhatsAppProviderError";
  }
}

/*
 * =================================
 * HELPERS
 * =================================
 */

function normalizePhoneNumber(
  phone:
    string,
) {
  return phone.replace(
    /\D/g,
    "",
  );
}

function isMetaSuccessResponse(
  value:
    unknown,
): value is MetaWhatsAppSuccessResponse {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  return true;
}

function isMetaErrorResponse(
  value:
    unknown,
): value is MetaWhatsAppErrorResponse {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  return (
    "error" in
    value
  );
}

/*
 * =================================
 * META WHATSAPP GATEWAY
 * =================================
 *
 * Este é o único arquivo responsável
 * por conversar diretamente com:
 *
 * graph.facebook.com
 *
 * Nenhuma regra de agendamento deve
 * existir aqui.
 */
export class MetaWhatsAppGateway
implements WhatsAppGateway {
  async sendTemplate(
    message:
      WhatsAppTemplateMessage,
  ): Promise<WhatsAppGatewaySendResult> {
    /*
     * Dupla proteção.
     *
     * Futuramente o NotificationService
     * também poderá verificar enabled
     * antes de solicitar um envio.
     *
     * Mesmo assim o gateway nunca deve
     * enviar nada se estiver desligado.
     */
    if (
      !whatsappConfig.enabled
    ) {
      throw new WhatsAppDisabledError();
    }

    const {
      accessToken,
      phoneNumberId,
      graphApiVersion,
    } =
      whatsappConfig;

    /*
     * env.ts já protege isso quando
     * WHATSAPP_ENABLED=true.
     *
     * Mantemos também a validação
     * dentro do gateway por segurança.
     */
    if (
      !accessToken
    ) {
      throw new WhatsAppConfigurationError(
        "Token de acesso do WhatsApp não configurado.",
      );
    }

    if (
      !phoneNumberId
    ) {
      throw new WhatsAppConfigurationError(
        "Phone Number ID do WhatsApp não configurado.",
      );
    }

    if (
      !graphApiVersion
    ) {
      throw new WhatsAppConfigurationError(
        "Versão da Graph API não configurada.",
      );
    }

    const recipientPhone =
      normalizePhoneNumber(
        message.to,
      );

    if (
      recipientPhone.length <
      10
    ) {
      throw new WhatsAppConfigurationError(
        "Número de WhatsApp do destinatário inválido.",
      );
    }

    const templateName =
      message.templateName
        .trim();

    if (
      templateName.length ===
      0
    ) {
      throw new WhatsAppConfigurationError(
        "Nome do template do WhatsApp não informado.",
      );
    }

    const languageCode =
      message.languageCode
        .trim();

    if (
      languageCode.length ===
      0
    ) {
      throw new WhatsAppConfigurationError(
        "Idioma do template do WhatsApp não informado.",
      );
    }

    /*
     * =================================
     * COMPONENTES DO TEMPLATE
     * =================================
     *
     * Só enviamos components quando
     * existirem parâmetros no body.
     *
     * Templates sem variáveis também
     * continuam funcionando.
     */
    const bodyParameters =
      message.bodyParameters ??
      [];

    const components =
      bodyParameters.length >
      0
        ? [
            {
              type:
                "body",

              parameters:
                bodyParameters.map(
                  (
                    parameter,
                  ) => ({
                    type:
                      "text",

                    text:
                      parameter,
                  }),
                ),
            },
          ]
        : undefined;

    const requestBody = {
      messaging_product:
        "whatsapp",

      recipient_type:
        "individual",

      to:
        recipientPhone,

      type:
        "template",

      template: {
        name:
          templateName,

        language: {
          code:
            languageCode,
        },

        ...(components
          ? {
              components,
            }
          : {}),
      },
    };

    const endpoint =
      `https://graph.facebook.com/${encodeURIComponent(
        graphApiVersion,
      )}/${encodeURIComponent(
        phoneNumberId,
      )}/messages`;

    let response:
      Response;

    try {
      response =
        await fetch(
          endpoint,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody,
              ),
          },
        );
    } catch {
      /*
       * Não incluímos token, URL
       * completa ou outros segredos
       * na mensagem de erro.
       */
      throw new WhatsAppProviderError(
        "Não foi possível conectar à API do WhatsApp.",
        0,
      );
    }

    let responseBody:
      unknown = null;

    try {
      responseBody =
        await response.json();
    } catch {
      responseBody =
        null;
    }

    /*
     * =================================
     * ERRO DA META
     * =================================
     */
    if (
      !response.ok
    ) {
      const providerError =
        isMetaErrorResponse(
          responseBody,
        )
          ? responseBody.error
          : undefined;

      throw new WhatsAppProviderError(
        providerError
          ?.message ??
          "A API do WhatsApp recusou o envio da mensagem.",

        response.status,

        providerError
          ?.code,
      );
    }

    /*
     * =================================
     * SUCESSO
     * =================================
     *
     * A Meta retorna um wamid.
     *
     * Ele será importante mais tarde
     * para relacionar:
     *
     * sent
     * delivered
     * read
     * failed
     *
     * recebidos via webhook.
     */
    if (
      !isMetaSuccessResponse(
        responseBody,
      )
    ) {
      throw new WhatsAppProviderError(
        "A API do WhatsApp retornou uma resposta inválida.",
        response.status,
      );
    }

    const providerMessageId =
      responseBody
        .messages
        ?.[0]
        ?.id;

    if (
      !providerMessageId
    ) {
      throw new WhatsAppProviderError(
        "A API do WhatsApp não retornou o identificador da mensagem.",
        response.status,
      );
    }

    return {
      providerMessageId,
    };
  }
}