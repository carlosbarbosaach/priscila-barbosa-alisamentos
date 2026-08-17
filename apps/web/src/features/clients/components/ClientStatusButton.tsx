"use client";

import type { Client } from "@priscila/shared";

import {
    CircleCheck,
    CircleOff,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useUpdateClientStatus } from "@/features/clients/hooks/useUpdateClientStatus";

type ClientStatusButtonProps = {
    client: Client;
};

export function ClientStatusButton({
    client,
}: ClientStatusButtonProps) {
    const updateStatus =
        useUpdateClientStatus();

    async function handleStatusChange() {
        try {
            await updateStatus.mutateAsync({
                clientId: client.id,
                active: !client.active,
            });
        } catch (error) {
            console.error(
                "Erro ao atualizar status da cliente:",
                error,
            );
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
                updateStatus.isPending
            }
            onClick={() =>
                void handleStatusChange()
            }
            className={
                client.active
                    ? "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    : "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            }
        >
            {updateStatus.isPending ? (
                <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Alterando...
                </>
            ) : client.active ? (
                <>
                    <CircleOff className="mr-2 size-4" />
                    Desativar
                </>
            ) : (
                <>
                    <CircleCheck className="mr-2 size-4" />
                    Ativar
                </>
            )}
        </Button>
    );
}