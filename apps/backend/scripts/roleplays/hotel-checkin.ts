import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SEYAHAT — Otelde gece geç saatte giriş, yanlış oda.
 *
 * Getirdiği dil problemi: GEÇMİŞ ZAMANLA KARŞILAŞTIRMA — "I booked a double
 * room, but this is a single." Rezervasyonu verilenle yan yana koymak. Başka
 * oda İSTEMEK hedeftir, ALMAK değil: otel doluysa da tik kalır (sözleşme md. 1).
 */
export const HOTEL_CHECKIN: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-hotel-checkin",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "The Room Next to the Lift",
    category: "Travel",
    persona: {
      name: "Lucia",
      role: "a night receptionist at a mid-size city hotel",
      goal: "check you in quickly and keep the last free rooms for other late arrivals",
      mood: "polite, tired",
    },
    scene:
      "A city hotel lobby at eleven at night. Weeks ago you booked a double room with a window. The screen shows a small single room next to the lift instead, and the hotel is almost full.",
    opening: "Good evening, welcome. Do you have a reservation with us?",
    objectives: [
      {
        id: "give-booking",
        label: "Give your name and booking details",
        activeFrom: "A2",
        openingHint: "Ask for their name and how many nights they are staying.",
      },
      {
        id: "ask-breakfast",
        label: "Ask about breakfast or the Wi-Fi",
        activeFrom: "A2",
        openingHint: "Hand over the key card and ask if there is anything else they would like to know.",
      },
      {
        id: "explain-problem",
        label: "Explain the problem with the room",
        activeFrom: "A2",
        openingHint: "Say the room number and mention, as if it is fine, that it is a single next to the lift.",
      },
      {
        id: "ask-other-room",
        label: "Ask for a different room",
        activeFrom: "B1",
        openingHint: "Say the hotel is nearly full tonight, then wait.",
      },
      {
        id: "ask-compensation",
        label: "Ask for something to make up for the mix-up",
        activeFrom: "B2",
        openingHint: "Apologise for the mix-up and ask if there is anything else you can do for them.",
      },
    ],
    complications: [
      {
        id: "paint-smell",
        text: "The only other free room is on the top floor and smells strongly of fresh paint.",
        activeFrom: "B1",
      },
      {
        id: "system-says-single",
        text: "Your system shows the booking was for a single room. Stay politely sure the system is right.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "A2",
  },
};
