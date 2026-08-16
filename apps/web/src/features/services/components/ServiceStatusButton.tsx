"use client";

import type { Service } from "@priscila/shared";

import {
    CircleCheck,
    CircleOff,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateServiceStatus } from "../hooks/useUpdateServiceStatus";


type ServiceStatusButtonProps = {
    service: Service;
};

export function ServiceStatusButton({
    service,
}: ServiceStatusButtonProps) {
    const updateStatus = useUpdateServiceStatus();

    async function handleStatusChange() {
        try {
            await updateStatus.mutateAsync({
                serviceId: service.id,
                active: !service.active,
            });
        } catch (error) {
            console.error(
                "Erro ao atualizar status do serviço:",
                error,
            );
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={updateStatus.isPending}
            onClick={() => void handleStatusChange()}
            className={
                service.active
                    ? "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    : "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            }
        >
            {updateStatus.isPending ? (
                <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Alterando...
                </>
            ) : service.active ? (
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