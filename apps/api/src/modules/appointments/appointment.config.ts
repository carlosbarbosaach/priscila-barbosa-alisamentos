import {
    APPOINTMENT_STATUS,
    type AppointmentStatus,
} from "@priscila/shared";

/*
 * Configuração provisória da agenda.
 *
 * IMPORTANTE:
 * estas regras serão futuramente
 * substituídas pelas configurações
 * reais do salão.
 */
export const APPOINTMENT_CONFIG = {
    /*
     * Fuso horário oficial do salão.
     */
    timeZone: "America/Sao_Paulo",

    /*
     * Dias da semana em que o salão
     * atende provisoriamente.
     *
     * JavaScript:
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
     * Horário provisório de funcionamento.
     */
    openingTime: "08:00",

    closingTime: "18:00",

    /*
     * Intervalo entre opções apresentadas
     * para a cliente.
     *
     * Exemplo:
     * 08:00
     * 08:30
     * 09:00
     * 09:30
     */
    slotIntervalMinutes: 30,

    /*
     * Por enquanto consideramos
     * apenas um atendimento simultâneo.
     */
    maxConcurrentAppointments: 1,
} as const;

/*
 * Estados que ocupam a agenda.
 *
 * PENDING_APPROVAL também bloqueia,
 * evitando duas clientes solicitarem
 * exatamente o mesmo horário enquanto
 * aguardam resposta da administração.
 */
export const BLOCKING_APPOINTMENT_STATUSES:
    readonly AppointmentStatus[] = [
        APPOINTMENT_STATUS.PENDING_APPROVAL,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.IN_PROGRESS,
    ];

/*
 * Estados que NÃO devem impedir
 * um novo agendamento para aquele
 * período.
 */
export const NON_BLOCKING_APPOINTMENT_STATUSES:
    readonly AppointmentStatus[] = [
        APPOINTMENT_STATUS.REJECTED,
        APPOINTMENT_STATUS.CANCELLED,
        APPOINTMENT_STATUS.COMPLETED,
    ];

export function isBlockingAppointmentStatus(
    status: AppointmentStatus,
): boolean {
    return BLOCKING_APPOINTMENT_STATUSES.includes(
        status,
    );
}