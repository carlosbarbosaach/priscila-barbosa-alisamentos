import { apiFetch } from "@/services/api/api-client";

export type AuthMeResponse = {
  user: {
    id: string;
    salonId: string;

    role: "ADMIN" | "CLIENT" | "PROFESSIONAL";
    active: boolean;

    email: string | null;
    displayName: string | null;
    photoUrl: string | null;

    createdAt: string;
    updatedAt: string;
  };

  firebase: {
    emailVerified: boolean;
  };
};

export async function getAuthenticatedUser(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/auth/me");
}