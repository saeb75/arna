"use client";

import { Play } from "lucide-react";
import { ClipPlayer } from "@/components/shared/ClipPlayer";
import { Button } from "@/components/ui/button";
import { TutorsController } from "@/controllers/TutorsController";
import { formatMs } from "@/lib/labels";
import { isValidTutorName } from "@/lib/tutorDraft";
import { useTutorsStore } from "@/stores/useTutorsStore";

/**
 * "Play sample": kullanıcının duyacağı tanıtım cümlesi, formdaki ad ve sesle, kaydetmeden.
 * Cümle sunucudan gelir (panel kopyalamaz); klipler `ClipPlayer` ile çalınır.
 */
export function TutorSampleRow() {
  const editor = useTutorsStore((s) => s.editor);
  const tts = useTutorsStore((s) => s.tts);
  const sampling = useTutorsStore((s) => s.sampling);
  const sample = useTutorsStore((s) => s.sample);
  if (!editor || !tts) return null;
  const { form } = editor;

  const configured = tts.configured[form.provider];
  const hasVoice = form.voiceId.trim().length > 0;
  const nameOk = isValidTutorName(form.name);
  const blocker = !configured
    ? "This provider has no API key in .env."
    : !hasVoice
      ? "Enter a voice first."
      : !nameOk
        ? "Enter a valid name first — the sample introduces the tutor by name."
        : null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
      <Button size="sm" variant="outline" onClick={() => void TutorsController.playSample()} disabled={blocker !== null || sampling}>
        <Play data-icon="inline-start" className={sampling ? "animate-pulse" : undefined} />
        {sampling ? "Synthesizing…" : "Play sample"}
      </Button>
      <p className="min-w-0 flex-1 text-xs text-muted-foreground">
        {blocker ??
          (sample ? (
            <>
              <span className="text-foreground">“{sample.text}”</span> · {formatMs(sample.latencyMs)}
            </>
          ) : (
            "The sentence users hear when they preview this tutor, with the selected voice. Nothing is saved."
          ))}
      </p>
      {sample && <ClipPlayer clips={sample.clips} playKey={sample.at} />}
    </div>
  );
}
