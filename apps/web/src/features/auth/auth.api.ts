import type {
    AppUser,
    Client,
} from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

export type ClientAuthLinkStatus =
    | "ALREADY_LINKED"
    | "LINKED"
    | "NO_EMAIL"
    | "EMAIL_NOT_VERIFIED"
    | "NO_MATCH"
    | "AMBIGUOUS_EMAIL"
    | "CLIENT_INACTIVE"
    | "CLIENT_ALREADY_LINKED";

export type ClientAuthLink = {
    status: ClientAuthLinkStatus;
    client: Client | null;
};

export type AuthMeResponse = {
    user: AppUser;

    clientLink:
    | ClientAuthLink
    | null;

    firebase: {
        emailVerified: boolean;
    };
};

export async function getAuthMe(): Promise<AuthMeResponse> {
    return apiFetch<AuthMeResponse>(
        "/auth/me",
    );
}