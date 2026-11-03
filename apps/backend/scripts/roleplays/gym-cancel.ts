import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * HİZMET — Spor salonu üyeliğini kapatmak.
 *
 * Getirdiği dil problemi: NET TALEP ve ISRAR. Görevli her turda bir "kal"
 * teklifi sunar; hedef "hayır demek" değil TALEBİ YİNELEMEK (dedektör ret
 * cümlesini tamamlanmış adım saymıyor). B2'de sözleşmede olmayan ücrete itiraz,
 * C1'de yazılı teyit istemek.
 *
 * İlk hedefin etiketi bilinçli olarak "cancel" değil "end": dedektör prompt'u
 * "cancelling something" cümlesini sayılmayanlar arasında listeliyor.
 */
export const GYM_CANCEL: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-gym-cancel",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "The Gym That Won't Let You Go",
    category: "Services",
    persona: {
      name: "Chloe",
      role: "a membership adviser at a large gym, trained to stop members leaving",
      goal: "keep you as a member, or at least delay the cancellation",
      mood: "bright, persistent",
    },
    scene:
      "The front desk of a large gym on a Monday evening. You are moving to another city next month. Your contract asks for one month's notice to leave. Behind the desk, a big poster advertises the gym's new spa.",
    opening: "Hi! Are you here for a class tonight?",
    objectives: [
      {
        id: "ask-to-end",
        label: "Ask to end your membership",
        activeFrom: "B1",
        openingHint: "Ask how they are enjoying the gym lately.",
      },
      {
        id: "give-reason",
        label: "Give your reason for leaving",
        activeFrom: "B1",
        openingHint: "Ask, a little sadly, why they want to go.",
      },
      {
        id: "repeat-request",
        label: "Repeat your request after an offer to stay",
        activeFrom: "B1",
        openingHint: "Offer two free months or a cheaper plan if they stay.",
      },
      {
        id: "ask-last-payment",
        label: "Ask when your last payment will be",
        activeFrom: "B1",
        openingHint: "Start filling in the form without mentioning any dates.",
      },
      {
        id: "question-fee",
        label: "Question a fee that is not in your contract",
        activeFrom: "B2",
        openingHint: "Mention a small cancellation fee in passing, as if it is normal.",
      },
      {
        id: "ask-confirmation",
        label: "Ask for written confirmation of the cancellation",
        activeFrom: "C1",
        openingHint: "Say everything is done and they are all set.",
      },
    ],
    complications: [
      {
        id: "manager-away",
        text: "The manager who signs off cancellations is not in. Suggest they come back another day.",
        activeFrom: "B1",
      },
      {
        id: "three-months",
        text: "Say the contract needs three months' notice, not one. Only check again if they insist.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B2",
  },
};
