import type { AdminSessionRoleplay, AdminTranscriptTurn } from "@glotmate/contracts";

/**
 * Transkript işaretleri — saf, React'sız; `scripts/test-transcript.ts`.
 *
 * İki ayrı sayaç, ikisi de 0 tabanlı ve YALNIZ kendi fazının öğrenci turlarını sayar:
 *   · practice → `practiceHitTurns` (ders içi hedef yapı kullanıldı)
 *   · roleplay → `roleplay.hits[].turnIndex` (iletişim hedefi tiklendi)
 * Faz ayırıcıları da burada türetilir — render içinde dış değişken mutasyonu yok.
 */
export interface AnnotatedTurn {
  t: AdminTranscriptTurn;
  phaseChanged: boolean;
  /** İsabet etiketi ("target used" / "objective: Ask for a table"); isabet yoksa null */
  hit: string | null;
}

export function annotateTranscript(
  turns: AdminTranscriptTurn[],
  practiceHitTurns: number[],
  roleplay: Pick<AdminSessionRoleplay, "hits" | "objectives"> | null,
): AnnotatedTurn[] {
  const practiceHits = new Set(practiceHitTurns);
  const labels = new Map((roleplay?.objectives ?? []).map((o) => [o.id, o.label]));
  const roleplayHits = new Map<number, string[]>();
  for (const h of roleplay?.hits ?? []) {
    roleplayHits.set(h.turnIndex, [...(roleplayHits.get(h.turnIndex) ?? []), labels.get(h.objectiveId) ?? h.objectiveId]);
  }

  let lastPhase: string | null | undefined;
  let practiceIndex = -1;
  let roleplayIndex = -1;
  return turns.map((t) => {
    const phaseChanged = t.phase !== lastPhase;
    lastPhase = t.phase;
    let hit: string | null = null;
    if (t.role === "user" && t.phase === "practice") {
      practiceIndex++;
      if (practiceHits.has(practiceIndex)) hit = "target used";
    } else if (t.role === "user" && t.phase === "roleplay") {
      roleplayIndex++;
      const objectives = roleplayHits.get(roleplayIndex);
      if (objectives) hit = `objective: ${objectives.join(" · ")}`;
    }
    return { t, phaseChanged, hit };
  });
}
