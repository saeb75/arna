import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * İŞ — Yöneticiden ek süre istemek.
 *
 * Getirdiği dil problemi: YUMUŞATMA (hedging) ve ALTERNATİF — "I was wondering
 * if...", "Would it help if I sent the first half on Friday?". Yalnız "daha fazla
 * zaman" istemek yetmez: yeni tarih ADLANDIRMAK ve kısmi çözüm ÖNERMEK ayrı
 * adımlar — belirsiz kalan talep belirsiz cevap alır.
 */
export const DEADLINE_EXTENSION: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-deadline-extension",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Friday Is Too Soon",
    category: "Work",
    persona: {
      name: "Ms. Lindqvist",
      role: "your line manager, who has promised the report to a director",
      goal: "get the report from you on time, or at least keep her own promise to the director",
      mood: "busy, sceptical",
    },
    scene:
      "A small meeting room on Wednesday afternoon. The quarterly report is due on Friday morning. A colleague has been off sick, and half of the data only arrived today. You asked your manager for ten minutes of her time.",
    opening: "You wanted a quick word — what's going on?",
    objectives: [
      {
        id: "explain-situation",
        label: "Explain why the report is behind",
        activeFrom: "B2",
        openingHint: "Ask how the report is coming along.",
      },
      {
        id: "ask-new-date",
        label: "Ask for more time and name a new date",
        activeFrom: "B2",
        openingHint: "Ask what they need from you, without offering any extra time.",
      },
      {
        id: "offer-partial",
        label: "Offer a partial or alternative solution",
        activeFrom: "B2",
        openingHint: "Say the director really needs something in hand on Friday.",
      },
      {
        id: "answer-doubt",
        label: "Answer the manager's doubt calmly",
        activeFrom: "B2",
        openingHint: "Ask, a little sharply, why this was not raised last week.",
      },
      {
        id: "suggest-change",
        label: "Suggest a change so this does not happen again",
        activeFrom: "C1",
        openingHint: "Wonder aloud whether the same thing will happen next quarter.",
      },
    ],
    complications: [
      {
        id: "promised-director",
        text: "The director has already been promised Friday. Say you cannot move it without a very good reason.",
        activeFrom: "B2",
      },
      {
        id: "hand-over",
        text: "Suggest giving the report to another colleague to finish, which would look bad for them.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B2",
    recommendedFrom: "B2",
  },
};
