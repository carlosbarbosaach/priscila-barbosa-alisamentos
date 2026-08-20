import {
    AdminPageHeader,
} from "@/components/admin/AdminPageHeader";

type DashboardHeaderProps = {
    title?: string;

    description?: string;
};

export function DashboardHeader({
    title = "Visão geral",
    description = "Acompanhe os agendamentos e a rotina do salão.",
}: DashboardHeaderProps) {
    return (
        <AdminPageHeader
            eyebrow="Dashboard"
            title={title}
            description={description}
        />
    );
}