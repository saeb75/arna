import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * ALIŞVERİŞ — Komisyonlu satıcıdan telefon almak.
 *
 * Getirdiği dil problemi: KARŞILAŞTIRMA ve KOŞULLU SORU — "Which one has the
 * better battery?", "What happens if I drop it?". Satıcı yalnız sorulanı söyler
 * ve pahalıya iter; C1'de bir iddiasını sorgulamak ayrı hedef.
 *
 * Ret hedefi YOK: dedektör "hayır"ı tamamlanmış adım saymıyor. Koruma planına
 * karşı adım olumlu kuruldu — ne kapsadığını SORMAK.
 */
export const NEW_PHONE: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-new-phone",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Your Old Phone Finally Died",
    category: "Shopping",
    persona: {
      name: "Ravi",
      role: "a salesperson in an electronics shop who earns commission",
      goal: "sell you the more expensive phone and a monthly protection plan",
      mood: "keen, persuasive",
    },
    scene:
      "An electronics shop on a weekday evening. Your old phone stopped working this morning. Two phones sit on the counter: last year's model at a fair price, and this year's model, which costs almost twice as much.",
    opening: "Hi there! Looking for a new phone today?",
    objectives: [
      {
        id: "say-needs",
        label: "Say what you mainly use your phone for",
        activeFrom: "B1",
        openingHint: "Ask what matters most to them: the camera, the battery, or the price.",
      },
      {
        id: "compare",
        label: "Ask how the two phones are different",
        activeFrom: "B1",
        openingHint: "Praise the new model without comparing it to the cheaper one.",
      },
      {
        id: "ask-warranty",
        label: "Ask about the warranty or what happens if it breaks",
        activeFrom: "B1",
        openingHint: "Mention that both phones have glass on the front and the back.",
      },
      {
        id: "ask-plan-cover",
        label: "Ask what the protection plan really covers",
        activeFrom: "B2",
        openingHint: "Offer the monthly protection plan as if everyone takes it.",
      },
      {
        id: "ask-better-price",
        label: "Ask for a better price",
        activeFrom: "B2",
        openingHint: "Say this is the last one at this price in the shop.",
      },
      {
        id: "challenge-claim",
        label: "Challenge something the salesperson claimed",
        activeFrom: "C1",
        openingHint: "Claim the cheaper phone will stop getting updates very soon.",
      },
    ],
    complications: [
      {
        id: "order-in",
        text: "Last year's model is out of stock here. It can be ordered and will arrive in three days.",
        activeFrom: "B1",
      },
      {
        id: "jargon",
        text: "Use a few technical terms and see whether they ask what they mean.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B1",
  },
};
