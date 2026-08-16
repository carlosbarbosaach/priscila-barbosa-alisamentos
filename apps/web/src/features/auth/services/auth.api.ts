import { apiFetch } from "@/services/api/api-client";

export type AuthMeResponse = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

export async function getAuthenticatedUser(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/auth/me");
}