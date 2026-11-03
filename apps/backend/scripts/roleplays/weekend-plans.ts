import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SOSYAL — Hafta sonu planı yapmak.
 *
 * Getirdiği dil problemi: ÖNERİ ve KARŞI ÖNERİ — "How about...?", "Why don't
 * we...?", "I'd rather...". Hedefler bilinçli olarak OLUMLU ADIM: "Leo'nun
 * fikrine hayır de" yerine "başka bir fikir öner" — dedektör ret/negasyonu
 * tamamlanmış adım saymıyor, karşı öneri ise kendi başına bir edim.
 */
export const WEEKEND_PLANS: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-weekend-plans",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Free This Saturday?",
    category: "Social",
    persona: {
      name: "Leo",
      role: "a friend from your evening class",
      goal: "make a plan with you for the weekend that you will both enjoy",
      mood: "relaxed, keen",
    },
    scene:
      "You and Leo are walking out of your evening class on a Thursday. The weather is going to be sunny all weekend. Leo really wants to do something together but has not decided what.",
    opening: "Hey, are you doing anything this weekend?",
    objectives: [
      {
        id: "suggest-activity",
        label: "Suggest something to do together",
        activeFrom: "A2",
        openingHint: "Say you are free on Saturday and ask what they fancy: a film, a walk, or the market.",
      },
      {
        id: "suggest-time-place",
        label: "Suggest a time and a place to meet",
        activeFrom: "A2",
        openingHint: "Like the idea, then ask when and where to meet.",
      },
      {
        id: "counter-idea",
        label: "Offer a different idea instead of one of Leo's",
        activeFrom: "A2",
        openingHint: "Suggest going for a run together at six in the morning.",
      },
      {
        id: "give-reason",
        label: "Explain why you prefer one plan",
        activeFrom: "B1",
        openingHint: "Ask why they like that idea better.",
      },
      {
        id: "invite-others",
        label: "Suggest inviting someone else along",
        activeFrom: "B2",
        openingHint: "Mention that a few others from class were also asking about the weekend.",
      },
    ],
    complications: [
      {
        id: "family-lunch",
        text: "Remember halfway through that you have a family lunch on Saturday, and ask to move the plan to Sunday.",
        activeFrom: "B1",
      },
      {
        id: "noncommittal",
        text: "Answer 'maybe' to everything until they ask you directly to decide.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "A2",
  },
};
