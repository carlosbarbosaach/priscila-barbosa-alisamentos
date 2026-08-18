export type ProfessionalOccupancyInterval = {
    /*
     * Minutos relativos ao início
     * do agendamento.
     *
     * Exemplo:
     *
     * Agendamento começa 08:00
     *
     * startOffsetMinutes = 0
     * endOffsetMinutes = 60
     *
     * representa:
     * 08:00 → 09:00
     */
    startOffsetMinutes: number;

    endOffsetMinutes: number;
};