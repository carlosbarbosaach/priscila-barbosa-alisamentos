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
  ClientSelfRegistrationError,
  ClientSelfRegistrationService,
} from "../clients/client-self-registration.service.js";

import {
  completeClientProfileSchema,
} from "../clients/client-self-registration.schema.js";

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

const clientSelfRegistrationService =
  new ClientSelfRegistrationService();

export const authRoutes: FastifyPluginAsync =
  async (app) => {
    /*
     * Sessão atual.
     */
    app.get(
      "/me",
      {
        preHandler:
          authenticate,
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

        const user =
          await userService.ensureClientUser({
            id:
              authUser.uid,

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

        let clientLink =
          null;

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

    /*
     * Completar cadastro de uma
     * CLIENT que ainda não possui
     * documento em clients.
     */
    app.post(
      "/complete-client-profile",
      {
        preHandler:
          authenticate,
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

        const parsed =
          completeClientProfileSchema.safeParse(
            request.body,
          );

        if (!parsed.success) {
          return reply
            .status(400)
            .send({
              message:
                parsed.error.issues[0]
                  ?.message ??
                "Dados inválidos.",
            });
        }

        const user =
          await userService.findById(
            authUser.uid,
          );

        if (!user) {
          return reply
            .status(401)
            .send({
              message:
                "Usuário da aplicação não encontrado.",
            });
        }

        if (
          user.role !==
          USER_ROLES.CLIENT
        ) {
          return reply
            .status(403)
            .send({
              message:
                "Apenas clientes podem completar este cadastro.",
            });
        }

        if (!user.active) {
          return reply
            .status(403)
            .send({
              message:
                "Sua conta está inativa.",
            });
        }

        /*
         * Cadastro definitivo exige
         * um e-mail real e verificado.
         */
        if (
          !authUser.email ||
          authUser.email_verified !==
          true
        ) {
          return reply
            .status(403)
            .send({
              message:
                "Confirme seu e-mail antes de completar o cadastro.",
            });
        }

        try {
          const client =
            await clientSelfRegistrationService.complete(
              {
                salonId:
                  user.salonId,

                userId:
                  authUser.uid,

                email:
                  authUser.email,

                name:
                  parsed.data.name,

                phone:
                  parsed.data.phone,
              },
            );

          return reply.send({
            client,
          });
        } catch (error) {
          if (
            error instanceof
            ClientSelfRegistrationError
          ) {
            return reply
              .status(
                error.statusCode,
              )
              .send({
                message:
                  error.message,
              });
          }

          throw error;
        }
      },
    );
  };