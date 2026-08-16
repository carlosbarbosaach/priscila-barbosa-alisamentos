import type { AppUser } from "@priscila/shared";

import type { UserEntity } from "./user.types.js";

export function mapUserEntityToAppUser(
    user: UserEntity,
): AppUser {
    return {
        id: user.id,
        salonId: user.salonId,

        role: user.role,
        active: user.active,

        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,

        createdAt: user.createdAt.toDate().toISOString(),
        updatedAt: user.updatedAt.toDate().toISOString(),
    };
}