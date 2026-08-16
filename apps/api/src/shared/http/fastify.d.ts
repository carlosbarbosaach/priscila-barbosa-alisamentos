import type { DecodedIdToken } from "firebase-admin/auth";

declare module "fastify" {
  interface FastifyRequest {
    authUser: DecodedIdToken | null;
  }
}