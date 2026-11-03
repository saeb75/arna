import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * YEMEK — Yanlış gelen paket servis, telefonda.
 *
 * Getirdiği dil problemi: TELEFONDA SORUN ANLATMA — sipariş edilenle geleni
 * karşılaştırmak, sipariş adını/numarasını vermek, ne istediğini adlandırmak.
 * Görsel destek yok: her şey sözle. B2'de teklif yetersizse hedef "hayır" demek
 * değil KARŞI TEKLİF kurmak — dedektör reddi tamamlanmış adım saymıyor.
 */
export const DELIVERY_WRONG: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-delivery-wrong",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "That's Not My Pizza",
    category: "Eating out",
    persona: {
      name: "Omar",
      role: "a worker at a busy pizza shop who answers the phone",
      goal: "fix the problem as cheaply as possible and keep you as a happy customer",
      mood: "apologetic, busy",
    },
    scene:
      "Friday night. Your food has just arrived, forty minutes late. You ordered a vegetarian pizza and garlic bread, but the box holds a pepperoni pizza and there is no garlic bread. You call the shop.",
    opening: "Hello, pizza shop, Omar speaking — how can I help?",
    objectives: [
      {
        id: "give-details",
        label: "Give your name or order number",
        activeFrom: "A2",
        openingHint: "Ask for the name or the order number on the receipt.",
      },
      {
        id: "explain-wrong",
        label: "Explain what you ordered and what arrived",
        activeFrom: "A2",
        openingHint: "Ask what exactly is wrong with the order.",
      },
      {
        id: "say-fix",
        label: "Say what you would like the shop to do",
        activeFrom: "A2",
        openingHint: "Ask what they would like: a new pizza, or their money back.",
      },
      {
        id: "mention-late",
        label: "Mention that the food was late",
        activeFrom: "B1",
        openingHint: "Ask if everything else was all right with the delivery.",
      },
      {
        id: "counter-offer",
        label: "Make a counter-offer to the shop's first offer",
        activeFrom: "B2",
        openingHint: "Offer only a free drink with their next order, then wait.",
      },
    ],
    complications: [
      {
        id: "long-wait",
        text: "A new pizza would take another hour. Offer a voucher instead of sending one tonight.",
        activeFrom: "B1",
      },
      {
        id: "screen-says",
        text: "Your screen says the order was pepperoni. Politely suggest they must have ordered it by mistake.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "B1",
  },
};
