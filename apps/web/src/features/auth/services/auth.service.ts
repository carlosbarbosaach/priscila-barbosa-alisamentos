import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    type UserCredential,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/auth";

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(firebaseAuth, googleProvider);
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
    email: string,
    password: string,
): Promise<UserCredential> {
    return createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
    );
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
    await signOut(firebaseAuth);
}