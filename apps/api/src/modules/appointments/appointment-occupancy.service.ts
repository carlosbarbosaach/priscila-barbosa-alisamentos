import type {
  ServicePhase,
} from "@priscila/shared";

import type {
  ProfessionalOccupancyInterval,
} from "./appointment-occupancy.types.js";

type BuildOccupancyInput = {
  durationMinutes: number;
  phases: ServicePhase[];
};

export class AppointmentOccupancyService {
  buildProfessionalOccupancy(
    input: BuildOccupancyInput,
  ): ProfessionalOccupancyInterval[] {
    const {
      durationMinutes,
      phases,
    } = input;

    /*
     * Segurança básica da duração
     * total do serviço.
     */
    if (
      !Number.isInteger(
        durationMinutes,
      ) ||
      durationMinutes <= 0
    ) {
      throw new Error(
        "A duração do serviço deve ser maior que zero.",
      );
    }

    /*
     * Serviço antigo ou ainda sem
     * etapas configuradas.
     *
     * Fallback seguro:
     * toda a duração bloqueia
     * a profissional.
     */
    if (phases.length === 0) {
      return [
        {
          startOffsetMinutes: 0,
          endOffsetMinutes:
            durationMinutes,
        },
      ];
    }

    /*
     * Nunca dependemos da ordem
     * recebida do Firestore/frontend.
     */
    const orderedPhases =
      [...phases].sort(
        (a, b) =>
          a.order - b.order,
      );

    let currentOffset = 0;

    const intervals:
      ProfessionalOccupancyInterval[] =
        [];

    for (
      const phase of orderedPhases
    ) {
      if (
        !Number.isInteger(
          phase.durationMinutes,
        ) ||
        phase.durationMinutes <= 0
      ) {
        throw new Error(
          `A etapa "${phase.name}" possui duração inválida.`,
        );
      }

      const phaseStart =
        currentOffset;

      const phaseEnd =
        phaseStart +
        phase.durationMinutes;

      /*
       * Só guardamos intervalos
       * nos quais a profissional
       * realmente está ocupada.
       */
      if (
        phase.occupiesProfessional
      ) {
        intervals.push({
          startOffsetMinutes:
            phaseStart,

          endOffsetMinutes:
            phaseEnd,
        });
      }

      /*
       * Mesmo etapas que não ocupam
       * a profissional avançam o
       * relógio do serviço.
       */
      currentOffset =
        phaseEnd;
    }

    /*
     * Proteção importante:
     *
     * A soma das etapas precisa bater
     * exatamente com durationMinutes.
     *
     * Isso evita uma configuração como:
     *
     * duração serviço = 180
     * soma etapas = 150
     */
    if (
      currentOffset !==
      durationMinutes
    ) {
      throw new Error(
        `A soma das etapas do serviço (${currentOffset} min) não corresponde à duração total (${durationMinutes} min).`,
      );
    }

    /*
     * Se todas as fases forem períodos
     * que não ocupam a profissional,
     * retornamos [].
     *
     * Isso é tecnicamente válido,
     * embora improvável em um serviço real.
     */
    return this.mergeAdjacentIntervals(
      intervals,
    );
  }

  /*
   * Exemplo:
   *
   * 0 → 30 ocupado
   * 30 → 60 ocupado
   *
   * vira:
   *
   * 0 → 60 ocupado
   *
   * Isso simplifica os cálculos
   * posteriores de conflito.
   */
  private mergeAdjacentIntervals(
    intervals:
      ProfessionalOccupancyInterval[],
  ): ProfessionalOccupancyInterval[] {
    if (
      intervals.length <= 1
    ) {
      return intervals;
    }

    const merged:
      ProfessionalOccupancyInterval[] =
        [];

    for (
      const interval of intervals
    ) {
      const previous =
        merged[
          merged.length - 1
        ];

      if (!previous) {
        merged.push({
          ...interval,
        });

        continue;
      }

      /*
       * Intervalos consecutivos:
       *
       * 0 → 30
       * 30 → 60
       *
       * são na prática um único
       * período ocupado.
       */
      if (
        previous.endOffsetMinutes ===
        interval.startOffsetMinutes
      ) {
        previous.endOffsetMinutes =
          interval.endOffsetMinutes;

        continue;
      }

      merged.push({
        ...interval,
      });
    }

    return merged;
  }
}