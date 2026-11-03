import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * YEMEK — Kafede sipariş, diyet kısıtıyla.
 *
 * Getirdiği dil problemi: İÇERİK SORUSU ve "WITHOUT / NO" NEGASYONU. "Oat milk,
 * please" ile "No milk" aynı kelimeleri taşır ama zıt sipariştir; restoran
 * pilotundaki negasyon sınıfı burada siparişin İÇİNDE yaşıyor. A1'de soru tek
 * kalıpla kurulabiliyor ("Does it have nuts?").
 *
 * `say-diet` bir ret değil BİLDİRİMDİR: "I'm allergic to nuts" öğrencinin kendi
 * iletişim adımı — dükkânın ne sunabildiğinden bağımsız tiklenir.
 */
export const CAFE_DIETARY: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-cafe-dietary",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Is There Milk in That?",
    category: "Eating out",
    persona: {
      name: "Priya",
      role: "a barista at a small neighbourhood cafe",
      goal: "take your order quickly and keep the morning queue moving",
      mood: "cheerful, quick",
    },
    scene:
      "A tiny cafe at eight in the morning, with a short queue behind you and a glass case of cakes and sandwiches. You cannot have nuts, and you do not drink cow's milk.",
    opening: "Hi there! What can I get you this morning?",
    objectives: [
      {
        id: "order-drink",
        label: "Order a hot drink",
        activeFrom: "A1",
        openingHint: "Offer coffee, tea or hot chocolate by name.",
      },
      {
        id: "say-diet",
        label: "Tell the barista about your allergy or diet",
        activeFrom: "A1",
        openingHint: "Ask whether they want normal milk in it, or if there is anything they cannot have.",
      },
      {
        id: "ask-ingredients",
        label: "Ask what is in a cake or sandwich",
        activeFrom: "A1",
        openingHint: "Recommend one cake from the case by name, so they have a reason to ask what is in it.",
      },
      {
        id: "ask-price",
        label: "Ask how much it all costs",
        activeFrom: "A1",
        openingHint: "Ring up the order without saying the total and ask whether that is everything.",
      },
      {
        id: "ask-kitchen",
        label: "Ask whether the food is made near nuts",
        activeFrom: "B1",
        openingHint: "Say all the cakes are baked in the same small kitchen at the back.",
      },
    ],
    complications: [
      {
        id: "oat-out",
        text: "The oat milk has just run out. Offer soy milk or black coffee instead, and let them choose.",
        activeFrom: "B1",
      },
      {
        id: "unsure-label",
        text: "You are not sure whether the banana bread has nuts. Check the label, then give a vague answer unless they press you.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
