"use client";

import {
    Mail,
    Phone,
    UserRound,
} from "lucide-react";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function ClientProfilePage() {
    const {
        user,
        appUser,
        clientLink,
    } = useAuth();

    const client =
        clientLink?.client;

    const name =
        client?.name ??
        appUser?.displayName ??
        user?.displayName ??
        "Cliente";

    const email =
        client?.email ??
        user?.email ??
        "Não informado";

    const phone =
        client?.phone ??
        "Não informado";

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-[#7A8075]">
                    Sua conta
                </p>

                <h1 className="mt-1 text-2xl font-bold text-[#263620] sm:text-3xl">
                    Perfil
                </h1>

                <p className="mt-2 text-sm text-[#71776D]">
                    Confira seus dados
                    cadastrados.
                </p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-4 border-b border-[#EEEAE1] pb-6">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#304229] text-white">
                        <UserRound className="size-6" />
                    </div>

                    <div>
                        <p className="font-semibold text-[#263620]">
                            {name}
                        </p>

                        <p className="mt-1 text-sm text-[#7A8075]">
                            Cliente
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-5">
                    <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 size-5 text-[#7A8075]" />

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                                E-mail
                            </p>

                            <p className="mt-1 break-all text-sm font-medium text-[#394035]">
                                {email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 size-5 text-[#7A8075]" />

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                                WhatsApp
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#394035]">
                                {phone}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}