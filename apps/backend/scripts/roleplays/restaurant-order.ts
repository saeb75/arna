import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * PİLOT 1 — Restoran siparişi.
 *
 * Getirdiği dil problemi: TEK KELİMELİK CEVAPLAR ve NEGASYON. Dedektörün en çok
 * kanadığı sınıf burada: "Pasta." bir siparişi tamamlar, ama "I don't want the
 * fish" tamamlamaz — ikisi de öğrencinin gerçek sözü, ikisi de kısa.
 *
 * HEDEFLER İLETİŞİM ADIMI, dünya durumu değil: "Ask for a table", asla "Get a
 * table" — masa dolu olabilir ve dedektör yalnız öğrencinin sözüne bakıyor.
 *
 * `cancel-order` hedefi bilinçli: iptal ayrı bir iletişim adımıdır, o yüzden
 * sipariş tiki durur ve iptal AYRICA tiklenir. Sözleşmenin en tartışmalı
 * maddesinin canlı örneği bu senaryoda.
 */
export const RESTAURANT_ORDER: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-restaurant-order",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Ordering at a Restaurant",
    category: "Eating out",
    persona: {
      name: "Marco",
      role: "a waiter at a small Italian place",
      goal: "seat you, take your order and turn the table",
      mood: "brisk but friendly",
    },
    scene:
      "A busy trattoria on a Friday evening. You have walked in without a booking and the room is nearly full.",
    opening: "Good evening — do you have a booking?",
    objectives: [
      {
        id: "ask-for-table",
        label: "Ask for a table",
        activeFrom: "A1",
        openingHint: "Greet them and ask whether they have a booking or how many people are with them.",
      },
      {
        id: "order-main",
        label: "Order a main course",
        activeFrom: "A1",
        openingHint: "Offer two or three dishes by name so a one-word answer is enough.",
      },
      {
        id: "order-drink",
        label: "Order a drink",
        activeFrom: "A1",
        openingHint: "Ask whether they want still or sparkling water, or something else to drink.",
      },
      {
        // İLK İPUCU ("once they have eaten") kapsama koşusunda 8 turda kapı
        // açamadı: A1 temposunda "yemek yendi" ânı hiç gelmiyor. Persona artık
        // zamanı KENDİSİ ilerletiyor — sahne dakikalarca yemek beklemez.
        id: "ask-for-bill",
        label: "Ask for the bill",
        activeFrom: "A1",
        openingHint: "Soon after the order, say the meal is finished and ask whether they would like anything else.",
      },
      {
        id: "change-order",
        label: "Change or cancel something you ordered",
        activeFrom: "B1",
        openingHint: "Repeat their order back to them before it goes to the kitchen.",
      },
    ],
    complications: [
      {
        id: "dish-off",
        text: "The dish they order is off tonight. Offer one alternative and let them choose.",
        activeFrom: "B1",
      },
      {
        id: "bill-wrong",
        text: "The bill has an extra item on it. Do not point it out; wait for them to notice.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
