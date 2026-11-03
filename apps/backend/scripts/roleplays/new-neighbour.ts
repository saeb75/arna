import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SOSYAL — Yeni komşuyla ilk karşılaşma.
 *
 * Getirdiği dil problemi: KENDİNİ TANITMA ve SORUYU GERİ ÇEVİRME. Sohbet tek
 * yönlü kalırsa (ad + memleket, sonra sessizlik) karşı tarafa soru sormak hiç
 * gerçekleşmez — "And you?" AYRI bir iletişim adımı, ayrı hedef.
 */
export const NEW_NEIGHBOUR: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-new-neighbour",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Hello from Next Door",
    category: "Social",
    persona: {
      name: "Mrs. Adebayo",
      role: "a retired neighbour who has lived in the building for twenty years",
      goal: "find out who has moved in next door and make you feel welcome",
      mood: "chatty, curious",
    },
    scene:
      "You moved into your new flat two days ago. You are carrying the last box up the stairs when the door next to yours opens. Your neighbour comes out holding a small potted plant.",
    opening: "Oh, hello there! Are you the new neighbour?",
    objectives: [
      {
        id: "introduce-yourself",
        label: "Say your name and where you are from",
        activeFrom: "A1",
        openingHint: "Say your own name, then ask what theirs is.",
      },
      {
        id: "ask-back",
        label: "Ask the neighbour a question about herself",
        activeFrom: "A1",
        openingHint: "Mention you have lived here a very long time, then pause.",
      },
      {
        id: "ask-nearby",
        label: "Ask where a shop or other place is",
        activeFrom: "A1",
        openingHint: "Say everything you need is close by, without naming any places.",
      },
      {
        id: "thank-gift",
        label: "Thank her for the plant",
        activeFrom: "A1",
        openingHint: "Hold out the small plant and say it is a welcome present.",
      },
      {
        id: "apologise-noise",
        label: "Apologise for the noise of moving in",
        activeFrom: "B1",
        openingHint: "Mention, kindly, that there was a lot of banging last night.",
      },
      {
        id: "invite-over",
        label: "Invite her round for tea or coffee",
        activeFrom: "B1",
        openingHint: "Say you would love to see what they have done with the flat.",
      },
    ],
    complications: [
      {
        id: "wrong-name",
        text: "Mishear their name and keep using the wrong one until they correct you.",
        activeFrom: "B1",
      },
      {
        id: "old-tenant",
        text: "Mention the last tenant left boxes on the stairs for weeks, and hint that you hope they will not do the same.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
