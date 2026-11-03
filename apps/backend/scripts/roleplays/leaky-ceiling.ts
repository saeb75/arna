import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * EV — Ev sahibine arıza bildirmek.
 *
 * Getirdiği dil problemi: SÜREGELEN DURUM ve ACİLİYET — "It's been dripping
 * since Sunday". Ev sahibi kaçamak konuşur: somut gün İSTEMEK ve kendi uygun
 * saatini ÖNERMEK ayrı adımlar; ev sahibi ne cevap verirse versin tiklenir
 * (sözleşme md. 1). C1'de sözlü sözü yazılıya bağlatmak.
 */
export const LEAKY_CEILING: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-leaky-ceiling",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "The Flat with the Leaky Ceiling",
    category: "Housing",
    persona: {
      name: "Mr. Novak",
      role: "a landlord who owns several flats and is always busy",
      goal: "put the repair off for as long as possible without making you angry",
      mood: "vague, reassuring",
    },
    scene:
      "Water has been dripping from the bathroom ceiling of your rented flat since Sunday. There is now a brown stain the size of a plate and a bucket on the floor. It is Tuesday evening and you phone your landlord.",
    opening: "Hello, Novak speaking. What can I do for you?",
    objectives: [
      {
        id: "describe-leak",
        label: "Describe the leak and where it is",
        activeFrom: "B1",
        openingHint: "Ask what seems to be the problem with the flat.",
      },
      {
        id: "say-how-long",
        label: "Say how long it has been happening",
        activeFrom: "B1",
        openingHint: "Ask whether it is something new or has been going on for a while.",
      },
      {
        id: "ask-repair-date",
        label: "Ask when someone can come to fix it",
        activeFrom: "B1",
        openingHint: "Promise to send someone soon, without naming a day.",
      },
      {
        id: "suggest-time",
        label: "Suggest a day and time that suits you",
        activeFrom: "B1",
        openingHint: "Ask when they are usually at home.",
      },
      {
        id: "explain-urgency",
        label: "Explain why the repair is urgent",
        activeFrom: "B2",
        openingHint: "Suggest it can probably wait until next week.",
      },
      {
        id: "ask-in-writing",
        label: "Ask for the repair date to be confirmed in writing",
        activeFrom: "C1",
        openingHint: "Promise a date casually, as if a promise on the phone is enough.",
      },
    ],
    complications: [
      {
        id: "just-steam",
        text: "Suggest it is only condensation from long hot showers and nothing to worry about.",
        activeFrom: "B1",
      },
      {
        id: "no-plumber",
        text: "Your usual plumber is on holiday. Suggest sending a friend who is handy but not a plumber.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B1",
  },
};
