export const USER_ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  PROFESSIONAL: "PROFESSIONAL",
} as const;

export type UserRole =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];