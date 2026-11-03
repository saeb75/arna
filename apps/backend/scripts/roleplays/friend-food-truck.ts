import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SOSYAL — Arkadaşını aceleci bir karardan caydırmak.
 *
 * Getirdiği dil problemi: EMPATİYLE İKNA — önce anladığını göstermek, sonra
 * soru sorarak düşündürmek, endişeyi "I" cümlesiyle söylemek. Karşı taraf
 * duygusal: mantık tek başına yetmez, ton bedel öder. C1'de alınganlığa rağmen
 * görüşü korumak.
 */
export const FRIEND_FOOD_TRUCK: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-friend-food-truck",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "All In on a Food Truck",
    category: "Social",
    persona: {
      name: "Jonas",
      role: "your close friend, who is excited about a big life change",
      goal: "get your support for his plan to quit his job tomorrow",
      mood: "excited, touchy",
    },
    scene:
      "A quiet cafe on a Thursday night. Jonas has just told you he will quit his steady job tomorrow and spend all his savings on an old food truck. He has never run a business and has no plan yet, just a real love of cooking.",
    opening: "So? Be honest — isn't this the best idea I've ever had?",
    objectives: [
      {
        id: "show-understanding",
        label: "Show you understand why he wants this",
        activeFrom: "B2",
        openingHint: "Talk about how bored and stuck you have felt at work.",
      },
      {
        id: "ask-about-plan",
        label: "Ask questions about his plan",
        activeFrom: "B2",
        openingHint: "Say you have it all worked out, without giving any details.",
      },
      {
        id: "express-concern",
        label: "Say clearly what worries you",
        activeFrom: "B2",
        openingHint: "Ask what they really think, and say you want honesty.",
      },
      {
        id: "suggest-first-step",
        label: "Suggest a safer first step",
        activeFrom: "B2",
        openingHint: "Ask what they would do if they were in your place.",
      },
      {
        id: "hold-point",
        label: "Hold your point when he takes it personally",
        activeFrom: "C1",
        openingHint: "Say, hurt, that you thought they would be on your side.",
      },
    ],
    complications: [
      {
        id: "partner-against",
        text: "Mention that your partner already thinks it is a bad idea, so you need at least one friend on your side.",
        activeFrom: "B2",
      },
      {
        id: "deposit-paid",
        text: "Reveal halfway through that you have already paid a deposit on the truck.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B2",
    recommendedFrom: "C1",
  },
};
