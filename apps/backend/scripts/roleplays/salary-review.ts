import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * İŞ — Yıllık değerlendirmede maaş pazarlığı.
 *
 * Getirdiği dil problemi: PAZARLIK — somut rakam koymak (anchoring), kanıtla
 * gerekçelendirmek, "bütçe sabit" itirazına maaş dışı kalemlerle takas önermek.
 * Üst seviye politikası belirsizliği bırakır: rakam söylenmezse yönetici en
 * düşüğü anlar — sonuç ısırır.
 *
 * Bütçe tavanı (yüzde üç) sahnede DEĞİL, yalnız ipucunda: sahne öğrenciye de
 * gösteriliyor, persona'nın kartını önceden açmak pazarlığı öldürür.
 */
export const SALARY_REVIEW: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-salary-review",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "The Number on the Table",
    category: "Work",
    persona: {
      name: "Elena Petrova",
      role: "head of department at a mid-size company, holding your annual review",
      goal: "keep your pay rise within a tight budget without losing you to a competitor",
      mood: "warm, guarded",
    },
    scene:
      "Your annual review in a glass-walled office. This year you led a project that saved the company a lot of money, and you trained two new team members. You know similar roles elsewhere pay noticeably more. Word is that budgets are tight.",
    opening: "Thanks for coming in. Before we get into it — how do you feel this year has gone?",
    objectives: [
      {
        id: "present-achievements",
        label: "Describe your key achievements with specifics",
        activeFrom: "C1",
        openingHint: "Ask what they see as their biggest contribution this year.",
      },
      {
        id: "name-figure",
        label: "Name a specific salary figure",
        activeFrom: "C1",
        openingHint: "Ask what they had in mind, without offering a number first.",
      },
      {
        id: "cite-market",
        label: "Back up your request with market evidence",
        activeFrom: "C1",
        openingHint: "Say the request sounds high compared with others in the team.",
      },
      {
        id: "answer-budget",
        label: "Respond to the fixed-budget objection",
        activeFrom: "C1",
        openingHint: "Say the budget for rises this year is fixed at three percent.",
      },
      {
        id: "propose-trade",
        label: "Propose something other than salary",
        activeFrom: "C1",
        openingHint: "Say you wish you could do more, but your hands are tied on base pay.",
      },
      {
        id: "ask-review-date",
        label: "Ask for a firm date to revisit the decision",
        activeFrom: "C2",
        openingHint: "Suggest picking this up again at some point next year.",
      },
    ],
    complications: [
      {
        id: "other-offer",
        text: "Ask whether they have another offer, and probe how serious it is.",
        activeFrom: "C1",
      },
      {
        id: "title-instead",
        text: "Offer a grander job title instead of more money, and present it as a big step up.",
        activeFrom: "C2",
      },
    ],
    supportedFrom: "C1",
    recommendedFrom: "C1",
  },
};
