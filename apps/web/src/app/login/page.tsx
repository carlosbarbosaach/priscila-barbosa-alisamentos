import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <p className="text-sm font-medium tracking-wide text-muted-foreground">
                        PRISCILA BARBOSA
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold">
                        Acesse sua conta
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Entre para acompanhar e solicitar seus agendamentos.
                    </p>
                </div>

                <LoginForm />
            </div>
        </main>
    );
}