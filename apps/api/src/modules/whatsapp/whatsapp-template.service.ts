import type {
  WhatsAppTemplateMessage,
} from "./whatsapp.types.js";

/*
 * =================================
 * NOMES DOS TEMPLATES
 * =================================
 *
 * Estes nomes deverão ser iguais
 * aos templates cadastrados e
 * aprovados posteriormente na Meta.
 *
 * Centralizamos aqui para evitar
 * strings espalhadas pelo sistema.
 */
const WHATSAPP_TEMPLATE = {
  APPOINTMENT_REQUESTED:
    "agendamento_solicitado_salao",

  APPOINTMENT_CONFIRMED:
    "agendamento_confirmado_cliente",

  APPOINTMENT_REJECTED:
    "agendamento_recusado_cliente",

  APPOINTMENT_CANCELLED_BY_CLIENT:
    "agendamento_cancelado_cliente",

  APPOINTMENT_CANCELLED_BY_ADMIN:
    "agendamento_cancelado_salao",
} as const;

const DEFAULT_LANGUAGE_CODE =
  "pt_BR";

/*
 * =================================
 * INPUTS
 * =================================
 *
 * O serviço recebe os dados já
 * resolvidos.
 *
 * Ele NÃO busca:
 *
 * - cliente
 * - agendamento
 * - salão
 * - Firestore
 *
 * Isso mantém o arquivo pequeno
 * e fácil de testar.
 */

export type AppointmentRequestedTemplateInput = {
  adminPhone:
    string;

  clientName:
    string;

  serviceName:
    string;

  date:
    string;

  time:
    string;
};

export type AppointmentConfirmedTemplateInput = {
  clientPhone:
    string;

  clientName:
    string;

  serviceName:
    string;

  date:
    string;

  time:
    string;
};

export type AppointmentRejectedTemplateInput = {
  clientPhone:
    string;

  clientName:
    string;

  serviceName:
    string;

  date:
    string;

  time:
    string;

  reason:
    string;
};

export type AppointmentCancelledByClientTemplateInput = {
  adminPhone:
    string;

  clientName:
    string;

  serviceName:
    string;

  date:
    string;

  time:
    string;
};

export type AppointmentCancelledByAdminTemplateInput = {
  clientPhone:
    string;

  clientName:
    string;

  serviceName:
    string;

  date:
    string;

  time:
    string;

  reason:
    string;
};

/*
 * =================================
 * TEMPLATE SERVICE
 * =================================
 *
 * Única responsabilidade:
 *
 * transformar dados do sistema
 * em WhatsAppTemplateMessage.
 *
 * Nenhum envio acontece aqui.
 */
export class WhatsAppTemplateService {
  appointmentRequested(
    input:
      AppointmentRequestedTemplateInput,
  ): WhatsAppTemplateMessage {
    return {
      to:
        input.adminPhone,

      templateName:
        WHATSAPP_TEMPLATE
          .APPOINTMENT_REQUESTED,

      languageCode:
        DEFAULT_LANGUAGE_CODE,

      bodyParameters: [
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
      ],
    };
  }

  appointmentConfirmed(
    input:
      AppointmentConfirmedTemplateInput,
  ): WhatsAppTemplateMessage {
    return {
      to:
        input.clientPhone,

      templateName:
        WHATSAPP_TEMPLATE
          .APPOINTMENT_CONFIRMED,

      languageCode:
        DEFAULT_LANGUAGE_CODE,

      bodyParameters: [
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
      ],
    };
  }

  appointmentRejected(
    input:
      AppointmentRejectedTemplateInput,
  ): WhatsAppTemplateMessage {
    return {
      to:
        input.clientPhone,

      templateName:
        WHATSAPP_TEMPLATE
          .APPOINTMENT_REJECTED,

      languageCode:
        DEFAULT_LANGUAGE_CODE,

      bodyParameters: [
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
        input.reason,
      ],
    };
  }

  appointmentCancelledByClient(
    input:
      AppointmentCancelledByClientTemplateInput,
  ): WhatsAppTemplateMessage {
    return {
      to:
        input.adminPhone,

      templateName:
        WHATSAPP_TEMPLATE
          .APPOINTMENT_CANCELLED_BY_CLIENT,

      languageCode:
        DEFAULT_LANGUAGE_CODE,

      bodyParameters: [
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
      ],
    };
  }

  appointmentCancelledByAdmin(
    input:
      AppointmentCancelledByAdminTemplateInput,
  ): WhatsAppTemplateMessage {
    return {
      to:
        input.clientPhone,

      templateName:
        WHATSAPP_TEMPLATE
          .APPOINTMENT_CANCELLED_BY_ADMIN,

      languageCode:
        DEFAULT_LANGUAGE_CODE,

      bodyParameters: [
        input.clientName,
        input.serviceName,
        input.date,
        input.time,
        input.reason,
      ],
    };
  }
}