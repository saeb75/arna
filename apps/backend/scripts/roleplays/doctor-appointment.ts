import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SAĞLIK — Doktordan telefonla randevu almak.
 *
 * Getirdiği dil problemi: SÜRE ve ZAMAN İFADELERİ — "for three days", "since
 * Monday", "Tuesday at ten". Telefonda jest yok: duyulan tarihi/saati TEKRAR
 * EDEREK teyit etmek ayrı bir iletişim adımı (`repeat-time`).
 */
export const DOCTOR_APPOINTMENT: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-doctor-appointment",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "A Fever That Won't Go Away",
    category: "Health",
    persona: {
      name: "Grace Mensah",
      role: "a receptionist at a busy family doctor's practice",
      goal: "book you into the right appointment and keep the doctors' day running on time",
      mood: "efficient, kind",
    },
    scene:
      "You are phoning your doctor's practice at half past eight on a Thursday morning. You have had a high temperature for three days and it is not getting better. The lines have just opened and lots of people are calling.",
    opening: "Good morning, Riverside Medical Practice. How can I help?",
    objectives: [
      {
        id: "ask-appointment",
        label: "Ask for an appointment",
        activeFrom: "A2",
        openingHint: "Ask what they are calling about today.",
      },
      {
        id: "describe-symptoms",
        label: "Describe your symptoms and how long you have had them",
        activeFrom: "A2",
        openingHint: "Ask what the symptoms are and when they started.",
      },
      {
        id: "choose-time",
        label: "Say which time works for you",
        activeFrom: "A2",
        openingHint: "Offer two times by name, such as this afternoon at four or tomorrow at nine.",
      },
      {
        id: "repeat-time",
        label: "Repeat the appointment time to check it",
        activeFrom: "A2",
        openingHint: "Say the appointment time quickly, only once, and ask if that is okay.",
      },
      {
        id: "ask-phone-call",
        label: "Ask whether a doctor can call you instead",
        activeFrom: "B1",
        openingHint: "Say the first face-to-face appointment is not until next week.",
      },
      {
        id: "explain-urgency",
        label: "Explain why you need to be seen soon",
        activeFrom: "B2",
        openingHint: "Ask, in a neutral voice, whether it is urgent or can wait a few days.",
      },
    ],
    complications: [
      {
        id: "no-slots",
        text: "Today's appointments are all gone. Only next Tuesday is free unless they explain why it is urgent.",
        activeFrom: "B1",
      },
      {
        id: "mishear-detail",
        text: "Ask for their date of birth to find them on the system, and mishear it the first time.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A2",
    recommendedFrom: "A2",
  },
};
