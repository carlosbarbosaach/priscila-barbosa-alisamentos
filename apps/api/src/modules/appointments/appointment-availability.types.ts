export type AvailabilitySlot = {
    /*
     * Data local do salão.
     *
     * Exemplo:
     * 2026-08-19
     */
    dateKey: string;

    /*
     * Horários locais apresentados
     * para a cliente.
     *
     * Exemplo:
     * 08:00 → 11:00
     */
    startTime: string;
    endTime: string;

    /*
     * Minutos desde meia-noite.
     *
     * Esses campos são internos e
     * facilitarão bastante o cálculo
     * de conflitos na próxima etapa.
     */
    startMinutes: number;
    endMinutes: number;
};