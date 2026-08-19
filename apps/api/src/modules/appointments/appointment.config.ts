import {
    APPOINTMENT_STATUS,
    type AppointmentStatus,
} from "@priscila/shared";

/*
 * Configuração oficial da agenda
 * PRISCILA BARBOSA ALISAMENTOS.
 */
export const APPOINTMENT_CONFIG = {
    /*
     * Fuso horário oficial do salão.
     */
    timeZone:
        "America/Sao_Paulo",

    /*
     * JavaScript:
     *
     * 0 = domingo
     * 1 = segunda
     * 2 = terça
     * 3 = quarta
     * 4 = quinta
     * 5 = sexta
     * 6 = sábado
     */
    workingWeekDays: [
        1,
        2,
        3,
        4,
        5,
        6,
    ],

    /*
     * =================================
     * HORÁRIOS OFICIAIS
     * =================================
     *
     * Estes são horários de INÍCIO
     * disponibilizados para a cliente.
     *
     * A duração de um atendimento
     * anterior NÃO remove automaticamente
     * outro horário desta lista.
     */
    startTimesByWeekDay: [
        /*
         * Domingo
         */
        [],

        /*
         * Segunda
         */
        [
            "08:00",
            "13:00",
            "17:00",
        ],

        /*
         * Terça
         */
        [
            "08:00",
            "13:00",
            "17:00",
        ],

        /*
         * Quarta
         */
        [
            "08:00",
            "13:00",
            "17:00",
        ],

        /*
         * Quinta
         */
        [
            "08:00",
            "13:00",
            "17:00",
        ],

        /*
         * Sexta
         */
        [
            "08:00",
            "13:00",
            "17:00",
        ],

        /*
         * Sábado
         */
        [
            "07:00",
            "08:00",
            "13:00",
            "17:00",
        ],
    ],

    /*
     * Mantemos temporariamente estas
     * propriedades porque outras partes
     * do código atual ainda podem
     * referenciá-las.
     *
     * Elas deixarão de determinar os
     * horários mostrados à cliente.
     */
    openingTime:
        "07:00",

    closingTime:
        "20:00",

    slotIntervalMinutes:
        30,

    /*
     * A agenda continua trabalhando
     * com uma solicitação por horário
     * exato.
     *
     * A sobreposição causada pela
     * DURAÇÃO será controlada
     * manualmente pela Priscila.
     */
    maxConcurrentAppointments:
        1,
} as const;

/*
 * Estados que ocupam um HORÁRIO EXATO.
 *
 * IMPORTANTE:
 *
 * Depois da alteração do ConflictService,
 * esses estados NÃO bloquearão mais
 * horários diferentes apenas porque
 * existe sobreposição de duração.
 *
 * Exemplo permitido:
 *
 * 07:00 → CONFIRMED
 * 08:00 → pode ser solicitado
 */
export const BLOCKING_APPOINTMENT_STATUSES:
    readonly AppointmentStatus[] = [
        APPOINTMENT_STATUS
            .PENDING_APPROVAL,

        APPOINTMENT_STATUS
            .CONFIRMED,

        APPOINTMENT_STATUS
            .IN_PROGRESS,
    ];

/*
 * Estados que não impedem
 * novos agendamentos.
 */
export const NON_BLOCKING_APPOINTMENT_STATUSES:
    readonly AppointmentStatus[] = [
        APPOINTMENT_STATUS
            .REJECTED,

        APPOINTMENT_STATUS
            .CANCELLED,

        APPOINTMENT_STATUS
            .COMPLETED,
    ];

export function isBlockingAppointmentStatus(
    status:
        AppointmentStatus,
): boolean {
    return BLOCKING_APPOINTMENT_STATUSES
        .includes(
            status,
        );
}