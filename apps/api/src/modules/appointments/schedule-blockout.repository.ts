import type {
  Transaction,
} from "firebase-admin/firestore";

import {
  firestore,
} from "../../shared/firebase/firebase-firestore.js";

import type {
  ScheduleBlockoutDocument,
  ScheduleBlockoutEntity,
} from "./schedule-blockout.types.js";

const COLLECTION_NAME =
  "scheduleBlockouts";

export class ScheduleBlockoutRepository {
  /*
   * =====================================
   * ID DETERMINÍSTICO
   * =====================================
   *
   * Cada salão pode possuir apenas
   * um bloqueio para determinada
   * data + horário.
   *
   * Exemplo:
   *
   * priscila-barbosa-alisamentos
   * 2026-08-21
   * 13:00
   *
   * ↓
   *
   * priscila-barbosa-alisamentos__2026-08-21__13-00
   *
   * Isso também ajuda a impedir dois
   * bloqueios administrativos
   * duplicados para o mesmo horário.
   */
  buildId(
    salonId: string,
    dateKey: string,
    startTime: string,
  ): string {
    const normalizedStartTime =
      startTime.replace(
        ":",
        "-",
      );

    return [
      salonId,
      dateKey,
      normalizedStartTime,
    ].join(
      "__",
    );
  }

  /*
   * =====================================
   * BUSCAR BLOQUEIO EXATO
   * =====================================
   */
  async findBySlot(
    salonId: string,
    dateKey: string,
    startTime: string,
  ): Promise<ScheduleBlockoutEntity | null> {
    const blockoutId =
      this.buildId(
        salonId,
        dateKey,
        startTime,
      );

    const snapshot =
      await firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          blockoutId,
        )
        .get();

    if (!snapshot.exists) {
      return null;
    }

    const data =
      snapshot.data() as
        ScheduleBlockoutDocument;

    /*
     * Proteção adicional.
     *
     * Mesmo utilizando ID determinístico,
     * nunca confiamos somente no ID
     * para isolamento do salão.
     */
    if (
      data.salonId !== salonId ||
      data.dateKey !== dateKey ||
      data.startTime !== startTime
    ) {
      return null;
    }

    return {
      id:
        snapshot.id,

      ...data,
    };
  }

  /*
   * =====================================
   * BLOQUEIOS DE UMA DATA
   * =====================================
   *
   * Será utilizado pela disponibilidade
   * para retirar horários bloqueados
   * administrativamente.
   */
  async findByDateKey(
    salonId: string,
    dateKey: string,
  ): Promise<ScheduleBlockoutEntity[]> {
    const snapshot =
      await firestore
        .collection(
          COLLECTION_NAME,
        )
        .where(
          "salonId",
          "==",
          salonId,
        )
        .where(
          "dateKey",
          "==",
          dateKey,
        )
        .get();

    return snapshot.docs
      .map(
        (document) => ({
          id:
            document.id,

          ...(document.data() as ScheduleBlockoutDocument),
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.startTime.localeCompare(
            second.startTime,
          ),
      );
  }

  /*
   * =====================================
   * BUSCA TRANSACIONAL
   * =====================================
   *
   * Utilizaremos durante operações
   * críticas para evitar inconsistência
   * entre bloqueio administrativo
   * e criação de agendamento.
   */
  async findBySlotInTransaction(
    transaction: Transaction,
    salonId: string,
    dateKey: string,
    startTime: string,
  ): Promise<ScheduleBlockoutEntity | null> {
    const blockoutId =
      this.buildId(
        salonId,
        dateKey,
        startTime,
      );

    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          blockoutId,
        );

    const snapshot =
      await transaction.get(
        reference,
      );

    if (!snapshot.exists) {
      return null;
    }

    const data =
      snapshot.data() as
        ScheduleBlockoutDocument;

    if (
      data.salonId !== salonId ||
      data.dateKey !== dateKey ||
      data.startTime !== startTime
    ) {
      return null;
    }

    return {
      id:
        snapshot.id,

      ...data,
    };
  }

  /*
   * =====================================
   * CRIAR BLOQUEIO
   * =====================================
   */
  async create(
    data: ScheduleBlockoutDocument,
  ): Promise<string> {
    const blockoutId =
      this.buildId(
        data.salonId,
        data.dateKey,
        data.startTime,
      );

    await firestore
      .collection(
        COLLECTION_NAME,
      )
      .doc(
        blockoutId,
      )
      .create(
        data,
      );

    return blockoutId;
  }

  /*
   * =====================================
   * CRIAR EM TRANSACTION
   * =====================================
   */
  createInTransaction(
    transaction: Transaction,
    data: ScheduleBlockoutDocument,
  ): string {
    const blockoutId =
      this.buildId(
        data.salonId,
        data.dateKey,
        data.startTime,
      );

    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          blockoutId,
        );

    transaction.create(
      reference,
      data,
    );

    return blockoutId;
  }

  /*
   * =====================================
   * LIBERAR HORÁRIO
   * =====================================
   *
   * Remover o documento significa
   * liberar novamente aquele horário.
   */
  async delete(
    salonId: string,
    dateKey: string,
    startTime: string,
  ): Promise<void> {
    const blockout =
      await this.findBySlot(
        salonId,
        dateKey,
        startTime,
      );

    if (!blockout) {
      return;
    }

    await firestore
      .collection(
        COLLECTION_NAME,
      )
      .doc(
        blockout.id,
      )
      .delete();
  }

  /*
   * =====================================
   * LIBERAR EM TRANSACTION
   * =====================================
   */
  deleteInTransaction(
    transaction: Transaction,
    salonId: string,
    dateKey: string,
    startTime: string,
  ): void {
    const blockoutId =
      this.buildId(
        salonId,
        dateKey,
        startTime,
      );

    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          blockoutId,
        );

    transaction.delete(
      reference,
    );
  }
}