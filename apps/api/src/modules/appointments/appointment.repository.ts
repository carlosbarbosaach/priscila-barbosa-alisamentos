import {
  APPOINTMENT_STATUS,
} from "@priscila/shared";

import type {
  Transaction,
} from "firebase-admin/firestore";

import {
  firestore,
} from "../../shared/firebase/firebase-firestore.js";

import type {
  AppointmentDocument,
  AppointmentEntity,
} from "./appointment.types.js";

const COLLECTION_NAME =
  "appointments";

export class AppointmentRepository {
  async findById(
    salonId: string,
    appointmentId: string,
  ): Promise<AppointmentEntity | null> {
    const snapshot =
      await firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          appointmentId,
        )
        .get();

    if (!snapshot.exists) {
      return null;
    }

    const data =
      snapshot.data() as
        AppointmentDocument;

    if (
      data.salonId !==
      salonId
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
   * Busca todas as solicitações que
   * ainda aguardam ação do ADMIN.
   *
   * Não filtramos por data.
   *
   * Dessa forma uma solicitação para
   * uma data futura também aparece
   * imediatamente no Dashboard.
   */
  async findPendingApprovalBySalon(
    salonId: string,
  ): Promise<AppointmentEntity[]> {
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
          "status",
          "==",
          APPOINTMENT_STATUS
            .PENDING_APPROVAL,
        )
        .orderBy(
          "startsAt",
          "asc",
        )
        .get();

    return snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...(document.data() as AppointmentDocument),
      }),
    );
  }

  /*
   * Versão transacional do findById.
   *
   * Será usada ao confirmar ou
   * recusar um agendamento.
   */
  async findByIdInTransaction(
    transaction: Transaction,
    salonId: string,
    appointmentId: string,
  ): Promise<AppointmentEntity | null> {
    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          appointmentId,
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
        AppointmentDocument;

    /*
     * Proteção multi-tenant.
     *
     * Mesmo tendo o ID do documento,
     * um ADMIN nunca pode manipular
     * Appointment de outro salão.
     */
    if (
      data.salonId !==
      salonId
    ) {
      return null;
    }

    return {
      id:
        snapshot.id,

      ...data,
    };
  }

  async findAllBySalon(
    salonId: string,
  ): Promise<AppointmentEntity[]> {
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
        .orderBy(
          "startsAt",
          "desc",
        )
        .get();

    return snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...(document.data() as AppointmentDocument),
      }),
    );
  }

  async findAllByClient(
    salonId: string,
    clientId: string,
  ): Promise<AppointmentEntity[]> {
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
          "clientId",
          "==",
          clientId,
        )
        .orderBy(
          "startsAt",
          "desc",
        )
        .get();

    return snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...(document.data() as AppointmentDocument),
      }),
    );
  }

  async findByDateKey(
    salonId: string,
    dateKey: string,
  ): Promise<AppointmentEntity[]> {
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
        .orderBy(
          "startsAt",
          "asc",
        )
        .get();

    return snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...(document.data() as AppointmentDocument),
      }),
    );
  }

  async findByDateKeyInTransaction(
    transaction: Transaction,
    salonId: string,
    dateKey: string,
  ): Promise<AppointmentEntity[]> {
    const query =
      firestore
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
        .orderBy(
          "startsAt",
          "asc",
        );

    const snapshot =
      await transaction.get(
        query,
      );

    return snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...(document.data() as AppointmentDocument),
      }),
    );
  }

  generateId(): string {
    return firestore
      .collection(
        COLLECTION_NAME,
      )
      .doc()
      .id;
  }

  async create(
    appointmentId: string,
    data: AppointmentDocument,
  ): Promise<void> {
    await firestore
      .collection(
        COLLECTION_NAME,
      )
      .doc(
        appointmentId,
      )
      .create(
        data,
      );
  }

  createInTransaction(
    transaction: Transaction,
    appointmentId: string,
    data: AppointmentDocument,
  ): void {
    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          appointmentId,
        );

    transaction.create(
      reference,
      data,
    );
  }

  async update(
    salonId: string,
    appointmentId: string,
    data:
      Partial<AppointmentDocument>,
  ): Promise<void> {
    const appointment =
      await this.findById(
        salonId,
        appointmentId,
      );

    if (!appointment) {
      throw new Error(
        "Agendamento não encontrado.",
      );
    }

    await firestore
      .collection(
        COLLECTION_NAME,
      )
      .doc(
        appointmentId,
      )
      .update(
        data,
      );
  }

  /*
   * Registra uma atualização dentro
   * de uma Transaction já aberta.
   *
   * Não executa commit sozinho.
   */
  updateInTransaction(
    transaction: Transaction,
    appointmentId: string,
    data:
      Partial<AppointmentDocument>,
  ): void {
    const reference =
      firestore
        .collection(
          COLLECTION_NAME,
        )
        .doc(
          appointmentId,
        );

    transaction.update(
      reference,
      data,
    );
  }
}