import { firebaseAuth } from "@/lib/firebase/auth";

import { apiConfig } from "./api.config";

type ApiFetchOptions = RequestInit & {
    authenticated?: boolean;
};

export async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const {
        authenticated = true,
        headers,
        ...requestOptions
    } = options;

    const requestHeaders = new Headers(headers);

    requestHeaders.set(
        "Content-Type",
        "application/json",
    );

    if (authenticated) {
        const user = firebaseAuth.currentUser;

        if (!user) {
            throw new Error(
                "Usuário não autenticado.",
            );
        }

        const token = await user.getIdToken();

        requestHeaders.set(
            "Authorization",
            `Bearer ${token}`,
        );
    }

    const response = await fetch(
        `${apiConfig.baseUrl}${path}`,
        {
            ...requestOptions,
            headers: requestHeaders,
        },
    );

    if (!response.ok) {
        const errorBody = await response
            .json()
            .catch(() => null);

        const message =
            errorBody &&
                typeof errorBody === "object" &&
                "message" in errorBody &&
                typeof errorBody.message === "string"
                ? errorBody.message
                : "Ocorreu um erro ao comunicar com a API.";

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}