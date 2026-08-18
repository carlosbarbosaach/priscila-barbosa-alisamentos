export type ServicePhase = {
  /*
   * Identificador interno da etapa.
   *
   * Exemplo:
   * application
   * processing
   * finishing
   */
  id: string;

  /*
   * Nome apresentado no ADMIN.
   *
   * Exemplo:
   * Aplicação
   * Tempo de ação
   * Finalização
   */
  name: string;

  /*
   * Duração desta etapa em minutos.
   */
  durationMinutes: number;

  /*
   * true:
   * a profissional está ocupada
   * e não pode atender outra cliente.
   *
   * false:
   * é um período de espera e outra
   * cliente pode ser atendida.
   */
  occupiesProfessional: boolean;

  /*
   * Ordem da etapa dentro do serviço.
   *
   * 1, 2, 3...
   */
  order: number;
};