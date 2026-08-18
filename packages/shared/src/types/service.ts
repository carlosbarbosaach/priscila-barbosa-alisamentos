import type {
  ServicePhase,
} from "./service-phase.js";

export type Service = {
  id: string;
  salonId: string;

  name: string;
  description: string | null;
  category: string;

  /*
   * Duração total prevista do serviço.
   */
  durationMinutes: number;

  defaultPriceCents: number;

  /*
   * Etapas operacionais do serviço.
   *
   * Exemplo:
   *
   * Aplicação       60 min  ocupa
   * Ação produto    45 min  libera
   * Finalização     75 min  ocupa
   *
   * Serviço antigo sem configuração:
   * phases = []
   */
  phases: ServicePhase[];

  active: boolean;

  createdAt: string;
  updatedAt: string;
};