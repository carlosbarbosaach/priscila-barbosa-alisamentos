import {
  AdminAgendaPageContent,
} from "@/features/appointments/components/AdminAgendaPageContent";

type AdminAgendaPageProps = {
  searchParams: Promise<{
    date?: string | string[];
  }>;
};

export default async function AdminAgendaPage({
  searchParams,
}: AdminAgendaPageProps) {
  const params =
    await searchParams;

  const initialDateKey =
    typeof params.date === "string"
      ? params.date
      : undefined;

  return (
    <AdminAgendaPageContent
      initialDateKey={
        initialDateKey
      }
    />
  );
}