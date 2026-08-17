"use client";

import {
    useState,
} from "react";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    useForm,
} from "react-hook-form";

import {
    Eye,
    EyeOff,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import {
    Input,
} from "@/components/ui/input";

import {
    registerSchema,
    type RegisterInput,
} from "../schemas/register.schema";

import {
    registerWithEmail,
} from "../../services/auth.service";

export function RegisterForm() {
    const [
        showPassword,
        setShowPassword,
    ] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] =
        useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterInput>({
        resolver:
            zodResolver(
                registerSchema,
            ),

        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function handleRegister(
        data: RegisterInput,
    ) {
        try {
            await registerWithEmail(
                data.name,
                data.email,
                data.password,
            );
        } catch (error) {
            console.error(
                "Erro ao criar conta:",
                error,
            );

            setError(
                "root",
                {
                    type: "server",

                    message:
                        "Não foi possível criar sua conta. Verifique os dados informados e tente novamente.",
                },
            );
        }
    }

    return (
        <form
            onSubmit={
                handleSubmit(
                    handleRegister,
                )
            }
            noValidate
            className="w-full"
        >
            <FieldGroup>
                <Field
                    data-invalid={Boolean(
                        errors.name,
                    )}
                >
                    <FieldLabel htmlFor="register-name">
                        Nome completo
                    </FieldLabel>

                    <Input
                        id="register-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Seu nome completo"
                        aria-invalid={Boolean(
                            errors.name,
                        )}
                        disabled={
                            isSubmitting
                        }
                        {...register(
                            "name",
                        )}
                    />

                    {errors.name && (
                        <FieldError>
                            {
                                errors
                                    .name
                                    .message
                            }
                        </FieldError>
                    )}
                </Field>

                <Field
                    data-invalid={Boolean(
                        errors.email,
                    )}
                >
                    <FieldLabel htmlFor="register-email">
                        E-mail
                    </FieldLabel>

                    <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        placeholder="seuemail@exemplo.com"
                        aria-invalid={Boolean(
                            errors.email,
                        )}
                        disabled={
                            isSubmitting
                        }
                        {...register(
                            "email",
                        )}
                    />

                    {errors.email && (
                        <FieldError>
                            {
                                errors
                                    .email
                                    .message
                            }
                        </FieldError>
                    )}
                </Field>

                <Field
                    data-invalid={Boolean(
                        errors.password,
                    )}
                >
                    <FieldLabel htmlFor="register-password">
                        Senha
                    </FieldLabel>

                    <div className="relative">
                        <Input
                            id="register-password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            autoComplete="new-password"
                            placeholder="Crie uma senha"
                            aria-invalid={Boolean(
                                errors.password,
                            )}
                            disabled={
                                isSubmitting
                            }
                            className="pr-11"
                            {...register(
                                "password",
                            )}
                        />

                        <button
                            type="button"
                            tabIndex={-1}
                            disabled={
                                isSubmitting
                            }
                            onClick={() =>
                                setShowPassword(
                                    (
                                        current,
                                    ) =>
                                        !current,
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                                showPassword
                                    ? "Ocultar senha"
                                    : "Mostrar senha"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <FieldError>
                            {
                                errors
                                    .password
                                    .message
                            }
                        </FieldError>
                    )}
                </Field>

                <Field
                    data-invalid={Boolean(
                        errors.confirmPassword,
                    )}
                >
                    <FieldLabel htmlFor="register-confirm-password">
                        Confirmar senha
                    </FieldLabel>

                    <div className="relative">
                        <Input
                            id="register-confirm-password"
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            autoComplete="new-password"
                            placeholder="Digite a senha novamente"
                            aria-invalid={Boolean(
                                errors.confirmPassword,
                            )}
                            disabled={
                                isSubmitting
                            }
                            className="pr-11"
                            {...register(
                                "confirmPassword",
                            )}
                        />

                        <button
                            type="button"
                            tabIndex={-1}
                            disabled={
                                isSubmitting
                            }
                            onClick={() =>
                                setShowConfirmPassword(
                                    (
                                        current,
                                    ) =>
                                        !current,
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                                showConfirmPassword
                                    ? "Ocultar confirmação de senha"
                                    : "Mostrar confirmação de senha"
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>

                    {errors.confirmPassword && (
                        <FieldError>
                            {
                                errors
                                    .confirmPassword
                                    .message
                            }
                        </FieldError>
                    )}
                </Field>

                {errors.root && (
                    <FieldError>
                        {
                            errors.root
                                .message
                        }
                    </FieldError>
                )}

                <Button
                    type="submit"
                    className="w-full bg-[#304229] text-white hover:bg-[#24351F]"
                    disabled={
                        isSubmitting
                    }
                >
                    {isSubmitting
                        ? "Criando conta..."
                        : "Criar minha conta"}
                </Button>
            </FieldGroup>
        </form>
    );
}