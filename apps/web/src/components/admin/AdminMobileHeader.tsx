"use client";

import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileHeader() {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E5DED1] bg-[#FFFDF8]/95 px-4 backdrop-blur lg:hidden sm:px-6">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#73776D]">
                    Administração
                </p>

                <p className="text-sm font-semibold text-[#20241D]">
                    Priscila Barbosa
                </p>
            </div>

            <Sheet>
                <SheetTrigger
                    render={
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Abrir menu"
                            className="border-[#E5DED1] bg-white"
                        />
                    }
                >
                    <Menu className="size-5" />
                </SheetTrigger>

                <SheetContent
                    side="left"
                    className="w-[85vw] max-w-[320px] border-0 bg-[#24351F] p-0"
                >
                    <SheetTitle className="sr-only">
                        Menu administrativo
                    </SheetTitle>

                    <AdminSidebar />
                </SheetContent>
            </Sheet>
        </header>
    );
}