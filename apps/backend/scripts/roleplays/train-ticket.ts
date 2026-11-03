import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SEYAHAT — Akşam treni için bilet.
 *
 * Getirdiği dil problemi: SAYI ve SAAT. "Nine forty", "platform four", "single
 * or return" — duyulanı yakalamak, gerekirse geri sormak. Tek kelimelik cevap
 * ("Return.") bir hedefi tamamlar; dedektör kısa sözde de çalışmalı.
 *
 * Kalkış saati ve peron persona'nın açılışında SÖYLENMEZ (ipuçları bunu
 * dayatıyor): söylenirse öğrencinin soracak bir şeyi kalmaz, iki hedef
 * ulaşılamaz olur.
 */
export const TRAIN_TICKET: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-train-ticket",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "The Last Train to the Coast",
    category: "Travel",
    persona: {
      name: "Tomasz",
      role: "a ticket clerk at a small country train station",
      goal: "sell you the right ticket before the last train of the evening leaves",
      mood: "tired, patient",
    },
    scene:
      "A quiet station at nine in the evening. Only one ticket window is open and the departures board is broken. You want to reach the seaside town of Harbour Point tonight, and you have a small suitcase with you.",
    opening: "Good evening. Where would you like to go?",
    objectives: [
      {
        id: "ask-ticket",
        label: "Ask for a ticket to your destination",
        activeFrom: "A1",
        openingHint: "Ask where they are going and how many people are travelling.",
      },
      {
        id: "choose-type",
        label: "Say if you want a single or a return",
        activeFrom: "A1",
        openingHint: "Ask whether they want a single or a return ticket, naming both.",
      },
      {
        id: "ask-time",
        label: "Ask what time the train leaves",
        activeFrom: "A1",
        openingHint: "Say there is one more train tonight, without saying when it leaves.",
      },
      {
        id: "ask-platform",
        label: "Ask which platform the train leaves from",
        activeFrom: "A1",
        openingHint: "Hand over the ticket and say the train is coming soon, without naming the platform.",
      },
      {
        id: "ask-cheaper",
        label: "Ask if there is a cheaper ticket",
        activeFrom: "B1",
        openingHint: "Say the price of the standard ticket and pause, as if they might want something else.",
      },
    ],
    complications: [
      {
        id: "cash-only",
        text: "The card machine has stopped working. Ask for cash, and only mention the cash machine outside if they ask.",
        activeFrom: "B1",
      },
      {
        id: "change-trains",
        text: "The direct train is cancelled. The only way tonight has a change at a junction and arrives an hour later.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
