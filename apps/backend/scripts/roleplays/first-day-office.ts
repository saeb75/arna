import { ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@glotmate/contracts";

/**
 * İŞ — İşteki ilk gün.
 *
 * Getirdiği dil problemi: TANIŞMA ve YER/BİLGİ SORMA — "Nice to meet you",
 * "Where is the kitchen?", "Who can help me with...?". A1'de tek cümlelik soru
 * kalıpları yeter; B1'den sonra küçük sohbet (karşı tarafın hafta sonunu
 * sormak) ayrı bir adım olur.
 */
export const FIRST_DAY_OFFICE: { slug: string; spec: RoleplaySpec } = {
  slug: "rp-first-day-office",
  spec: {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: "Your First Day at the Office",
    category: "Work",
    persona: {
      name: "Sam Rivera",
      role: "a friendly colleague asked to show you around on your first day",
      goal: "help you settle in and meet the team before a ten o'clock meeting",
      mood: "welcoming, a bit rushed",
    },
    scene:
      "Nine o'clock on Monday morning in a busy open-plan office. It is your first day. Sam meets you at reception with your new staff card and walks you towards the desks.",
    opening: "Hi, you must be the new starter! Did you find the building okay?",
    objectives: [
      {
        id: "introduce-yourself",
        label: "Introduce yourself and say your new job",
        activeFrom: "A1",
        openingHint: "Say your own name and team, then ask theirs.",
      },
      {
        id: "ask-where",
        label: "Ask where something is in the office",
        activeFrom: "A1",
        openingHint: "Say the kitchen and toilets are on this floor, without saying where.",
      },
      {
        id: "ask-lunch",
        label: "Ask about lunch or working hours",
        activeFrom: "A1",
        openingHint: "Say most people eat lunch together, without saying when.",
      },
      {
        id: "ask-it-help",
        label: "Ask who can help you with your computer",
        activeFrom: "B1",
        openingHint: "Show them their desk and say the laptop is new and not set up yet.",
      },
      {
        id: "weekend-talk",
        label: "Ask a colleague about their weekend",
        activeFrom: "B1",
        openingHint: "Say you had a busy weekend, then pause.",
      },
      {
        id: "ask-expectations",
        label: "Ask what is expected of you in your first week",
        activeFrom: "B2",
        openingHint: "Mention the manager is in meetings all day today.",
      },
    ],
    complications: [
      {
        id: "no-login",
        text: "Their login is not ready, and nobody from IT is in until the afternoon.",
        activeFrom: "B1",
      },
      {
        id: "name-rush",
        text: "Introduce three colleagues very quickly, with names that are easy to mix up.",
        activeFrom: "B2",
      },
    ],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  },
};
