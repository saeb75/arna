import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SAĞLIK — Eczanede ilaç istemek.
 *
 * Getirdiği dil problemi: BELİRTİ ve SIKLIK. "My throat hurts", "since
 * yesterday", "How often?" — az kelimeyle beden anlatmak ve duyulan dozu geri
 * sormak. Eczacının güvenlik soruları (başka ilaç, alerji) CEVAP ister: cevap
 * vermek de bir iletişim adımıdır, A2'den itibaren hedef.
 */
export const PHARMACY: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-pharmacy",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Something for a Sore Throat",
    category: "Health",
    persona: {
      name: "Mr. Haddad",
      role: "a pharmacist at a quiet local pharmacy",
      goal: "give you the right medicine safely, after asking the questions he has to ask",
      mood: "calm, careful",
    },
    scene:
      "A small pharmacy on a rainy afternoon. You woke up with a sore throat and a headache, and swallowing hurts. There is nobody else in the shop, and the shelves behind the counter are full of boxes.",
    opening: "Hello, what can I do for you today?",
    objectives: [
      {
        id: "say-what-hurts",
        label: "Say what hurts",
        activeFrom: "A1",
        openingHint: "Ask what the problem is and where it hurts.",
      },
      {
        id: "say-how-long",
        label: "Say how long you have felt ill",
        activeFrom: "A1",
        openingHint: "Ask since when they have felt like this: today, yesterday, or longer.",
      },
      {
        id: "ask-how-often",
        label: "Ask how often to take the medicine",
        activeFrom: "A1",
        openingHint: "Put a box of throat sweets on the counter without explaining the dose.",
      },
      {
        id: "answer-safety",
        label: "Say if you take other medicine or have allergies",
        activeFrom: "A2",
        openingHint: "Ask whether they take any other medicine or have any allergies.",
      },
      {
        id: "ask-side-effects",
        label: "Ask whether the medicine has side effects",
        activeFrom: "B1",
        openingHint: "Mention that the stronger tablets make some people sleepy.",
      },
      {
        id: "ask-see-doctor",
        label: "Ask when you should see a doctor",
        activeFrom: "B2",
        openingHint: "Say most sore throats get better on their own in a few days.",
      },
    ],
    complications: [
      {
        id: "out-of-stock",
        text: "The usual tablets are out of stock. Offer a different one that must be taken with food.",
        activeFrom: "B1",
      },
      {
        id: "quick-questions",
        text: "Ask several quick safety questions in a row, a little faster than is comfortable.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A2",
  },
};
