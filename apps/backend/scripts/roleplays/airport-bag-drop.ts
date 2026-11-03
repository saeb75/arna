import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SEYAHAT — Havalimanında son dakika, fazla kilolu bavul.
 *
 * Getirdiği dil problemi: ZAMAN BASKISI ALTINDA SEÇENEK SORMA — "What if I
 * move some things to my hand luggage?", "Can I pay by card?". Kısa ve net
 * cümle ödüllendirilir: uzun açıklama zaman yer ve görevli masayı kapatır.
 */
export const AIRPORT_BAG_DROP: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-airport-bag-drop",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Ten Minutes to Boarding",
    category: "Travel",
    persona: {
      name: "Ingrid",
      role: "an airline agent at a bag drop desk that is about to close",
      goal: "follow the rules and close the desk on time",
      mood: "strict, hurried",
    },
    scene:
      "A busy airport at six in the morning. The bag drop for your flight closes in a few minutes and boarding starts in ten. Your suitcase is three kilos over the limit, and the gate is a long walk away.",
    opening: "Morning. Where are you flying to today?",
    objectives: [
      {
        id: "explain-hurry",
        label: "Say where you are flying and that you are in a hurry",
        activeFrom: "B1",
        openingHint: "Ask where they are flying, then glance at the clock.",
      },
      {
        id: "ask-fee",
        label: "Ask how much the extra weight costs",
        activeFrom: "B1",
        openingHint: "Say the bag is over the limit, without giving the price.",
      },
      {
        id: "suggest-fix",
        label: "Suggest a way to avoid the extra fee",
        activeFrom: "B1",
        openingHint: "Say the fee is quite high and ask if they want to pay it.",
      },
      {
        id: "ask-way",
        label: "Ask how to get to the gate quickly",
        activeFrom: "B1",
        openingHint: "Print the boarding pass and say the gate is a long way off.",
      },
      {
        id: "ask-exception",
        label: "Ask the agent to make an exception",
        activeFrom: "B2",
        openingHint: "Say the desk is officially closed now.",
      },
    ],
    complications: [
      {
        id: "card-fails",
        text: "The card reader is slow and fails once. Ask them to try again.",
        activeFrom: "B1",
      },
      {
        id: "hand-luggage",
        text: "Their hand luggage is also too big. Mention it only after the suitcase is sorted.",
        activeFrom: "B2",
      },
      {
        id: "name-mismatch",
        text: "Their name on the booking is spelled slightly differently from the passport. Treat it as a serious problem.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B1",
  },
};
