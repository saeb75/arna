import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { VoiceService } from "../lib/voice";

/**
 * Kısa arayüz sesleri — oyun bloğunda doğru/yanlış. expo-audio zaten var (yeni
 * native bağımlılık YOK); sesler paketlenmiş varlıktır (OTA ile gider).
 * Hiçbiri akışı bekletmez ve hata fırlatmaz.
 */
const SOURCES = {
  correct: require("../../assets/sounds/correct.wav"),
  wrong: require("../../assets/sounds/wrong.wav"),
} as const;

const players: Partial<Record<keyof typeof SOURCES, AudioPlayer>> = {};

function play(name: keyof typeof SOURCES): void {
  // Konuşma kartında kayıttan hemen sonra çalar — çıkış yönlendirmesi otursun
  void VoiceService.playbackReady().then(() => playNow(name));
}

function playNow(name: keyof typeof SOURCES): void {
  try {
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.volume = 0.6;
    void player.seekTo(0).then(() => player.play()).catch(() => undefined);
  } catch {
    // ses çalınamazsa geri bildirim yine görsel + dokunsal — sessizce geç
  }
}

export class SoundService {
  static correct(): void {
    play("correct");
  }

  static wrong(): void {
    play("wrong");
  }
}
