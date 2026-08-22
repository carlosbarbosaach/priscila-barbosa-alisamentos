import {
    whatsappConfig,
} from "./whatsapp.config.js";

import type {
    WhatsAppGateway,
} from "./whatsapp.gateway.js";

import {
    WhatsAppTemplateService,
} from "./whatsapp-template.service.js";

import type {
    WhatsAppTemplateMessage,
} from "./whatsapp.types.js";

/*
 * =================================
 * STATUS DA NOTIFICAÇÃO
 * =================================
 */

export const WHATSAPP_NOTIFICATION_STATUS = {
    SENT:
        "SENT",

    SKIPPED:
        "SKIPPED",

    FAILED:
        "FAILED",
} as const;

export type WhatsAppNotificationStatus =
    typeof WHATSAPP_NOTIFICATION_STATUS[
    keyof typeof WHATSAPP_NOTIFICATION_STATUS
    ];

/*
 * =================================
 * MOTIVOS DE SKIP
 * =================================
 */

export const WHATSAPP_NOTIFICATION_SKIP_REASON = {
    DISABLED:
        "WHATSAPP_DISABLED",
} as const;

export type WhatsAppNotificationSkipReason =
    typeof WHATSAPP_NOTIFICATION_SKIP_REASON[
    keyof typeof WHATSAPP_NOTIFICATION_SKIP_REASON
    ];

/*
 * =================================
 * RESULTADO
 * =================================
 *
 * O serviço nunca precisa lançar erro
 * para quem chamou.
 *
 * O resultado poderá ser salvo no
 * Firestore posteriormente.
 */

export type WhatsAppNotificationResult =
    | {
        status:
        typeof WHATSAPP_NOTIFICATION_STATUS.SENT;

        providerMessageId:
        string;
    }
    | {
        status:
        typeof WHATSAPP_NOTIFICATION_STATUS.SKIPPED;

        reason:
        WhatsAppNotificationSkipReason;
    }
    | {
        status:
        typeof WHATSAPP_NOTIFICATION_STATUS.FAILED;

        errorMessage:
        string;
    };

/*
 * =================================
 * INPUT BASE
 * =================================
 */

type AppointmentNotificationBaseInput = {
    clientName:
    string;

    serviceName:
    string;

    date:
    string;

    time:
    string;
};

export type NotifyAppointmentRequestedInput =
    AppointmentNotificationBaseInput;

export type NotifyAppointmentConfirmedInput =
    AppointmentNotificationBaseInput & {
        clientPhone:
        string;
    };

export type NotifyAppointmentRejectedInput =
    AppointmentNotificationBaseInput & {
        clientPhone:
        string;

        reason:
        string;
    };

export type NotifyAppointmentCancelledByClientInput =
    AppointmentNotificationBaseInput;

export type NotifyAppointmentCancelledByAdminInput =
    AppointmentNotificationBaseInput & {
        clientPhone:
        string;

        reason:
        string;
    };

/*
 * =================================
 * HELPERS
 * =================================
 */

function getErrorMessage(
    error:
        unknown,
) {
    if (
        error instanceof Error &&
        error.message
            .trim()
            .length >
        0
    ) {
        return error.message;
    }

    return "Falha desconhecida ao enviar notificação pelo WhatsApp.";
}

/*
 * =================================
 * WHATSAPP NOTIFICATION SERVICE
 * =================================
 *
 * Este serviço:
 *
 * - escolhe o template;
 * - chama o gateway;
 * - trata falhas;
 * - nunca conhece fetch;
 * - nunca conhece Graph API;
 * - nunca altera um agendamento.
 *
 * O gateway é recebido por injeção
 * de dependência.
 *
 * Isso facilita testes e futuras
 * trocas de provedor.
 */
export class WhatsAppNotificationService {
    constructor(
        private readonly gateway:
            WhatsAppGateway,

        private readonly templateService =
            new WhatsAppTemplateService(),
    ) { }

    /*
     * =================================
     * ENVIO SEGURO
     * =================================
     */

    private async sendSafely(
        message:
            WhatsAppTemplateMessage,
    ): Promise<WhatsAppNotificationResult> {
        /*
         * Se estiver desligado,
         * simplesmente não envia.
         *
         * Isso NÃO é erro.
         */
        if (
            !whatsappConfig.enabled
        ) {
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .SKIPPED,

                reason:
                    WHATSAPP_NOTIFICATION_SKIP_REASON
                        .DISABLED,
            };
        }

        try {
            const result =
                await this.gateway
                    .sendTemplate(
                        message,
                    );

            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .SENT,

                providerMessageId:
                    result
                        .providerMessageId,
            };
        } catch (
        error
        ) {
            /*
             * Muito importante:
             *
             * uma falha do WhatsApp NÃO
             * pode desfazer ou impedir um
             * agendamento já salvo.
             */
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .FAILED,

                errorMessage:
                    getErrorMessage(
                        error,
                    ),
            };
        }
    }

    /*
     * =================================
     * NOVO AGENDAMENTO
     * =================================
     *
     * CLIENTE solicita
     * ↓
     * PRISCILA recebe aviso.
     */
    async notifyAppointmentRequested(
        input:
            NotifyAppointmentRequestedInput,
    ): Promise<WhatsAppNotificationResult> {
        if (
            !whatsappConfig.enabled
        ) {
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .SKIPPED,

                reason:
                    WHATSAPP_NOTIFICATION_SKIP_REASON
                        .DISABLED,
            };
        }

        const adminPhone =
            whatsappConfig
                .adminPhone;

        if (
            !adminPhone
        ) {
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .FAILED,

                errorMessage:
                    "Telefone administrativo do WhatsApp não configurado.",
            };
        }

        const message =
            this.templateService
                .appointmentRequested({
                    adminPhone,

                    clientName:
                        input.clientName,

                    serviceName:
                        input.serviceName,

                    date:
                        input.date,

                    time:
                        input.time,
                });

        return this.sendSafely(
            message,
        );
    }

    /*
     * =================================
     * AGENDAMENTO CONFIRMADO
     * =================================
     *
     * ADMIN confirma
     * ↓
     * CLIENTE recebe aviso.
     */
    async notifyAppointmentConfirmed(
        input:
            NotifyAppointmentConfirmedInput,
    ): Promise<WhatsAppNotificationResult> {
        const message =
            this.templateService
                .appointmentConfirmed({
                    clientPhone:
                        input.clientPhone,

                    clientName:
                        input.clientName,

                    serviceName:
                        input.serviceName,

                    date:
                        input.date,

                    time:
                        input.time,
                });

        return this.sendSafely(
            message,
        );
    }

    /*
     * =================================
     * AGENDAMENTO RECUSADO
     * =================================
     */
    async notifyAppointmentRejected(
        input:
            NotifyAppointmentRejectedInput,
    ): Promise<WhatsAppNotificationResult> {
        const message =
            this.templateService
                .appointmentRejected({
                    clientPhone:
                        input.clientPhone,

                    clientName:
                        input.clientName,

                    serviceName:
                        input.serviceName,

                    date:
                        input.date,

                    time:
                        input.time,

                    reason:
                        input.reason,
                });

        return this.sendSafely(
            message,
        );
    }

    /*
     * =================================
     * CANCELADO PELA CLIENTE
     * =================================
     *
     * CLIENTE cancela
     * ↓
     * PRISCILA recebe aviso.
     */
    async notifyAppointmentCancelledByClient(
        input:
            NotifyAppointmentCancelledByClientInput,
    ): Promise<WhatsAppNotificationResult> {
        if (
            !whatsappConfig.enabled
        ) {
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .SKIPPED,

                reason:
                    WHATSAPP_NOTIFICATION_SKIP_REASON
                        .DISABLED,
            };
        }

        const adminPhone =
            whatsappConfig
                .adminPhone;

        if (
            !adminPhone
        ) {
            return {
                status:
                    WHATSAPP_NOTIFICATION_STATUS
                        .FAILED,

                errorMessage:
                    "Telefone administrativo do WhatsApp não configurado.",
            };
        }

        const message =
            this.templateService
                .appointmentCancelledByClient({
                    adminPhone,

                    clientName:
                        input.clientName,

                    serviceName:
                        input.serviceName,

                    date:
                        input.date,

                    time:
                        input.time,
                });

        return this.sendSafely(
            message,
        );
    }

    /*
     * =================================
     * CANCELADO PELO ADMIN
     * =================================
     */
    async notifyAppointmentCancelledByAdmin(
        input:
            NotifyAppointmentCancelledByAdminInput,
    ): Promise<WhatsAppNotificationResult> {
        const message =
            this.templateService
                .appointmentCancelledByAdmin({
                    clientPhone:
                        input.clientPhone,

                    clientName:
                        input.clientName,

                    serviceName:
                        input.serviceName,

                    date:
                        input.date,

                    time:
                        input.time,

                    reason:
                        input.reason,
                });

        return this.sendSafely(
            message,
        );
    }
}