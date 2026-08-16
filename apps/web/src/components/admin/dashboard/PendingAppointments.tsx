import { Clock3 } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export type PendingAppointmentItem = {
    id: string;
    clientName: string;
    serviceName: string;
    dateLabel: string;
    timeLabel: string;
};

type PendingAppointmentsProps = {
    appointments: PendingAppointmentItem[];
};

export function PendingAppointments({
    appointments,
}: PendingAppointmentsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock3 className="size-5" />
                    Solicitações pendentes
                </CardTitle>
            </CardHeader>

            <CardContent>
                {appointments.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="font-medium">
                            Nenhuma solicitação pendente
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Novos pedidos de agendamento aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between gap-4 rounded-lg border p-4"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {appointment.clientName}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {appointment.serviceName}
                                    </p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-medium">
                                        {appointment.dateLabel}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {appointment.timeLabel}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}