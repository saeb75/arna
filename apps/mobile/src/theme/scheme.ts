export type SchemeSetting = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

/** Çizilecek tema: kullanıcının seçimi, yoksa telefonunki. */
export const resolveScheme = (setting: SchemeSetting, system: string | null | undefined): Scheme =>
  setting === "system" ? (system === "dark" ? "dark" : "light") : setting;
