"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CEFR_LEVELS,
  INTEREST_AREAS,
  TRACKS,
  type CefrLevel,
  type Interest,
  type Track,
  type TutorLanguage,
} from "@arna/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api, DEFAULT_NATIVE_LANGUAGE } from "@/lib/api";
import { INTEREST_LABELS, LEVEL_LABELS, TRACK_LABELS } from "@/lib/labels";

const GOALS = [5, 10, 15] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [goal, setGoal] = useState<(typeof GOALS)[number]>(10);
  const [track, setTrack] = useState<Track>("everyday");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [occupation, setOccupation] = useState("");
  const [level, setLevel] = useState<CefrLevel | "">("");
  const [tutorLanguage, setTutorLanguage] = useState<TutorLanguage>("native");
  const [generating, setGenerating] = useState(false);

  async function submit() {
    if (!displayName.trim()) return toast.error("Adını yaz");
    if (interests.length === 0) return toast.error("En az bir ilgi alanı seç");
    if (!level) return toast.error("Seviyeni seç");

    // Müfredat sabit katalogdan geldiği için burada LLM beklemesi YOK; eskiden
    // 20-60 sn süren plan üretimini örtmek için sahte bir ilerleme çubuğu vardı.
    setGenerating(true);
    try {
      await api("/v1/onboarding", {
        method: "POST",
        body: JSON.stringify({
          displayName: displayName.trim(),
          nativeLanguage: DEFAULT_NATIVE_LANGUAGE,
          dailyGoalMinutes: goal,
          track,
          interests,
          occupation: occupation.trim() || undefined,
          cefrLevel: level,
          tutorLanguage,
        }),
      });
      router.replace("/lessons");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Profilin kaydedilemedi");
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <main className="flex h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Hazırlanıyor…</CardTitle>
            <CardDescription>Derslerin birazdan karşında.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 pb-16">
      <header className="py-8 text-center">
        <h1 className="text-3xl font-bold">Hoş geldin! 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Birkaç soruyla sana özel bir İngilizce programı hazırlayalım
        </p>
      </header>

      <div className="grid gap-8">
        <section className="grid gap-2">
          <Label htmlFor="name">Adın</Label>
          <Input
            id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Öğretmenin sana böyle seslenecek" maxLength={60}
          />
        </section>

        <section className="grid gap-3">
          <Label>Günlük hedefin</Label>
          <div className="grid grid-cols-3 gap-3">
            {GOALS.map((g) => (
              <button
                key={g} type="button" onClick={() => setGoal(g)}
                className={`rounded-xl border p-4 text-center transition ${
                  goal === g ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="text-2xl font-bold">{g} dk</div>
                <div className="text-xs text-muted-foreground">
                  {g === 5 ? "Rahat" : g === 10 ? "Düzenli" : "Ciddi"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <Label>İngilizceyi en çok nerede kullanacaksın?</Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((t) => (
              <button
                key={t} type="button" onClick={() => setTrack(t)}
                className={`rounded-xl border p-4 text-left transition ${
                  track === t ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="font-semibold">{TRACK_LABELS[t].title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{TRACK_LABELS[t].desc}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <Label>İlgi alanların <span className="text-muted-foreground">(1-8 arası seç)</span></Label>
          <ToggleGroup
            multiple value={interests} variant="outline" spacing={2} size="sm"
            onValueChange={(v) => v.length <= 8 && setInterests(v as Interest[])}
            className="flex flex-wrap justify-start"
          >
            {INTEREST_AREAS.map((i) => (
              <ToggleGroupItem key={i} value={i} className="rounded-full px-4">
                {INTEREST_LABELS[i]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="grid gap-2">
          <Label htmlFor="occupation">
            Mesleğin <span className="text-muted-foreground">(isteğe bağlı)</span>
          </Label>
          <Input
            id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}
            placeholder="ör. yazılım geliştirici — öğretmenin sohbette bunu bilir"
            maxLength={120}
          />
        </section>

        <section className="grid gap-3">
          <Label>Öğretmenin nasıl anlatsın?</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button" onClick={() => setTutorLanguage("native")}
              className={`rounded-xl border p-4 text-left transition ${
                tutorLanguage === "native" ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="font-semibold">Kendi dilimde</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Açıklamalar senin dilinde, İngilizce örnekler İngilizce — yeni başlayanlar için ideal
              </div>
            </button>
            <button
              type="button" onClick={() => setTutorLanguage("english")}
              className={`rounded-xl border p-4 text-left transition ${
                tutorLanguage === "english" ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="font-semibold">Tamamen İngilizce</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Tam daldırma — her şey İngilizce (sonradan değiştirebilirsin)
              </div>
            </button>
          </div>
        </section>

        <section className="grid gap-2">
          <Label>İngilizce seviyen</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as CefrLevel)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seviyeni seç" />
            </SelectTrigger>
            <SelectContent>
              {CEFR_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <Button size="lg" onClick={submit} className="w-full">
          Programımı oluştur →
        </Button>
      </div>
    </main>
  );
}
