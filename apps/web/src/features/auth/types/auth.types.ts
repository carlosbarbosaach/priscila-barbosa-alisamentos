import type {
  AppUser,
} from "@priscila/shared";

import type {
  User,
} from "firebase/auth";

import type {
  ClientAuthLink,
} from "../auth.api";

export type AuthContextValue = {
  /*
   * Usuário autenticado diretamente
   * pelo Firebase.
   */
  user: User | null;

  /*
   * Usuário da nossa aplicação.
   *
   * Aqui encontramos:
   * ADMIN ou CLIENT.
   */
  appUser: AppUser | null;

  /*
   * Informações do vínculo entre
   * Firebase Auth e clients.
   *
   * Para ADMIN será null.
   */
  clientLink: ClientAuthLink | null;

  /*
   * Estado real de verificação
   * informado pelo Firebase/backend.
   */
  emailVerified: boolean;

  /*
   * Enquanto Firebase + backend
   * estão sendo resolvidos.
   */
  loading: boolean;

  /*
   * Caso o Firebase autentique,
   * mas nosso backend não consiga
   * carregar a sessão.
   */
  sessionError: string | null;

  /*
   * Permite atualizar /auth/me
   * posteriormente sem precisar
   * efetuar novo login.
   */
  refreshSession: () => Promise<void>;
};