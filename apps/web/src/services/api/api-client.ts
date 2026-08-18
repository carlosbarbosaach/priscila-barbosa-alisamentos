import {
  firebaseAuth,
} from "@/lib/firebase/auth";

import {
  apiConfig,
} from "./api.config";

type ApiFetchOptions =
  RequestInit & {
    authenticated?: boolean;
  };

export async function apiFetch<T>(
  path: string,
  options:
    ApiFetchOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders =
    new Headers(
      headers,
    );

  /*
   * Só adicionamos:
   *
   * Content-Type: application/json
   *
   * quando realmente existe um body.
   *
   * Isso é importante para endpoints
   * como:
   *
   * PATCH /confirm
   *
   * que não possuem body.
   */
  const hasBody =
    requestOptions.body !==
      undefined &&
    requestOptions.body !==
      null;

  const bodyIsFormData =
    typeof FormData !==
      "undefined" &&
    requestOptions.body instanceof
      FormData;

  if (
    hasBody &&
    !bodyIsFormData &&
    !requestHeaders.has(
      "Content-Type",
    )
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  /*
   * Autenticação Firebase.
   */
  if (authenticated) {
    const user =
      firebaseAuth.currentUser;

    if (!user) {
      throw new Error(
        "Usuário não autenticado.",
      );
    }

    const token =
      await user.getIdToken();

    requestHeaders.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response =
    await fetch(
      `${apiConfig.baseUrl}${path}`,
      {
        ...requestOptions,

        headers:
          requestHeaders,
      },
    );

  /*
   * Tratamento dos erros da API.
   */
  if (!response.ok) {
    const contentType =
      response.headers.get(
        "content-type",
      );

    let message =
      "Ocorreu um erro ao comunicar com a API.";

    if (
      contentType?.includes(
        "application/json",
      )
    ) {
      const errorBody =
        await response
          .json()
          .catch(
            () => null,
          );

      if (
        errorBody &&
        typeof errorBody ===
          "object" &&
        "message" in
          errorBody &&
        typeof errorBody.message ===
          "string"
      ) {
        message =
          errorBody.message;
      }
    } else {
      const errorText =
        await response
          .text()
          .catch(
            () => "",
          );

      if (
        errorText.trim()
          .length > 0
      ) {
        message =
          errorText;
      }
    }

    throw new Error(
      message,
    );
  }

  /*
   * Alguns endpoints podem responder
   * 204 No Content.
   *
   * Evitamos tentar executar
   * response.json() nesse cenário.
   */
  if (
    response.status ===
    204
  ) {
    return undefined as T;
  }

  const contentType =
    response.headers.get(
      "content-type",
    );

  /*
   * Nossos endpoints normalmente
   * retornam JSON.
   */
  if (
    contentType?.includes(
      "application/json",
    )
  ) {
    return response.json() as
      Promise<T>;
  }

  /*
   * Proteção para resposta vazia.
   */
  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(
    text,
  ) as T;
}