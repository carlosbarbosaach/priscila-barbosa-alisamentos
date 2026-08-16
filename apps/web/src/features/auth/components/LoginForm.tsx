"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
    loginSchema,
    type LoginInput,
} from "../schemas/login.schema";
import {
    loginWithEmail,
    loginWithGoogle,
} from "../../services/auth.service";

export function LoginForm() {
    const [googleLoading, setGoogleLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function handleEmailLogin(data: LoginInput) {
        try {
            await loginWithEmail(
                data.email,
                data.password,
            );
        } catch {
            setError("root", {
                type: "server",
                message:
                    "Não foi possível entrar. Verifique seu e-mail e senha e tente novamente.",
            });
        }
    }

    async function handleGoogleLogin() {
        try {
            setGoogleLoading(true);

            await loginWithGoogle();
        } catch {
            setError("root", {
                type: "server",
                message:
                    "Não foi possível entrar com o Google. Tente novamente.",
            });
        } finally {
            setGoogleLoading(false);
        }
    }

    const isLoading =
        isSubmitting || googleLoading;

    return (
        <form
            onSubmit={handleSubmit(handleEmailLogin)}
            noValidate
            className="w-full"
        >
            <FieldGroup>
                <Field data-invalid={Boolean(errors.email)}>
                    <FieldLabel htmlFor="email">
                        E-mail
                    </FieldLabel>

                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seuemail@exemplo.com"
                        aria-invalid={Boolean(errors.email)}
                        disabled={isLoading}
                        {...register("email")}
                    />

                    {errors.email && (
                        <FieldError>
                            {errors.email.message}
                        </FieldError>
                    )}
                </Field>

                <Field data-invalid={Boolean(errors.password)}>
                    <FieldLabel htmlFor="password">
                        Senha
                    </FieldLabel>

                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Digite sua senha"
                        aria-invalid={Boolean(errors.password)}
                        disabled={isLoading}
                        {...register("password")}
                    />

                    {errors.password && (
                        <FieldError>
                            {errors.password.message}
                        </FieldError>
                    )}
                </Field>

                {errors.root && (
                    <FieldError>
                        {errors.root.message}
                    </FieldError>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isSubmitting
                        ? "Entrando..."
                        : "Entrar"}
                </Button>

                <FieldSeparator>
                    ou continue com
                </FieldSeparator>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                >
                    {googleLoading
                        ? "Conectando..."
                        : "Entrar com Google"}
                </Button>
            </FieldGroup>
        </form>
    );
}