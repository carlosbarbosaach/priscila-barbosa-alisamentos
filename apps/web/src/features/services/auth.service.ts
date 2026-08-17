import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    reload,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    type UserCredential,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/auth";

const googleProvider =
    new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(
        firebaseAuth,
        googleProvider,
    );
}

export async function loginWithEmail(
    email: string,
    password: string,
): Promise<UserCredential> {
    return signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
    );
}

export async function registerWithEmail(
    name: string,
    email: string,
    password: string,
): Promise<UserCredential> {
    const credential =
        await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password,
        );

    await updateProfile(
        credential.user,
        {
            displayName:
                name.trim(),
        },
    );

    /*
     * Envia o e-mail de confirmação.
     *
     * A conta existe no Firebase,
     * porém ainda não será vinculada
     * automaticamente ao cadastro
     * administrativo enquanto
     * emailVerified = false.
     */
    await sendEmailVerification(
        credential.user,
    );

    /*
     * Atualiza o token depois da
     * alteração do displayName.
     */
    await credential.user.getIdToken(
        true,
    );

    return credential;
}

export async function resendVerificationEmail(): Promise<void> {
    const user =
        firebaseAuth.currentUser;

    if (!user) {
        throw new Error(
            "Usuário não autenticado.",
        );
    }

    if (user.emailVerified) {
        return;
    }

    await sendEmailVerification(
        user,
    );
}

export async function reloadAuthenticatedUser(): Promise<boolean> {
    const user =
        firebaseAuth.currentUser;

    if (!user) {
        throw new Error(
            "Usuário não autenticado.",
        );
    }

    /*
     * Busca o estado mais recente
     * da conta no Firebase.
     */
    await reload(user);

    /*
     * Força um novo ID Token.
     *
     * Isso é importante para que
     * o backend receba o novo
     * email_verified.
     */
    await user.getIdToken(
        true,
    );

    return user.emailVerified;
}

export async function resetPassword(
    email: string,
): Promise<void> {
    await sendPasswordResetEmail(
        firebaseAuth,
        email,
    );
}

export async function logout(): Promise<void> {
    await signOut(
        firebaseAuth,
    );
}