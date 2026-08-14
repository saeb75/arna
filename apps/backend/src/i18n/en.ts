import type { ChromeBundle } from "@arna/contracts";

/**
 * İngilizce chrome — MUTLAK SON ÇARE paketi. Bir dilin paketi yoksa buna düşülür
 * (ve ayrı bir sayaçla loglanır: sessiz İngilizce'ye dönüş bir üründür hatasıdır,
 * bir fallback değil).
 *
 * Kural: Emma'nın söylediği ya da akışı süren her SABİT metin buradadır — ders
 * başına LLM'e yeniden ürettirilmez ("Fill in the blank:" 371 derste 50 dilde
 * 18.550 kez üretilecek bir cümle değildir).
 */
export const EN_CHROME: ChromeBundle = {
  language: "en",
  labels: {
    exerciseFillBlank: "Fill in the blank:",
    exerciseMcq: "Which one is correct?",
    exerciseSaySentence: "Say the whole sentence:",
    hint: "Example of what you can say:",
    practiceHint: "Try to use:",
    quizTitle: "Quick quiz",
    checkpoint: { mcq: "Choose the correct one", gap: "Fill in the blank", order: "Put the words in order" },
  },
  // İngilizce onaylar lessonFlow.ACK_EN'de — çekirdek küme her dilde geçerli,
  // assembleLesson birleştirir (surrender ile aynı desen)
  ack: { yes: [], no: [], proceed: [] },
  surrender: [], // İngilizce pes ifadeleri lessonFlow.SURRENDER_EN'de — çekirdek küme her dilde geçerli
  script: {
    greeting: "Hello {name}! Today we're going to learn about {topic}. Are you ready to start?",
    teachIntro: "Let me explain today's point.",
    askQuestions: "Before we practise — do you have any questions?",
    exercisesAnnounce: "Great. Now let's try a few quick questions.",
    practiceIntro: "Well done! Now let's practise in a short role play: {scenario}",
    inviteQuestion: "Of course — what would you like to ask?",
    praise: ["Exactly right!", "Well done!", "Perfect!", "That's it!"],
    wrapup: "That's the end of today's lesson — you did really well with {topic}. Is there anything you'd like to ask me?",
    farewell: "Great work today. See you in the next lesson!",
  },
};
