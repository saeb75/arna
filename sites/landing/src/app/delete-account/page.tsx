import type { Metadata } from "next";
import {
  Archive,
  Clock3,
  FileText,
  Mail,
  ShieldCheck,
  Trash2,
  UserRoundX,
} from "lucide-react";

import { siteConfig } from "@/lib/site";
import { delay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "Request the deletion of your GlotMate account and all associated data.",
};

const subject = encodeURIComponent("GlotMate — Account deletion request");
const body = encodeURIComponent(
  `Hi GlotMate team,

I would like to permanently delete my GlotMate account and all associated data.

Account email (the one I use to sign in):
How I signed in (email / Apple / guest):
Reason (optional):

Thank you.`,
);
const mailto = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;

const inAppSteps = [
  "Open GlotMate and go to the Profile tab.",
  "Scroll to the bottom and tap \u201cDelete account\u201d (Hesab\u0131 sil).",
  "Confirm. Your account and data are deleted right away.",
];

const steps = [
  {
    icon: Mail,
    title: "1. Email us",
    text: "Send the deletion request from your account email.",
  },
  {
    icon: ShieldCheck,
    title: "2. We confirm",
    text: "We verify the request belongs to you and reply.",
  },
  {
    icon: Clock3,
    title: "3. Deleted in 24 hours",
    text: "Your account and personal data are permanently removed.",
  },
];

export default function DeleteAccountPage() {
  return (
    <section className="relative">
      <div aria-hidden className="screen-glow absolute inset-x-0 -top-16 -z-10 h-130" />

      <div className="mx-auto w-full max-w-2xl px-4 pt-12 pb-24 sm:px-6 sm:pt-20">
        <header className="text-center">
          <span className="enter bg-brand-gradient mx-auto grid size-14 place-items-center rounded-[18px] text-white shadow-[0_14px_30px_-12px_rgb(229_72_74/0.7)]">
            <UserRoundX className="size-6" />
          </span>
          <p
            className="enter mt-6 text-xs font-extrabold tracking-[0.18em] text-brand uppercase"
            style={delay(40)}
          >
            Account
          </p>
          <h1
            className="enter mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl"
            style={delay(80)}
          >
            Delete your GlotMate account
          </h1>
          <p
            className="enter mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
            style={delay(140)}
          >
            We don&apos;t want to make this hard. You can delete your account
            yourself inside the app in a few seconds, or ask us by email and
            we&apos;ll take care of it.
          </p>
        </header>

        <div
          className="enter mt-10 rounded-[32px] border bg-card p-6 shadow-float sm:p-8"
          style={delay(200)}
        >
          <h2 className="text-xl font-extrabold tracking-tight">
            Delete it in the app
          </h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            The fastest way. Your account and data are removed immediately.
          </p>
          <ol className="mt-5 space-y-3 text-[15px] leading-relaxed">
            {inAppSteps.map((text, i) => (
              <li key={text} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-extrabold text-brand">
                  {i + 1}
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="enter mt-6 rounded-[32px] border bg-card p-6 shadow-float sm:p-8"
          style={delay(240)}
        >
          <h2 className="text-xl font-extrabold tracking-tight">
            Or send a deletion request
          </h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Email us from the address you use to sign in (or include it in the
            message), so we can confirm the request belongs to you.
          </p>

          <a
            href={mailto}
            className="sheen bg-brand-gradient mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-5 text-base font-bold text-white shadow-[0_12px_28px_-12px_rgb(229_72_74/0.85)] transition-opacity hover:opacity-95 active:opacity-80"
          >
            <Mail className="size-5" />
            <span className="truncate">Email {siteConfig.contactEmail}</span>
          </a>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The button opens your default email app with a pre-filled message.
            Guest accounts have no email: delete those in the app. If the
            button doesn&apos;t work, just copy{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            into your mail client.
          </p>
        </div>

        <ol className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="enter rounded-3xl border bg-card p-5 shadow-soft"
              style={delay(260 + i * 60)}
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                <s.icon className="size-5" />
              </span>
              <p className="mt-4 font-extrabold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <div
          className="enter mt-6 divide-y rounded-[28px] border bg-background text-[15px] leading-relaxed text-muted-foreground"
          style={delay(440)}
        >
          <div className="flex gap-4 p-5 sm:p-6">
            <Trash2 className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>
              <strong className="font-bold text-foreground">What gets deleted:</strong>{" "}
              your profile, lesson and role-play conversations, progress and
              streak, saved words, mistakes, and everything your tutor remembers
              about you. Backups are purged on a rolling cycle.
            </p>
          </div>
          <div className="flex gap-4 p-5 sm:p-6">
            <Archive className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>
              <strong className="font-bold text-foreground">What we may keep:</strong>{" "}
              a minimal record of the deletion request itself, and any data we are
              legally required to retain (for example, billing records if you
              ever made a purchase).
            </p>
          </div>
          <div className="flex gap-4 p-5 sm:p-6">
            <FileText className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>
              For details, see our{" "}
              <a
                href="/privacy"
                className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
