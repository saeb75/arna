import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * EV — Kiralık daire gezmek.
 *
 * Getirdiği dil problemi: SORU KURMA. "Are bills included?", "How much is the
 * deposit?", "When can I move in?" — emlakçı yalnız iyi şeyleri anlatır, bilgi
 * ANCAK SORULURSA gelir. Hedefler sorudur, cevabı almak değil; B1'de gözüne
 * batanı söylemek, B2'de fiyat teklifi.
 */
export const FLAT_VIEWING: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-flat-viewing",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Two Bedrooms Above the Bakery",
    category: "Housing",
    persona: {
      name: "Owen Clarke",
      role: "a letting agent showing the flat to several people today",
      goal: "find a tenant today, talking only about the good points unless you ask",
      mood: "upbeat, salesy",
    },
    scene:
      "A second-floor flat above a bakery on a busy street. It is bright, with two bedrooms and a new kitchen. Another couple is waiting downstairs for the next viewing. The advert did not say whether bills are included.",
    opening: "Hi, come on in! Lovely and bright, isn't it?",
    objectives: [
      {
        id: "ask-rent",
        label: "Ask about the rent and the deposit",
        activeFrom: "A2",
        openingHint: "Say the price is very good for the area, without giving any numbers.",
      },
      {
        id: "ask-bills",
        label: "Ask whether bills are included",
        activeFrom: "A2",
        openingHint: "Mention the heating is new and very efficient.",
      },
      {
        id: "ask-move-in",
        label: "Ask when you can move in",
        activeFrom: "A2",
        openingHint: "Say the current tenant is leaving soon, without saying when.",
      },
      {
        id: "point-out-problem",
        label: "Point out a problem you noticed",
        activeFrom: "B1",
        openingHint: "Show the main bedroom and say, as a nice detail, that the bakery starts baking at four a.m.",
      },
      {
        id: "make-offer",
        label: "Make an offer below the asking rent",
        activeFrom: "B2",
        openingHint: "Say the landlord is open to sensible offers from good tenants.",
      },
    ],
    complications: [
      {
        id: "other-offer",
        text: "Another person has already made an offer. Mention it to add pressure.",
        activeFrom: "B1",
      },
      {
        id: "advance-rent",
        text: "The landlord wants six months' rent in advance. Present it as completely normal.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "B1",
  },
};
