import type { User } from "firebase/auth";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
};