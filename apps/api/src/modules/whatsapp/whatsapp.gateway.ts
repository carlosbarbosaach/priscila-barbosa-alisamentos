import type {
  WhatsAppGatewaySendResult,
  WhatsAppTemplateMessage,
} from "./whatsapp.types.js";

/*
 * =================================
 * WHATSAPP GATEWAY
 * =================================
 *
 * Contrato utilizado pelo restante
 * do sistema para enviar mensagens.
 *
 * A aplicação não precisa saber
 * qual provedor está sendo usado.
 *
 * Hoje:
 *
 * Meta WhatsApp Cloud API
 *
 * Futuramente poderíamos trocar por
 * outro provedor sem alterar as
 * regras de agendamento.
 */
export interface WhatsAppGateway {
  sendTemplate(
    message:
      WhatsAppTemplateMessage,
  ):
    Promise<WhatsAppGatewaySendResult>;
}