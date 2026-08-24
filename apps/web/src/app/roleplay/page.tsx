"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { SectionTabs } from "@/components/SectionTabs";

/**
 * ROLEPLAY LİSTESİ. `willPlayAt` SUNUCUDAN gelir (saf fonksiyon kararı) —
 * istemci seviye hesaplamaz. Hiçbir senaryo kilitli değildir; taban seviyenin
 * altındaki kullanıcıya yalnız "şu zorlukta oynanır" notu gösterilir.
 */
interface RoleplayRow {
  slug: string;
  title: string;
  category: string;
  scene: string;
  personaName: string;
  recommendedFrom: string;
  objectiveCount: number;
  willPlayAt: string;
  raised: boolean;
}

export default function RoleplayListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RoleplayRow[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api<{ roleplays: RoleplayRow[] }>("/v1/roleplays");
        setRows(res.roleplays);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) router.replace("/onboarding");
        else toast.error("Roleplay listesi yüklenemedi");
      }
    })();
  }, [router]);

  if (!rows) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
        <SectionTabs />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </main>
    );
  }

  const byCategory = new Map<string, RoleplayRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <SectionTabs />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Roleplay</h1>
        <p className="text-sm text-muted-foreground">
          Gerçek bir durumda konuş. Hedefler konuşurken canlı işaretlenir; bitiren yalnız sensin.
        </p>
      </header>

      {[...byCategory.entries()].map(([category, list]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{category}</h2>
          {list.map((r) => (
            <Link key={r.slug} href={`/roleplay/${r.slug}`} className="block">
              <Card className="transition hover:border-primary/50">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.title}</span>
                      <Badge variant="outline" className="text-xs">{r.recommendedFrom}+</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{r.scene}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.personaName} ile · {r.objectiveCount} hedef
                      {r.raised && (
                        <span className="ml-2 text-amber-500">
                          {r.willPlayAt} zorluğunda oynanır
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      ))}
    </main>
  );
}
