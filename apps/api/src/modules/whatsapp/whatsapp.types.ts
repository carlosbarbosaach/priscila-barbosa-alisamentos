/*
 * =================================
 * WHATSAPP — TIPOS
 * =================================
 *
 * Este arquivo contém somente
 * contratos de dados do módulo.
 *
 * Não contém:
 *
 * - acesso à Meta
 * - fetch
 * - variáveis de ambiente
 * - regras de agendamento
 */

/*
 * Número no formato internacional.
 *
 * Exemplo:
 *
 * 5548999999999
 *
 * Sem:
 *
 * +
 * espaços
 * parênteses
 * hífens
 */
export type WhatsAppPhoneNumber =
  string;

/*
 * =================================
 * TEMPLATE
 * =================================
 *
 * Representa uma mensagem baseada
 * em template aprovado no WhatsApp
 * Business.
 *
 * Mantemos este tipo independente
 * da implementação da Meta.
 */
export type WhatsAppTemplateMessage = {
  to:
    WhatsAppPhoneNumber;

  templateName:
    string;

  languageCode:
    string;

  /*
   * Parâmetros inseridos no corpo
   * do template.
   *
   * Exemplo:
   *
   * [
   *   "Priscila",
   *   "Botox Capilar",
   *   "25/08/2026",
   *   "13:00",
   * ]
   */
  bodyParameters?:
    string[];
};

/*
 * =================================
 * RESULTADO DO ENVIO
 * =================================
 *
 * O restante do sistema não precisa
 * conhecer a resposta inteira da
 * Meta.
 *
 * Guardamos somente o necessário
 * para identificar a mensagem.
 */
export type WhatsAppSendResult = {
  providerMessageId:
    string;
};

/*
 * =================================
 * GATEWAY
 * =================================
 *
 * Resultado padronizado do envio.
 *
 * Isso evita espalhar formatos
 * específicos da Meta pelo sistema.
 */
export type WhatsAppGatewaySendResult =
  WhatsAppSendResult;