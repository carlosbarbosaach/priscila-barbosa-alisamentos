import type { AppUser } from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

export type AdminMeResponse = {
    user: AppUser;

    access: {
        area: "ADMIN";
        authorized: true;
    };
};

export async function getAdminUser(): Promise<AdminMeResponse> {
    return apiFetch<AdminMeResponse>("/admin/me");
}