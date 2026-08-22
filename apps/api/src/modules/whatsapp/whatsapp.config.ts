import {
  env,
} from "../../config/env.js";

export type WhatsAppConfig = {
  enabled:
    boolean;

  accessToken:
    string | null;

  phoneNumberId:
    string | null;

  graphApiVersion:
    string | null;

  adminPhone:
    string | null;
};

/*
 * =================================
 * CONFIGURAÇÃO DO WHATSAPP
 * =================================
 *
 * Este é o único ponto do módulo
 * WhatsApp que conhece as variáveis
 * de ambiente.
 *
 * Os demais arquivos não devem usar
 * process.env diretamente.
 */
export const whatsappConfig:
  WhatsAppConfig = {
    enabled:
      env.WHATSAPP_ENABLED,

    accessToken:
      env.WHATSAPP_ACCESS_TOKEN ??
      null,

    phoneNumberId:
      env.WHATSAPP_PHONE_NUMBER_ID ??
      null,

    graphApiVersion:
      env.WHATSAPP_GRAPH_API_VERSION ??
      null,

    adminPhone:
      env.WHATSAPP_ADMIN_PHONE ??
      null,
  };