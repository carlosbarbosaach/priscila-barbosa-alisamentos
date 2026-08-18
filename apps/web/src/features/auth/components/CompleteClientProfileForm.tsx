"use client";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    useRouter,
} from "next/navigation";

import {
    useForm,
} from "react-hook-form";

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
    completeClientProfile,
} from "../auth.api";

import {
    useAuth,
} from "../hooks/useAuth";

import {
    completeClientProfileSchema,
    type CompleteClientProfileInput,
} from "../schemas/complete-client-profile.schema";

function formatPhone(
    value: string,
) {
    const digits =
        value
            .replace(
                /\D/g,
                "",
            )
            .slice(
                0,
                11,
            );

    if (
        digits.length <= 2
    ) {
        return digits.length
            ? `(${digits}`
            : "";
    }

    if (
        digits.length <= 6
    ) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(
            2,
        )}`;
    }

    if (
        digits.length <= 10
    ) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(
            2,
            6,
        )}-${digits.slice(
            6,
        )}`;
    }

    return `(${digits.slice(
        0,
        2,
    )}) ${digits.slice(
        2,
        7,
    )}-${digits.slice(
        7,
    )}`;
}

export function CompleteClientProfileForm() {
    const router =
        useRouter();

    const {
        user,
        appUser,
        refreshSession,
    } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        formState: {
            errors,
            isSubmitting,
        },
    } =
        useForm<CompleteClientProfileInput>(
            {
                resolver:
                    zodResolver(
                        completeClientProfileSchema,
                    ),

                defaultValues: {
                    name:
                        appUser?.displayName ??
                        user?.displayName ??
                        "",

                    phone: "",
                },
            },
        );

    async function handleCompleteProfile(
        data: CompleteClientProfileInput,
    ) {
        try {
            await completeClientProfile(
                {
                    name:
                        data.name,

                    phone:
                        data.phone,
                },
            );

            /*
             * Agora /auth/me encontrará
             * a cliente através do userId.
             */
            await refreshSession();

            router.replace(
                "/cliente",
            );
        } catch (error) {
            setError(
                "root",
                {
                    type:
                        "server",

                    message:
                        error instanceof
                            Error
                            ? error.message
                            : "Não foi possível concluir seu cadastro.",
                },
            );
        }
    }

    return (
        <form
            className="w-full"
            noValidate
            onSubmit={
                handleSubmit(
                    handleCompleteProfile,
                )
            }
        >
            <FieldGroup>
                <Field
                    data-invalid={Boolean(
                        errors.name,
                    )}
                >
                    <FieldLabel htmlFor="complete-name">
                        Nome completo
                    </FieldLabel>

                    <Input
                        id="complete-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Seu nome completo"
                        disabled={
                            isSubmitting
                        }
                        aria-invalid={Boolean(
                            errors.name,
                        )}
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
                        errors.phone,
                    )}
                >
                    <FieldLabel htmlFor="complete-phone">
                        WhatsApp
                    </FieldLabel>

                    <Input
                        id="complete-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(48) 99999-9999"
                        disabled={
                            isSubmitting
                        }
                        aria-invalid={Boolean(
                            errors.phone,
                        )}
                        {...register(
                            "phone",
                            {
                                onChange: (
                                    event,
                                ) => {
                                    setValue(
                                        "phone",
                                        formatPhone(
                                            event
                                                .target
                                                .value,
                                        ),
                                        {
                                            shouldValidate:
                                                true,
                                        },
                                    );
                                },
                            },
                        )}
                    />

                    {errors.phone && (
                        <FieldError>
                            {
                                errors
                                    .phone
                                    .message
                            }
                        </FieldError>
                    )}
                </Field>

                <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        E-mail da conta
                    </p>

                    <p className="mt-1 break-all text-sm font-medium">
                        {user?.email ??
                            "E-mail não disponível"}
                    </p>
                </div>

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
                        ? "Salvando..."
                        : "Concluir meu cadastro"}
                </Button>
            </FieldGroup>
        </form>
    );
}