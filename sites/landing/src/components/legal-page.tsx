import { ReactNode } from "react";
import { CalendarDays, ScrollText } from "lucide-react";

import { LegalToc } from "@/components/legal-toc";
import { delay } from "@/lib/utils";

const CONTENT_ID = "legal-content";

export function LegalPage({
  title,
  intro,
  effectiveDate,
  children,
}: {
  title: string;
  intro?: string;
  effectiveDate?: string;
  children: ReactNode;
}) {
  return (
    <article className="relative">
      <div aria-hidden className="screen-glow absolute inset-x-0 -top-16 -z-10 h-130" />

      <header className="mx-auto w-full max-w-3xl px-4 pt-12 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16">
        <span className="enter bg-brand-gradient mx-auto grid size-14 place-items-center rounded-[18px] text-white shadow-[0_14px_30px_-12px_rgb(229_72_74/0.7)]">
          <ScrollText className="size-6" />
        </span>
        <h1
          className="enter mt-6 text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl"
          style={delay(60)}
        >
          {title}
        </h1>
        {effectiveDate ? (
          <p
            className="enter mt-5 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-semibold text-muted-foreground shadow-soft"
            style={delay(120)}
          >
            <CalendarDays className="size-4 text-brand" />
            Effective date: {effectiveDate}
          </p>
        ) : null}
        {intro ? (
          <p
            className="enter mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground"
            style={delay(180)}
          >
            {intro}
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
        <LegalToc contentId={CONTENT_ID} />
        <div
          className="enter rounded-[32px] border bg-card p-6 shadow-soft sm:p-10 lg:p-12"
          style={delay(240)}
        >
          <div id={CONTENT_ID} className="legal-content">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}
