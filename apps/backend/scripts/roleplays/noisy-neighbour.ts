import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * EV — Gürültülü komşuyla konuşmak.
 *
 * Getirdiği dil problemi: DOLAYLI ŞİKÂYET ve UZLAŞMA — "I don't know if you've
 * noticed, but...", "Would it be possible to...?". Suçlamadan sorunu adlandırmak,
 * somut bir orta yol önermek ve belirsiz bir "deneriz"i netleştirmek (`pin-down`).
 * C1'de karşı şikâyete tırmandırmadan cevap vermek.
 */
export const NOISY_NEIGHBOUR: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-noisy-neighbour",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Bass Through the Wall",
    category: "Housing",
    persona: {
      name: "Jay",
      role: "the neighbour next door, who works from home as a music producer",
      goal: "keep making music at night without falling out with you",
      mood: "friendly, defensive",
    },
    scene:
      "Saturday morning on the landing of your building. For two weeks, loud bass has come through your bedroom wall until after midnight, even on work nights. You have never spoken to Jay about it. He is just coming back with a coffee.",
    opening: "Oh, hey — morning! Everything alright?",
    objectives: [
      {
        id: "raise-issue",
        label: "Bring up the noise without accusing him",
        activeFrom: "B2",
        openingHint: "Mention you have been working on a big new track lately.",
      },
      {
        id: "describe-impact",
        label: "Explain how the noise affects you",
        activeFrom: "B2",
        openingHint: "Say you had no idea the walls were that thin.",
      },
      {
        id: "propose-compromise",
        label: "Suggest a specific compromise",
        activeFrom: "B2",
        openingHint: "Ask what would work for them, as if you have no idea.",
      },
      {
        id: "pin-down",
        label: "Sum up exactly what each of you will do",
        activeFrom: "B2",
        openingHint: "Agree to something vague, like trying to keep it down a bit.",
      },
      {
        id: "handle-counter",
        label: "Respond calmly to his complaint about you",
        activeFrom: "C1",
        openingHint: "Mention, lightly, that their door slams quite hard early in the morning.",
      },
    ],
    complications: [
      {
        id: "time-zones",
        text: "Explain you only work at night because your clients are in other time zones.",
        activeFrom: "B2",
      },
      {
        id: "nobody-else",
        text: "Say nobody else in the building has ever complained, and ask why it is only them.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B2",
    recommendedFrom: "B2",
  },
};
