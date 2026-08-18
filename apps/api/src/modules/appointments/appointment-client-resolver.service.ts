import type {
  Client,
} from "@priscila/shared";

import {
  ClientRepository,
} from "../clients/client.repository.js";

export class AppointmentClientNotFoundError
  extends Error {
  constructor() {
    super(
      "Seu cadastro de cliente não está vinculado corretamente à sua conta.",
    );

    this.name =
      "AppointmentClientNotFoundError";
  }
}

export class AppointmentClientInactiveError
  extends Error {
  constructor() {
    super(
      "Sua conta de cliente está inativa.",
    );

    this.name =
      "AppointmentClientInactiveError";
  }
}

type ResolveAppointmentClientInput = {
  salonId: string;

  /*
   * UID obtido exclusivamente do
   * Firebase Authentication.
   */
  userId: string;
};

export class AppointmentClientResolverService {
  constructor(
    private readonly clientRepository =
      new ClientRepository(),
  ) {}

  async resolve(
    input: ResolveAppointmentClientInput,
  ): Promise<Client> {
    const {
      salonId,
      userId,
    } = input;

    if (
      !salonId ||
      salonId.trim().length ===
        0
    ) {
      throw new Error(
        "Salão não informado.",
      );
    }

    if (
      !userId ||
      userId.trim().length ===
        0
    ) {
      throw new Error(
        "Usuário não informado.",
      );
    }

    /*
     * Nunca recebemos clientId
     * do frontend.
     *
     * Descobrimos o client pelo
     * Firebase UID autenticado.
     */
    const client =
      await this.clientRepository
        .findByUserId(
          salonId,
          userId,
        );

    if (!client) {
      throw new AppointmentClientNotFoundError();
    }

    /*
     * Mesmo que o AppUser esteja
     * ativo, o cadastro em clients
     * também precisa estar ativo.
     */
    if (!client.active) {
      throw new AppointmentClientInactiveError();
    }

    /*
     * Proteção extra.
     *
     * findByUserId já deveria garantir
     * isso, mas não confiamos em um
     * documento inconsistente.
     */
    if (
      client.salonId !==
      salonId
    ) {
      throw new AppointmentClientNotFoundError();
    }

    if (
      client.userId !==
      userId
    ) {
      throw new AppointmentClientNotFoundError();
    }

    return {
      id:
        client.id,

      salonId:
        client.salonId,

      userId:
        client.userId,

      name:
        client.name,

      phone:
        client.phone,

      email:
        client.email,

      active:
        client.active,

      createdAt:
        client.createdAt
          .toDate()
          .toISOString(),

      updatedAt:
        client.updatedAt
          .toDate()
          .toISOString(),
    };
  }
}