import Link from "next/link";
import { Mail } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";
import { siteConfig } from "@/lib/site";

const linkSections = [
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/delete-account", label: "Delete account" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Talk with an AI tutor, a few minutes a day: short lessons at your
              level and real-life role plays.
            </p>
          </div>

          {linkSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-semibold text-foreground/80 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.copyrightHolder}. All rights reserved.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="inline-flex items-center gap-2 font-semibold text-foreground/80 transition-colors hover:text-brand"
          >
            <Mail className="size-3.5" />
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
