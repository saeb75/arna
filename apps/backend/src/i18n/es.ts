import type { ChromeBundle } from "@glotmate/contracts";

/** İspanyolca chrome — lansman test dillerinden (tr ile birlikte). */
export const ES_CHROME: ChromeBundle = {
  language: "es",
  labels: {
    exerciseFillBlank: "Completa el espacio:",
    exerciseMcq: "¿Cuál es la correcta?",
    exerciseSaySentence: "Di la frase completa:",
    hint: "Puedes decir, por ejemplo:",
    practiceHint: "Intenta usar:",
    quizTitle: "Mini prueba",
    checkpoint: { mcq: "Elige la opción correcta", gap: "Completa el espacio", order: "Ordena las palabras" },
  },
  ack: {
    yes: ["si", "sí", "claro", "por supuesto", "tengo una pregunta", "vale si"],
    no: ["no", "no gracias", "ninguna", "no tengo preguntas", "estoy bien", "nada"],
    proceed: ["vale", "ok", "listo", "lista", "estoy listo", "estoy lista", "vamos", "empecemos", "adelante", "continua", "continúa"],
  },
  surrender: ["no sé", "no se", "ni idea", "no estoy seguro", "no estoy segura", "paso", "me rindo"],
  script: {
    greeting: "¡Hola {name}! {callback}La lección de hoy: {topic}. ¿Empezamos?",
    teachIntro: "Deja que te lo explique brevemente.",
    askQuestions: "Antes de practicar — ¿tienes alguna pregunta?",
    // Performans iddiası yok — şablon öğrencinin ne yaptığını bilmez (bkz. tr.ts)
    exercisesAnnounce: "Ahora vamos con unas preguntas rápidas.",
    practiceIntro: "Ahora practiquemos con una breve escena: {scenario}",
    inviteQuestion: "Claro — ¿qué te gustaría saber?",
    praise: ["¡Exacto!", "¡Muy bien!", "¡Perfecto!", "¡Eso es!"],
    wrapup: "Hemos llegado al final de la lección de hoy. ¿Hay algo que quieras preguntarme?",
    farewell: "¡Gracias por tu esfuerzo de hoy! Nos vemos en la próxima lección.",
  },
};
