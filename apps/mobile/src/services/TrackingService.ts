import { Platform } from "react-native";

type Tracking = typeof import("expo-tracking-transparency");
let mod: Tracking | null | undefined;

/** Native modül bu derlemede yoksa import fırlatır — tembel ve korumalı yüklenir */
function load(): Tracking | null {
  if (mod !== undefined) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("expo-tracking-transparency") as Tracking;
  } catch {
    mod = null;
  }
  return mod;
}

/**
 * App Tracking Transparency (iOS'un "izlemeye izin ver" sorusu). Asla fırlatmaz:
 * modül bu derlemede yoksa "sorulamaz / izin yok" döner. iOS dışında soru yoktur.
 */
export class TrackingService {
  /** iOS soruyu hâlâ gösterir mi (kurulum başına BİR kez sorulur) */
  static async canAsk(): Promise<boolean> {
    const t = load();
    if (Platform.OS !== "ios" || !t) return false;
    try {
      return (await t.getTrackingPermissionsAsync()).status === "undetermined";
    } catch {
      return false;
    }
  }

  /** Cevaplanmadıysa sistem sorusu; dönüş: izlemeye izin var mı */
  static async request(): Promise<boolean> {
    if (Platform.OS !== "ios") return true;
    const t = load();
    if (!t) return false;
    try {
      const current = await t.getTrackingPermissionsAsync();
      const final = current.status === "undetermined" ? await t.requestTrackingPermissionsAsync() : current;
      return final.status === "granted";
    } catch {
      return false;
    }
  }

  static async allowed(): Promise<boolean> {
    if (Platform.OS !== "ios") return true;
    const t = load();
    if (!t) return false;
    try {
      return (await t.getTrackingPermissionsAsync()).status === "granted";
    } catch {
      return false;
    }
  }
}
