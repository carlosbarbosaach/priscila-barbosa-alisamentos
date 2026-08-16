import type { Timestamp } from "firebase-admin/firestore";

import type { UserRole } from "@priscila/shared";

export type UserDocument = {
  salonId: string;

  role: UserRole;
  active: boolean;

  email: string | null;
  displayName: string | null;
  photoUrl: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserEntity = UserDocument & {
  id: string;
};