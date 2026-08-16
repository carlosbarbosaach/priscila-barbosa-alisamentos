import type { UserRole } from "../enums/user-role.js";

export type AppUser = {
    id: string;
    salonId: string;

    role: UserRole;
    active: boolean;

    email: string | null;
    displayName: string | null;
    photoUrl: string | null;

    createdAt: string;
    updatedAt: string;
};