export const siteConfig = {
  // `name`, `copyrightHolder`, `effectiveDate` and the emails appear in the legal pages' text.
  name: "GlotMate",
  brand: "GlotMate",
  tagline: "Learn English by speaking.",
  description:
    "Learn English by talking with an AI tutor: short daily lessons at your level, real-life role plays, and feedback on what you say.",
  /** Set NEXT_PUBLIC_SITE_URL where the site is served from another address. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://glotmate.com",
  contactEmail: "saeb@imtiyaz.io",
  supportEmail: "saeb@imtiyaz.io",
  copyrightHolder: "GlotMate",
  effectiveDate: "November 14, 2026",
};

export type SiteConfig = typeof siteConfig;
