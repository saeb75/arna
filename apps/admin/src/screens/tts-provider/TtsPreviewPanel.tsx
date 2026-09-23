"use client";

import type { TtsProvider } from "@glotmate/contracts";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsController } from "@/controllers/SettingsController";
import { formatMs } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

const DEFAULT_PREVIEW_TEXT = "What have you been doing lately?";
const DEFAULT_PREVIEW_L1_LANGUAGE = "tr";

/**
 * Önizleme: taslaktaki ses/modelle, kaydetmeden. Ders akışını taklit eder: ana
 * dilde giriş (opsiyonel) + İngilizce hedef cümle → tek-klip yeteneği görülür.
 * Metinler YEREL state (sunum); klipler store'dan SIRAYLA çalınır — ders
 * istemcisiyle aynı zincir. Ekranın tek DOM yan etkisi budur.
 */
export function TtsPreviewPanel({ provider }: { provider: TtsProvider }) {
  const data = useSettingsStore((s) => s.data);
  const draft = useSettingsStore((s) => s.draft);
  const previewing = useSettingsStore((s) => s.previewing);
  const preview = useSettingsStore((s) => s.preview);
  const [text, setText] = useState(DEFAULT_PREVIEW_TEXT);
  const [l1Text, setL1Text] = useState("");
  const [l1Language, setL1Language] = useState(DEFAULT_PREVIEW_L1_LANGUAGE);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!preview || preview.provider !== provider) return;
    audioRef.current?.pause();
    let index = 0;
    const playNext = () => {
      const clip = preview.clips[index++];
      if (!clip) return;
      const audio = new Audio(`data:audio/mpeg;base64,${clip.audioBase64}`);
      audioRef.current = audio;
      audio.onended = playNext;
      audio.onerror = playNext;
      void audio.play().catch(() => undefined); // otomatik çalma engeli: toast zaten sonucu söyledi
    };
    playNext();
    return () => audioRef.current?.pause();
  }, [preview, provider]);

  if (!data || !draft) return null;
  const configured = data.configured[provider];
  const hasVoice = Boolean(draft[provider].voiceId ?? data.defaultVoiceId[provider]);
  const canPreview = configured && hasVoice && text.trim().length > 0 && previewing === null;
  const last = preview?.provider === provider ? preview : null;

  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Preview</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Synthesizes with the draft voice/model without saving (cache bypassed). Add a native-language sentence to test
            mixed-language output.
          </p>
        </div>
        <Button size="sm" onClick={() => void SettingsController.preview(provider, { text, l1Text, l1Language })} disabled={!canPreview}>
          <Play data-icon="inline-start" className={previewing === provider ? "animate-pulse" : undefined} />
          {previewing === provider ? "Synthesizing…" : "Preview"}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_7rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preview-text">English sentence</Label>
          <Input id="preview-text" value={text} onChange={(e) => setText(e.target.value.slice(0, 300))} placeholder={DEFAULT_PREVIEW_TEXT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preview-l1">Native-language sentence (optional)</Label>
          <Input
            id="preview-l1"
            value={l1Text}
            onChange={(e) => setL1Text(e.target.value.slice(0, 300))}
            placeholder="Spoken before the English sentence"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preview-lang">Language</Label>
          <Input
            id="preview-lang"
            value={l1Language}
            onChange={(e) => setL1Language(e.target.value.trim().slice(0, 12))}
            placeholder="tr"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {!configured && <p className="mt-3 text-xs text-muted-foreground">No API key in .env — preview is unavailable for this provider.</p>}
      {!hasVoice && configured && <p className="mt-3 text-xs text-muted-foreground">Enter a voice first.</p>}
      {last && (
        <p className="mt-3 text-xs text-muted-foreground">
          Last preview: {last.clips.length} clip{last.clips.length === 1 ? "" : "s"} · {formatMs(last.latencyMs)}
          {last.clips.every((c) => c.hasAlignment) ? " · lip-sync timestamps" : " · no timestamps"}
        </p>
      )}
    </section>
  );
}
