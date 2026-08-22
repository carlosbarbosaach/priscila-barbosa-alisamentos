import {
  MetaWhatsAppGateway,
} from "./meta-whatsapp.gateway.js";

import {
  WhatsAppNotificationService,
} from "./whatsapp-notification.service.js";

/*
 * =================================
 * WHATSAPP FACTORY
 * =================================
 *
 * Centraliza a criação das
 * dependências do módulo.
 *
 * Nenhum outro módulo precisa
 * conhecer diretamente:
 *
 * MetaWhatsAppGateway
 *
 * Se futuramente trocarmos o
 * provedor, a alteração fica
 * concentrada aqui.
 */

export function createWhatsAppNotificationService() {
  const gateway =
    new MetaWhatsAppGateway();

  return new WhatsAppNotificationService(
    gateway,
  );
}

/*
 * Instância compartilhada pela API.
 *
 * Evitamos criar novos gateways
 * desnecessariamente em cada
 * requisição.
 */
export const whatsappNotificationService =
  createWhatsAppNotificationService();