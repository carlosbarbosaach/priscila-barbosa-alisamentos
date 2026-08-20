import {
  apiFetch,
} from "@/services/api/api-client";

/*
 * =====================================
 * BLOQUEIO ADMINISTRATIVO DE HORÁRIO
 * =====================================
 *
 * Representação utilizada pelo
 * frontend ADMIN.
 *
 * Não é um Appointment.
 */
export type AdminScheduleBlockout = {
  id:
    string;

  dateKey:
    string;

  startTime:
    string;

  reason:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

/*
 * =====================================
 * LISTAR BLOQUEIOS
 * =====================================
 */

type AdminScheduleBlockoutsResponse = {
  dateKey:
    string;

  blockouts:
    AdminScheduleBlockout[];
};

export async function getAdminScheduleBlockouts(
  dateKey:
    string,
): Promise<
  AdminScheduleBlockout[]
> {
  const params =
    new URLSearchParams({
      dateKey,
    });

  const response =
    await apiFetch<AdminScheduleBlockoutsResponse>(
      `/admin/appointments/blockouts?${params.toString()}`,
    );

  return response.blockouts;
}

/*
 * =====================================
 * CRIAR BLOQUEIO MANUAL
 * =====================================
 */

export type CreateAdminScheduleBlockoutInput = {
  dateKey:
    string;

  startTime:
    string;

  reason:
    string;
};

type CreateAdminScheduleBlockoutResponse = {
  blockout:
    AdminScheduleBlockout;
};

export async function createAdminScheduleBlockout(
  input:
    CreateAdminScheduleBlockoutInput,
): Promise<
  AdminScheduleBlockout
> {
  const response =
    await apiFetch<CreateAdminScheduleBlockoutResponse>(
      "/admin/appointments/blockouts",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            dateKey:
              input.dateKey,

            startTime:
              input.startTime,

            reason:
              input.reason,
          }),
      },
    );

  return response.blockout;
}

/*
 * =====================================
 * LIBERAR HORÁRIO
 * =====================================
 */

export type ReleaseAdminScheduleBlockoutInput = {
  dateKey:
    string;

  startTime:
    string;
};

export async function releaseAdminScheduleBlockout(
  input:
    ReleaseAdminScheduleBlockoutInput,
): Promise<void> {
  const params =
    new URLSearchParams({
      dateKey:
        input.dateKey,

      startTime:
        input.startTime,
    });

  /*
   * O backend responde:
   *
   * 204 No Content
   *
   * O nosso apiFetch já sabe
   * trabalhar com resposta vazia.
   */
  await apiFetch<void>(
    `/admin/appointments/blockouts?${params.toString()}`,
    {
      method:
        "DELETE",
    },
  );
}