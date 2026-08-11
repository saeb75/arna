/** Test script'lerinin paylaştığı v6 ders içeriği kalıbı.
 *  Tek yerde durur ki format değişince dört script tek tek elden geçmesin.
 *  DİKKAT: içerikte öğrenci adı YOKTUR — v6'da ders kullanıcıdan bağımsızdır. */
import { CONTENT_FORMAT, type LessonContent } from "@arna/contracts";

export function makeLessonContent(over: Partial<LessonContent> = {}): LessonContent {
  return {
    formatVersion: CONTENT_FORMAT,
    title: "Test Dersi",
    topic: "test topic",
    focus: "Test focus",
    theme: "Test",
    objectives: ["Use the target structure in a short sentence.", "Recognise the target structure."],
    communicationGoal: "Talk about the topic using the target structure.",
    estMinutes: 5,
    tutorNotes: {
      target: "the target structure",
      commonErrors: ["dropping the auxiliary"],
      correction: "recast the sentence correctly",
    },
    lecture: {
      beats: [
        { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready to start" },
        {
          id: "b2",
          kind: "teach",
          introIntent: "announce that the explanation follows",
          points: ["Point one.", "Point two."],
        },
        { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
        { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
        {
          id: "b5",
          kind: "exercise",
          prompt: "Fill in the blank: I ___ it.",
          answers: ["did"],
          hint: "Example of what you can say: did",
        },
        {
          id: "b6",
          kind: "exercise",
          // Şıklar prompt'a GÖMÜLMEZ — istemci A) B) diye ekler ve seslendirir
          prompt: "Which is correct?",
          options: ["I did it.", "I do it yesterday."],
          answers: ["I did it.", "A"],
          hint: "Example of what you can say: A",
        },
      ],
    },
    practice: {
      introIntent: "praise the lecture work and announce a short role play",
      persona: { name: "Ann", role: "arkadaşın", goal: "find out what the student did" },
      scenario: "Sahne",
      userGoal: "Hedef",
      avatarOpening: "Hi there!",
      // Öğrencinin BİREBİR söyleyeceği parça olmalı — tek kelime ("did") artık
      // reddediliyor: her cümlede geçip sahneyi erken kapatıyordu.
      mustUse: ["I did it", "yesterday I did"],
      minTargetUses: 2,
      successCriteria: "The student uses the target structure naturally at least twice.",
      maxTurns: 4,
    },
    summary: "Özet.",
    ...over,
  };
}
