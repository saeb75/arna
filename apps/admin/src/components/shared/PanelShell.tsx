"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/shared/Sidebar";

/** Yetkili alanın kabuğu: sol sidebar + içerik. Stil burada, rota dosyasında değil. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
