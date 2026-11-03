import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * ALIŞVERİŞ — Kıyafet değiştirmek.
 *
 * Getirdiği dil problemi: SEBEP ve TERCİH — "It's too small", "Have you got it
 * in a large?", "I'd prefer an exchange." Şikâyet pilotunun aksine ürün kusurlu
 * değil ve fiş elde: gerilim yok, işlem dili var. A2 için bilinçli olarak yumuşak;
 * B1'de satıcının yönlendirmesine karşı kendi seçimini savunmak.
 */
export const RETURN_CLOTHES: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-return-clothes",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Two Sizes Too Small",
    category: "Shopping",
    persona: {
      name: "Hannah",
      role: "a shop assistant at a clothes shop",
      goal: "turn your return into an exchange so the shop keeps the sale",
      mood: "helpful, chatty",
    },
    scene:
      "A clothes shop on a Saturday afternoon. Last week you bought a blue jacket here as a present, but it is two sizes too small. You have the receipt, and the tags are still on.",
    opening: "Hi there, can I help you with anything?",
    objectives: [
      {
        id: "say-return",
        label: "Say you want to return or change something",
        activeFrom: "A2",
        openingHint: "Ask if they are looking for something or bringing something back.",
      },
      {
        id: "give-reason",
        label: "Explain what is wrong with it",
        activeFrom: "A2",
        openingHint: "Ask, kindly, what the problem with the jacket is.",
      },
      {
        id: "ask-size",
        label: "Ask for a different size or colour",
        activeFrom: "A2",
        openingHint: "Say the same jacket comes in other sizes and colours.",
      },
      {
        id: "choose-option",
        label: "Say whether you want an exchange or your money back",
        activeFrom: "A2",
        openingHint: "Offer two choices by name: swap it, or a refund to the card.",
      },
      {
        id: "defend-choice",
        label: "Explain what you liked about the original jacket",
        activeFrom: "B1",
        openingHint: "Push a completely different jacket, saying it is much nicer.",
      },
    ],
    complications: [
      {
        id: "colour-gone",
        text: "The right size is sold out in blue. Only black or green are left.",
        activeFrom: "B1",
      },
      {
        id: "card-only",
        text: "Refunds can only go back to the card used to pay. Ask if they have that card with them.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "A2",
  },
};
