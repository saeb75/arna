import type { CefrLevel, Interest, Track } from "@arna/contracts";

export const INTEREST_LABELS: Record<Interest, string> = {
  technology: "Teknoloji",
  business: "İş Dünyası",
  travel: "Seyahat",
  movies_tv: "Film & Dizi",
  music: "Müzik",
  sports: "Spor",
  gaming: "Oyun",
  food: "Yemek",
  science: "Bilim",
  health: "Sağlık",
  finance: "Finans",
  art_design: "Sanat & Tasarım",
  fashion: "Moda",
  education: "Eğitim",
  news_politics: "Gündem",
  nature: "Doğa",
};

export const TRACK_LABELS: Record<Track, { title: string; desc: string }> = {
  conversation: { title: "Günlük Konuşma", desc: "Sosyal durumlar, seyahat, small talk" },
  business: { title: "Business English", desc: "Toplantılar, e-postalar, sunumlar" },
  exam: { title: "Sınav İngilizcesi", desc: "IELTS / TOEFL hazırlık" },
};

export const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "A1 · Yeni başlıyorum",
  A2: "A2 · Basit cümleler kurabiliyorum",
  B1: "B1 · Günlük konularda konuşabiliyorum",
  B2: "B2 · Rahat konuşuyorum, akıcılık istiyorum",
  C1: "C1 · İleri seviye, incelik istiyorum",
};
