import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * SAĞLIK — İşe hasta olduğunu bildirmek.
 *
 * Getirdiği dil problemi: DURUM BİLDİRME + DÜZENLEME — "I've got a fever",
 * "Could someone else present?", "I hope to be back on Friday." Gelecek planı
 * kurmak ve baskıya kibarca sınır çizmek. Sınır bilinçli olarak OLUMLU adım:
 * "evden çalışmam" değil, "yapabileceğim tek küçük şeyi teklif et" — dedektör
 * reddi tamamlanmış adım saymıyor.
 */
export const CALLING_IN_SICK: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-calling-in-sick",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Not Coming In Today",
    category: "Health",
    persona: {
      name: "Mark Jensen",
      role: "your team manager, who has an important client meeting today",
      goal: "keep today's work on track, even if it means asking you to do a little from home",
      mood: "stressed, kind",
    },
    scene:
      "Half past seven on a Wednesday morning. You woke up with a high temperature and can hardly stand. You were meant to present at a client meeting at eleven today. You call your manager.",
    opening: "Morning — you're calling early. Is everything okay?",
    objectives: [
      {
        id: "say-ill",
        label: "Tell your manager you are ill",
        activeFrom: "B1",
        openingHint: "Ask what is up, sounding surprised by the early call.",
      },
      {
        id: "describe-feeling",
        label: "Describe how you feel",
        activeFrom: "B1",
        openingHint: "Ask, with concern, what kind of ill they are.",
      },
      {
        id: "handle-meeting",
        label: "Suggest what to do about the client meeting",
        activeFrom: "B1",
        openingHint: "Say the eleven o'clock meeting is important and ask what they think.",
      },
      {
        id: "say-return",
        label: "Say when you hope to be back",
        activeFrom: "B1",
        openingHint: "Ask whether they know how long they will be off.",
      },
      {
        id: "offer-small-help",
        label: "Offer one small thing you can do from home",
        activeFrom: "B2",
        openingHint: "Ask if they could join the meeting by video, just for half an hour.",
      },
      {
        id: "set-contact",
        label: "Say clearly when you will be reachable",
        activeFrom: "C1",
        openingHint: "Say you might need to call them later today with a quick question.",
      },
    ],
    complications: [
      {
        id: "client-asked",
        text: "Sound disappointed and mention once that the client asked for them by name.",
        activeFrom: "B2",
      },
      {
        id: "doctor-note",
        text: "Ask whether they will have a doctor's note, in a tone that sounds slightly suspicious.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B2",
  },
};
