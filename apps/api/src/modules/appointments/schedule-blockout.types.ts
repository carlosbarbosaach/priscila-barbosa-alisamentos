import type {
  Timestamp,
} from "firebase-admin/firestore";

/*
 * =====================================
 * BLOQUEIO ADMINISTRATIVO DE HORÁRIO
 * =====================================
 *
 * Este documento NÃO representa
 * um agendamento.
 *
 * Ele existe exclusivamente quando
 * o ADMIN decide fechar manualmente
 * um horário específico.
 *
 * Exemplo:
 *
 * 2026-08-21
 * 13:00
 *
 * O horário deixa de aparecer para
 * novas solicitações até que o ADMIN
 * remova este bloqueio.
 */
export type ScheduleBlockoutDocument = {
  /*
   * Salão proprietário do bloqueio.
   *
   * Mantemos salonId para garantir
   * isolamento multi-tenant.
   */
  salonId: string;

  /*
   * Data local da agenda.
   *
   * Formato:
   *
   * YYYY-MM-DD
   */
  dateKey: string;

  /*
   * Horário inicial bloqueado.
   *
   * Formato:
   *
   * HH:mm
   *
   * Exemplo:
   *
   * 13:00
   */
  startTime: string;

  /*
   * Motivo administrativo.
   *
   * Pode ser o mesmo motivo utilizado
   * na recusa do agendamento ou outro
   * texto definido posteriormente.
   */
  reason: string | null;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};

export type ScheduleBlockoutEntity =
  ScheduleBlockoutDocument & {
    id: string;
  };