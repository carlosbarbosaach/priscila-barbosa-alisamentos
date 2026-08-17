import {
  USER_ROLES,
} from "@priscila/shared";

import type {
  FastifyPluginAsync,
} from "fastify";

import {
  ClientAuthLinkService,
} from "../clients/client-auth-link.service.js";

import {
  UserService,
} from "../users/user.service.js";

import {
  authenticate,
} from "../../shared/middleware/authenticate.middleware.js";

const userService =
  new UserService();

const clientAuthLinkService =
  new ClientAuthLinkService();

export const authRoutes: FastifyPluginAsync =
  async (app) => {
    app.get(
      "/me",
      {
        preHandler: authenticate,
      },
      async (
        request,
        reply,
      ) => {
        const authUser =
          request.authUser;

        if (!authUser) {
          return reply
            .status(401)
            .send({
              message:
                "Usuário não autenticado.",
            });
        }

        /*
         * Garante o usuário da aplicação.
         *
         * IMPORTANTE:
         *
         * - Se já existir ADMIN, continua ADMIN.
         * - Se já existir CLIENT, continua CLIENT.
         * - Se for um novo usuário, nasce CLIENT.
         */
        const user =
          await userService.ensureClientUser({
            id: authUser.uid,

            email:
              authUser.email ??
              null,

            displayName:
              authUser.name ??
              null,

            photoUrl:
              authUser.picture ??
              null,
          });

        /*
         * Somente CLIENT tenta estabelecer
         * vínculo com cadastro de cliente.
         *
         * ADMIN nunca passa por essa lógica.
         */
        let clientLink = null;

        if (
          user.role ===
          USER_ROLES.CLIENT
        ) {
          clientLink =
            await clientAuthLinkService.ensureLink(
              {
                salonId:
                  user.salonId,

                userId:
                  authUser.uid,

                email:
                  authUser.email,

                emailVerified:
                  authUser.email_verified ===
                  true,
              },
            );
        }

        return {
          user,

          clientLink,

          firebase: {
            emailVerified:
              authUser.email_verified ===
              true,
          },
        };
      },
    );
  };