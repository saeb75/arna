import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * ALIŞVERİŞ — Açık pazarda meyve-sebze.
 *
 * Getirdiği dil problemi: MİKTAR ve FİYAT. "Half a kilo", "two of those", "How
 * much is it?" — sayılabilen/sayılamayan ayrımı burada gramer konusu değil,
 * alışverişin kendisi. B1'den sonra PAZARLIK: fiyat önermek öğrencinin kendi
 * adımıdır, satıcı kabul etmese de tiklenir (sözleşme md. 1).
 */
export const MARKET_STALL: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-market-stall",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Ripe Tomatoes at the Saturday Market",
    category: "Shopping",
    persona: {
      name: "Rosa",
      role: "a fruit and vegetable seller at an outdoor market",
      goal: "sell you as much as possible before the market closes at one o'clock",
      mood: "loud, warm",
    },
    scene:
      "An outdoor market on a sunny Saturday morning. Rosa's stall is piled with tomatoes, peppers, apples and strawberries. The prices are chalked on small boards, but last night's rain has made some of them hard to read.",
    opening: "Good morning! Lovely tomatoes today — what can I get you?",
    objectives: [
      {
        id: "ask-price",
        label: "Ask how much something costs",
        activeFrom: "A1",
        openingHint: "Say the strawberries are very sweet today, without saying the price.",
      },
      {
        id: "say-quantity",
        label: "Say how much you want",
        activeFrom: "A1",
        openingHint: "Ask how much they want, offering half a kilo or a whole kilo.",
      },
      {
        id: "ask-second",
        label: "Ask for a second kind of fruit or vegetable",
        activeFrom: "A1",
        openingHint: "After the first item, ask if they need anything else, naming two other things on the stall.",
      },
      {
        id: "say-payment",
        label: "Say how you want to pay",
        activeFrom: "A1",
        openingHint: "Tell them the total and ask whether it is cash or card.",
      },
      {
        id: "suggest-price",
        label: "Suggest a lower price",
        activeFrom: "B1",
        openingHint: "Give a total that is a little high and wait for their reaction.",
      },
      {
        id: "bulk-deal",
        label: "Offer to buy more in return for a better price",
        activeFrom: "B2",
        openingHint: "Mention you have far too many peppers left today.",
      },
    ],
    complications: [
      {
        id: "sold-out",
        text: "The strawberries they want are sold out. Offer cherries instead and say they are just as good.",
        activeFrom: "B1",
      },
      {
        id: "rounded-up",
        text: "Round the total up a little in your favour. Correct it only if they question the sum.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
