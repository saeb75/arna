import Image from "next/image";
import Link from "next/link";
import { MessagesSquare, Route, Theater } from "lucide-react";

import icon from "@/assets/icon.png";
import { siteConfig } from "@/lib/site";
import { delay } from "@/lib/utils";

const points = [
  {
    icon: MessagesSquare,
    title: "Talk, don't memorize",
    text: "Your tutor asks, listens and answers. You learn by saying things out loud.",
  },
  {
    icon: Theater,
    title: "Rehearse real life",
    text: "Order at a caf\u00e9, check in at a hotel, handle a job interview before it happens.",
  },
  {
    icon: Route,
    title: "A path at your level",
    text: "Short daily lessons from A1 to C2, with feedback on what you actually said.",
  },
];

export default function Home() {
  return (
    <section className="relative">
      <div aria-hidden className="screen-glow absolute inset-x-0 -top-16 -z-10 h-130" />
      <div className="mx-auto w-full max-w-3xl px-4 pt-16 pb-24 text-center sm:px-6 sm:pt-24">
        <Image
          src={icon}
          alt=""
          width={88}
          height={88}
          priority
          className="enter mx-auto size-[88px] rounded-[24px] shadow-[0_18px_40px_-14px_rgb(229_72_74/0.7)]"
        />
        <h1
          className="enter mt-8 text-5xl leading-[1.02] font-extrabold tracking-[-0.03em] text-balance sm:text-6xl"
          style={delay(60)}
        >
          {siteConfig.tagline}
        </h1>
        <p
          className="enter mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground"
          style={delay(120)}
        >
          {siteConfig.description}
        </p>

        <ul className="mt-12 grid gap-3 text-left sm:grid-cols-3">
          {points.map((p, i) => (
            <li key={p.title} className="enter rounded-3xl border bg-card p-5 shadow-soft" style={delay(200 + i * 60)}>
              <span className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                <p.icon className="size-5" />
              </span>
              <p className="mt-4 font-extrabold">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>

        <p className="enter mt-10 text-sm text-muted-foreground" style={delay(420)}>
          <Link href="/privacy" className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
            Privacy Policy
          </Link>
          {" \u00b7 "}
          <Link href="/terms" className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
            Terms &amp; Conditions
          </Link>
          {" \u00b7 "}
          <Link href="/delete-account" className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand">
            Delete account
          </Link>
        </p>
      </div>
    </section>
  );
}
