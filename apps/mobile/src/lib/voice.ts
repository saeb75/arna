import { AudioModule, createAudioPlayer, setAudioModeAsync, RecordingPresets, type AudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import type { RichText } from "@arna/contracts";
import { api } from "../api";

/**
 * SES SERVİSİ — cihaz G/Ç katmanı. Ekranlar BUNA DOKUNAMAZ; yalnız controller
 * kullanır (mobil CLAUDE.md). API erişimi tek istisna olarak buradadır: ses
 * verisi bir "veri akışı" değil G/Ç'dir, controller'a taşımak sadece dolaylılık
 * eklerdi.
 *
 * KÖK KURAL — `onEnd` TAM BİR KEZ: `awaiting === null` iken mikrofon ve klavye
 * kapalı olduğundan kaybolan her callback dersi kilitler. `settle()` bu yüzden
 * didJustFinish + hata + watchdog'u tek noktada birleştirir (web'deki desenin
 * aynısı).
 */

let currentPlayer: AudioPlayer | null = null;
let currentRecorder: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
/** Geç gelen eski TTS yanıtı akışı ilerletemesin diye nesil sayacı */
let generation = 0;

export const VoiceService = {
  async init(): Promise<void> {
    await setAudioModeAsync({
      playsInSilentMode: true, // iOS sessiz anahtarında da ders sesi çalsın
      allowsRecording: true,
    });
    await AudioModule.requestRecordingPermissionsAsync();
  },

  /**
   * Parçaları seslendir; ses bitince (ya da TTS düşünce) onEnd — TAM BİR KEZ.
   * Sunucu ardışık aynı-dil parçaları tek klipte birleştirir; klipler sırayla çalar.
   */
  async speak(sessionId: string, runs: RichText, onEnd: () => void): Promise<void> {
    const gen = ++generation;
    this.stopPlayback();

    let settled = false;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const settle = () => {
      if (settled) return;
      settled = true;
      if (watchdog) clearTimeout(watchdog);
      onEnd();
    };

    let clips: Array<{ audioBase64: string }> = [];
    try {
      const res = await api.post(`/v1/sessions/${sessionId}/tts`, {
        runs: runs.map((r) => ({ lang: r.lang, text: r.text })),
      });
      clips = (res.data as { clips: Array<{ audioBase64: string }> }).clips ?? [];
    } catch {
      // TTS düştü — metin ekranda, akış İLERLEMELİ (ders kilidi kök hatası)
      settle();
      return;
    }
    if (gen !== generation || clips.length === 0) {
      settle();
      return;
    }

    // Toplam kabaca süre bilinmiyor; watchdog klip sayısına göre cömert:
    // klip başına 30sn + 5sn. Takılan oynatıcı dersi asla kilitleyemez.
    watchdog = setTimeout(settle, clips.length * 30_000 + 5_000);

    const playClip = async (index: number): Promise<void> => {
      const clip = clips[index];
      if (!clip || gen !== generation) {
        settle();
        return;
      }
      try {
        const path = `${FileSystem.cacheDirectory}tts-${gen}-${index}.mp3`;
        await FileSystem.writeAsStringAsync(path, clip.audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const player = createAudioPlayer({ uri: path });
        currentPlayer = player;
        player.addListener("playbackStatusUpdate", (status) => {
          if (gen !== generation) {
            player.remove();
            settle();
            return;
          }
          if (status.didJustFinish) {
            player.remove();
            if (index + 1 < clips.length) void playClip(index + 1);
            else settle();
          }
        });
        player.play();
      } catch {
        settle(); // tek klip bile çalınamazsa akış ilerler
      }
    };
    void playClip(0);
  },

  stopPlayback(): void {
    generation++; // yoldaki TTS yanıtlarını ve dinleyicileri geçersiz kıl
    try {
      currentPlayer?.remove();
    } catch {
      /* zaten kaldırılmış olabilir */
    }
    currentPlayer = null;
  },

  async startRecording(): Promise<boolean> {
    try {
      const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();
      recorder.record();
      currentRecorder = recorder;
      return true;
    } catch {
      return false;
    }
  },

  /** Kaydı durdur, STT'ye gönder, metni döndür. Kısa/boş kayıtta null — hak yemez. */
  async stopRecording(sessionId: string): Promise<string | null> {
    const recorder = currentRecorder;
    currentRecorder = null;
    if (!recorder) return null;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return null;

      const form = new FormData();
      // RN FormData dosya nesnesi: { uri, name, type } — backend mime map'inde audio/mp4 var
      form.append("file", { uri, name: "speech.m4a", type: "audio/mp4" } as unknown as Blob);
      const res = await api.post(`/v1/sessions/${sessionId}/stt`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const text = (res.data as { text?: string }).text?.trim();
      return text || null;
    } catch {
      return null; // audio_too_short dahil — sessizce yut, deneme hakkı yeme
    }
  },

  /** Ekrandan çıkarken: her şeyi sustur, yoldaki callback'leri geçersiz kıl. */
  stopAll(): void {
    this.stopPlayback();
    try {
      void currentRecorder?.stop();
    } catch {
      /* kayıtta değildi */
    }
    currentRecorder = null;
  },
};
