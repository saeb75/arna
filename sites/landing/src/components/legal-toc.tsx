"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Item = { id: string; text: string };

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The sections of a legal page, beside it on wide screens, with the one being read lit. Built from the page's own
 * headings, so the documents themselves stay exactly as written.
 */
export function LegalToc({ contentId }: { contentId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>(`#${contentId} h2`));
    for (const h of headings) if (!h.id) h.id = slug(h.textContent ?? "");
    // The headings exist only in the rendered page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(headings.map((h) => ({ id: h.id, text: h.textContent ?? "" })));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [contentId]);

  return (
    <aside className="hidden lg:block">
      {items.length ? (
        <nav aria-label="On this page" className="enter-fade sticky top-24">
          <p className="mb-3 px-3 text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
            On this page
          </p>
          <ul className="max-h-[calc(100vh-9rem)] space-y-0.5 overflow-y-auto pr-2">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "block rounded-xl px-3 py-1.5 text-sm leading-snug font-semibold transition-colors",
                    active === item.id
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}
