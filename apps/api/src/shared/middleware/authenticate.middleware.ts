import type {
    FastifyReply,
    FastifyRequest,
} from "fastify";

import { firebaseAdminAuth } from "../firebase/firebase-auth.js";

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const authorization =
        request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        await reply.status(401).send({
            message: "Token de autenticação não informado.",
        });

        return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        await reply.status(401).send({
            message: "Token de autenticação inválido.",
        });

        return;
    }

    try {
        const decodedToken =
            await firebaseAdminAuth.verifyIdToken(token);

        request.authUser = decodedToken;
    } catch {
        await reply.status(401).send({
            message: "Token de autenticação inválido ou expirado.",
        });
    }
}