import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@arna/contracts";

/**
 * PİLOT 2 — Şikâyet ve iade.
 *
 * Getirdiği dil problemi: ÇOK TURLU SONUÇ ve KOMPLİKASYON. Restoranın tersi:
 * hedefler tek cümleyle tamamlanmıyor, öğrenci pozisyon tutmak ve pazarlık etmek
 * zorunda. Dedektörün ikinci kanama noktası burada — bir turda birden çok hedef
 * kısmen ilerliyor ve "hangi cümle neyi tamamladı" ayrımı zorlaşıyor.
 *
 * HEDEFLER İLETİŞİM ADIMI: "Ask for a specific remedy", asla "Resolve the
 * complaint" — çözümü karşı taraf verir, talebi öğrenci kurar. Bu ayrım
 * incelemede en keskin bulguydu.
 *
 * `supportedFrom: B1` — A1 kullanıcısı kilitlenmez ama senaryo B1'de oynanır ve
 * ekranda söylenir. B1'de üç hedef aktif olduğu için iki hedef garantisi tutuyor.
 */
export const COMPLAINT_REFUND: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-complaint-refund",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Returning a Faulty Item",
    category: "Services",
    persona: {
      name: "Ms. Okoye",
      role: "a shop manager who is polite but protective of the till",
      goal: "keep you as a customer while giving away as little as possible",
      mood: "polite, unhurried",
    },
    scene:
      "You bought a pair of headphones three weeks ago and one side has stopped working. You have the box but not the receipt. The shop's policy notice says refunds require a receipt.",
    opening: "Good afternoon — how can I help you today?",
    objectives: [
      {
        id: "state-problem",
        label: "State clearly what is wrong with the item",
        activeFrom: "B1",
        openingHint: "Ask what the problem is and when they bought it.",
      },
      {
        id: "ask-remedy",
        label: "Ask for a specific remedy",
        activeFrom: "B1",
        openingHint: "Ask what outcome they are hoping for rather than offering one.",
      },
      {
        id: "answer-no-receipt",
        label: "Answer the objection about the missing receipt",
        activeFrom: "B1",
        openingHint: "Mention that the policy notice requires a receipt for refunds.",
      },
      {
        id: "hold-position",
        label: "Hold your position after the first refusal",
        activeFrom: "B2",
        openingHint: "Refuse once, politely and with a reason, then wait.",
      },
      {
        // İLK ETİKET ("Close on an agreement you would accept") kapsama koşusunda
        // 12 turda hiç tiklenmedi: kapanış karşı tarafın teklifine bağlıydı, yani
        // saf öğrenci edimi değildi — sözleşmenin 1. maddesinin ihlali. Yeniden
        // yazıldı: kabul/ret AÇIKÇA SÖYLEMEK öğrencinin kendi iletişim adımı.
        id: "close-agreement",
        label: "Accept or decline the final offer in clear terms",
        activeFrom: "B2",
        openingHint: "Make one concrete final offer and ask directly whether they will take it.",
      },
      {
        id: "escalate-politely",
        label: "Escalate without losing the room",
        activeFrom: "C1",
        openingHint: "Say the decision is not yours to make and see how they respond.",
      },
    ],
    complications: [
      {
        id: "store-credit-only",
        text: "You can offer store credit but not cash. Hold that line unless they push well.",
        activeFrom: "B2",
      },
      {
        id: "queue-pressure",
        text: "Other customers are waiting. Show mild time pressure without being rude.",
        activeFrom: "C1",
      },
    ],
    supportedFrom: "B1",
    recommendedFrom: "B2",
  },
};
