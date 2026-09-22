import type { LessonCore } from "@glotmate/contracts";

/**
 * İnceleme dökümü düzeni (review-dump.ts): iddialar + örnekler + alıştırmalar +
 * cevaplar. Okurken sorulacak tek soru: "bu iddialar doğru mu, seviyeye uygun mu?"
 * Taslaktan canlı — operatör yazdığını anında okur.
 */
export function CorePreview({ core }: { core: LessonCore }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <p className="text-xs text-muted-foreground">Topic · Focus</p>
        <p className="font-medium">{core.topic}</p>
        <p className="text-muted-foreground">{core.focus}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Objectives</p>
        <ul className="list-disc pl-5">
          {core.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>

      <ol className="flex flex-col gap-3">
        {core.lecture.beats.map((b, i) => (
          <li key={b.id} className="rounded-lg border border-border/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">{i + 1}. {b.kind}</span>
              {"format" in b && <span className="rounded bg-muted px-1.5 font-mono">{b.format}</span>}
            </div>

            {b.kind === "say" && <p className="italic text-muted-foreground">intent: {b.intent}</p>}
            {b.kind === "ask" && (
              <p className="italic text-muted-foreground">
                intent ({b.purpose}): {b.intent}
              </p>
            )}
            {b.kind === "teach" && (
              <div className="flex flex-col gap-2">
                <p className="italic text-muted-foreground">intro: {b.introIntent}</p>
                {b.points.map((p) => (
                  <div key={p.id} className="rounded-md bg-muted/40 p-2">
                    <p className="font-medium">{p.formEn}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {p.claimsEn.map((c, k) => (
                        <li key={k}>{c}</li>
                      ))}
                    </ul>
                    <ul className="mt-1 pl-5 text-muted-foreground">
                      {p.examples.map((ex) => (
                        <li key={ex.id} className="italic">— {ex.textEn}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {b.kind === "exercise" && (
              <div>
                <p>{b.item}</p>
                {b.options && (
                  <ol className="mt-1 list-[upper-alpha] pl-6 text-muted-foreground">
                    {b.options.map((o, k) => (
                      <li key={k} className={b.answerSpec.kind === "choice" && b.answerSpec.correctIndex === k ? "font-medium text-foreground" : undefined}>
                        {o}
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  answer →{" "}
                  {b.answerSpec.kind === "choice"
                    ? b.options?.[b.answerSpec.correctIndex] ?? `#${b.answerSpec.correctIndex}`
                    : b.answerSpec.accepted.join(" / ")}
                </p>
              </div>
            )}
            {b.kind === "open_response" && (
              <div>
                <p>{b.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  rubric: {b.rubric.criteria} · must use: {b.rubric.mustUse.join(", ")} · example: <em>{b.exampleAnswer}</em>
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>

      <div>
        <p className="text-xs text-muted-foreground">Role-play target</p>
        <p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{core.practice.mustUse.join(" · ")}</code>{" "}
          <span className="text-muted-foreground">× {core.practice.minTargetUses}, max {core.practice.maxTurns} turns</span>
        </p>
        <p className="text-muted-foreground">{core.practice.successCriteria}</p>
      </div>

      {core.quiz && core.quiz.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground">Unit test items ({core.quiz.length}) — not shown in lessons</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {core.quiz.map((q) => (
              <li key={q.id}>{q.type === "mcq" ? `${q.stem} → ${q.options[q.correctIndex]}` : `${q.text} → ${q.answers.map((a) => a[0]).join(", ")}`}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground">Summary</p>
        <p>{core.summary}</p>
      </div>
    </div>
  );
}
