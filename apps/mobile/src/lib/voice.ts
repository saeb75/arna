import { AudioModule, createAudioPlayer, setAudioModeAsync, RecordingPresets, type AudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import type { AvatarClip, RichText } from "@arna/contracts";
import { api } from "../api";
import { AvatarBridge } from "./avatarBridge";

/**
 * SES SERVİSİ — cihaz G/Ç katmanı. Ekranlar BUNA DOKUNAMAZ; yalnız controller
 * kullanır (mobil CLAUDE.md). API erişimi tek istisna olarak buradadır: ses
 * verisi bir "veri akışı" değil G/Ç'dir, controller'a taşımak sadece dolaylılık
 * eklerdi.
 *
 * KÖK KURAL — `onEnd` TAM BİR KEZ: ders akışı bu callback'in içinde ilerlediği
 * için kaybolan her callback dersi kilitler, iki kez çalışan her callback bir
 * beat atlatır. `settle()` bu yüzden didJustFinish + hata + watchdog + söz kesmeyi
 * (`cutIn`) tek noktada birleştirir (web'deki desenin aynısı).
 */

let currentPlayer: AudioPlayer | null = null;
let currentRecorder: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
/**
 * Bas-konuş yarış koruması: kısa basışta parmak, startRecording'in async
 * hazırlığı (~200-400ms) bitmeden kalkabilir. stopRecording önce bu promise'i
 * bekler — yoksa kayıt sahipsiz kalır ve hiçbir şey gönderilmez.
 */
let startPromise: Promise<boolean> | null = null;

/** STT kaydı: AAC/m4a, mono 64kbps — Whisper zaten 16kHz mono'ya indirger, stereo 128k sadece yüklemeyi şişirir */
const STT_RECORDING = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64_000,
};
/** Geç gelen eski TTS yanıtı akışı ilerletemesin diye nesil sayacı */
let generation = 0;
/**
 * Yürüyen konuşmanın iki tutamağı — SÖZ KESME (`skipSpeaking`) bunun üzerinden çalışır.
 *
 * `settle`: kapanışı ÇALIŞTIR (onEnd → akış ilerler).
 * `abandon`: kapanışı ve TÜM zamanlayıcılarını söndür, onEnd'i hiç çağırma.
 *
 * İkisi ayrı olmak zorunda: `stopPlayback` sesi susturur ama settle'ı çağıramaz
 * (ekrandan çıkışta ders ilerlemesin), buna karşılık zamanlayıcıları da sahipsiz
 * bırakamaz — bırakınca 30sn/klip watchdog'u ve 4sn avatar start-watchdog'u ölü
 * konuşma adına ateşlenip bir SONRAKİ konuşmayı bozuyordu.
 */
let current: { settle: () => void; abandon: () => void } | null = null;

export const VoiceService = {
  async init(): Promise<void> {
    // allowsRecording BURADA AÇILMAZ: iOS kayıt modunu görünce ÇIKIŞI hoparlör
    // yerine kulaklık alıcısına yönlendirir (kısık/duyulmaz ses — klasik tuzak).
    // Kayıt modu yalnız kayıt sırasında açılır, biter bitmez kapanır.
    await setAudioModeAsync({
      playsInSilentMode: true, // iOS sessiz anahtarında da ders sesi çalsın
      allowsRecording: false,
    });
    await AudioModule.requestRecordingPermissionsAsync();
  },

  /**
   * Parçaları seslendir; ses bitince (ya da TTS düşünce) onEnd — TAM BİR KEZ.
   * Sunucu ardışık aynı-dil parçaları tek klipte birleştirir; klipler sırayla çalar.
   */
  async speak(sessionId: string, runs: RichText, onEnd: () => void): Promise<void> {
    // SIRA KRİTİK: önce eskiyi sustur (generation++ yapar), SONRA bu konuşmanın
    // neslini al. İlk sürüm tersini yapıyordu ve kendi neslini anında geçersiz
    // kılıyordu — TTS cevabı gelir gelmez `gen !== generation` tutuyor, klipler
    // HİÇ ÇALINMADAN settle çağrılıyordu. Ders "çalışıyordu" ama hep sessizdi;
    // watchdog akışı ilerlettiği için hata da sessiz kaldı.
    this.stopPlayback();
    const gen = generation; // stopPlayback zaten artırdı — yeni nesil bu

    let settled = false;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    let startWatchdog: ReturnType<typeof setTimeout> | null = null;
    /** Bu konuşmayı kapat ve zamanlayıcılarını söndür — onEnd ÇAĞRILMAZ. */
    const abandon = () => {
      settled = true;
      if (watchdog) clearTimeout(watchdog);
      if (startWatchdog) clearTimeout(startWatchdog);
    };
    const settle = () => {
      if (settled) return;
      abandon();
      if (current?.settle === settle) current = null;
      onEnd();
    };
    current = { settle, abandon }; // söz kesilirse skipSpeaking bunu HEMEN çalıştırır

    let clips: AvatarClip[] = [];
    try {
      const res = await api.post(`/v1/sessions/${sessionId}/tts`, {
        runs: runs.map((r) => ({ lang: r.lang, text: r.text })),
      });
      clips = (res.data as { clips: AvatarClip[] }).clips ?? [];
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
    // Bu dış watchdog HER İKİ rota için de nihai emniyettir (avatar dahil).
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
        // Nesil kontrolü AWAIT'TEN SONRA da şart: yazma 50-200ms sürüyor ve o
        // aralıkta söz kesilirse kesilen cümle YEPYENİ bir oynatıcıyla çalmaya
        // başlıyor — stopPlayback'in arkasından, susturulamaz hâlde.
        if (gen !== generation) {
          settle();
          return;
        }
        const player = createAudioPlayer({ uri: path });
        currentPlayer = player;
        let clipDone = false; // didJustFinish birden çok status'ta raporlanabilir
        player.addListener("playbackStatusUpdate", (status) => {
          if (gen !== generation) {
            try {
              player.remove();
            } catch {
              /* stopPlayback zaten kaldırmış olabilir (söz kesme) */
            }
            settle();
            return;
          }
          if (status.didJustFinish && !clipDone) {
            clipDone = true;
            try {
              player.remove();
            } catch {
              /* zaten kaldırılmış */
            }
            if (index + 1 < clips.length) void playClip(index + 1);
            else settle();
          }
        });
        player.play();
      } catch {
        settle(); // tek klip bile çalınamazsa akış ilerler
      }
    };

    // ROTA SEÇİMİ (her speak anında): avatar köprüsü hazırsa ses WebView
    // içinde çalar (dudak senkronu ses+timeline aynı bağlamda olmalı — mimari
    // karar, bkz. contracts/avatarProtocol.ts). Köprü yoksa/ölürse expo-audio.
    if (AvatarBridge.isReady()) {
      // Start-watchdog: 4sn içinde `started` gelmezse sayfa takılmış demektir —
      // toparla (reload) ve AYNI klipleri expo-audio'yla çal. Klipler zaten
      // elimizde, fallback bedava; konuşma asla sessizce yutulmaz.
      startWatchdog = setTimeout(() => {
        // Bayat nesil: bu konuşma kesilmiş. recover() burada SONRAKİ konuşmanın
        // köprüsünü sıfırlar ve cevabı baştan çaldırırdı (öğrenci cevabı iki kez duyar).
        if (gen !== generation) {
          settle();
          return;
        }
        console.warn("[voice] avatar 4sn'de started vermedi — expo-audio'ya düşülüyor");
        AvatarBridge.recover();
        if (gen === generation) void playClip(0);
        else settle();
      }, 4_000);
      AvatarBridge.speak(gen, clips, {
        onStarted: () => clearTimeout(startWatchdog),
        onEnded: () => {
          clearTimeout(startWatchdog);
          settle();
        },
        onError: (code) => {
          clearTimeout(startWatchdog);
          if (gen !== generation) {
            settle(); // bayat konuşma — expo-audio yolundaki gen davranışıyla aynı
            return;
          }
          console.warn("[voice] avatar hatası:", code, "— expo-audio'ya düşülüyor");
          void playClip(0);
        },
      });
      return;
    }
    void playClip(0);
  },

  stopPlayback(): void {
    generation++; // yoldaki TTS yanıtlarını ve dinleyicileri geçersiz kıl
    const pending = current;
    current = null;
    pending?.abandon(); // onEnd ÇAĞRILMAZ: ekrandan çıkışta ders ilerlemesin
    try {
      currentPlayer?.pause(); // remove() tek başına hoparlörü anında susturmuyor
      currentPlayer?.remove();
    } catch {
      /* zaten kaldırılmış olabilir */
    }
    currentPlayer = null;
    try {
      AvatarBridge.stop(); // WebView'da çalan varsa sustur (köprü yoksa no-op)
    } catch {
      /* köprü bağlı değildi */
    }
  },

  /**
   * SÖZ KESME (web'deki `skipSpeaking` karşılığı): sesi kes ve bekleyen `onEnd`'i
   * HEMEN çalıştır.
   *
   * Akış `onEnd` zincirinde yaşadığı için kesme kapanışı YUTMAMALI; yutulursa ders
   * kilitlenir (web'de tam olarak bu yüzden konuşma sırasında girdi kapalıydı).
   * `settled` bayrağı "TAM BİR kez" kuralını korur: yolda kalan /tts yanıtı, avatar
   * `onEnded`'i ve watchdog'lar aynı bayrağa çarpıp no-op olur.
   */
  skipSpeaking(): void {
    const pending = current;
    current = null; // stopPlayback bunu artık abandon EDEMEZ — settle bizde
    this.stopPlayback();
    pending?.settle();
  },

  async startRecording(): Promise<boolean> {
    const attempt = (async () => {
      try {
        const perm = await AudioModule.getRecordingPermissionsAsync();
        if (!perm.granted) {
          const asked = await AudioModule.requestRecordingPermissionsAsync();
          if (!asked.granted) {
            console.warn("[voice] mikrofon izni verilmedi — kayıt başlatılamıyor");
            return false;
          }
        }
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        const recorder = new AudioModule.AudioRecorder(STT_RECORDING);
        // Seçenekler prepare'A DA verilmek ZORUNDA: yalnız constructor'a verilince
        // expo-audio hazırlıkta yok saydı ve m4a içine HAM PCM yazdı (8.6sn = 1.5MB)
        // — OpenAI "corrupted or unsupported" diye reddetti (502 stt_failed'in kökü).
        await recorder.prepareToRecordAsync(STT_RECORDING);
        recorder.record();
        currentRecorder = recorder;
        return true;
      } catch (err) {
        console.warn("[voice] kayıt başlatılamadı:", err);
        // Kayıt modu AÇIK kalmasın: iOS çıkışı alıcıya yönlendirir ve dersin
        // geri kalanı kısık duyulur (bkz. init() yorumu).
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
        return false;
      }
    })();
    startPromise = attempt;
    return attempt;
  },

  /** Kaydı durdur, STT'ye gönder, metni döndür. Kısa/boş kayıtta null — hak yemez. */
  async stopRecording(sessionId: string): Promise<string | null> {
    // Parmak, startRecording'in hazırlığından önce kalktıysa hazırlığı bekle —
    // yoksa currentRecorder hâlâ null ve mikrofon açık kalır.
    if (startPromise) {
      await startPromise.catch(() => false);
      startPromise = null;
    }
    const recorder = currentRecorder;
    currentRecorder = null;
    if (!recorder) {
      // Kayıt hiç kurulamadı ama mod açılmış olabilir — geri al (bkz. init()).
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
      return null;
    }
    try {
      await recorder.stop();
      // Kayıt modundan HEMEN çık — açık kalırsa sonraki TTS alıcıdan kısık çalar
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      const uri = recorder.uri;
      if (!uri) {
        console.warn("[voice] kayıt durdu ama dosya URI'si yok");
        return null;
      }

      const form = new FormData();
      // RN FormData dosya nesnesi: { uri, name, type } — backend mime map'inde audio/mp4 var
      form.append("file", { uri, name: "speech.m4a", type: "audio/mp4" } as unknown as Blob);
      const res = await api.post(`/v1/sessions/${sessionId}/stt`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const text = (res.data as { text?: string }).text?.trim();
      if (!text) console.warn("[voice] STT boş metin döndürdü — mikrofona ses gitmiyor olabilir (simülatörde Mac mikrofon girişini kontrol et)");
      return text || null;
    } catch (err) {
      // audio_too_short dahil hak yemez; ama SEBEBİ terminalde görünsün
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.warn("[voice] STT gönderimi başarısız:", e.response?.status ?? "", e.response?.data ?? e.message ?? err);
      return null;
    }
  },

  /** Ekrandan çıkarken: her şeyi sustur, yoldaki callback'leri geçersiz kıl. */
  stopAll(): void {
    this.stopPlayback();
    const pending = startPromise;
    startPromise = null;
    void (async () => {
      if (pending) await pending.catch(() => false); // hazırlıktaki kayıt sahipsiz kalmasın
      try {
        await currentRecorder?.stop();
      } catch {
        /* kayıtta değildi */
      }
      currentRecorder = null;
      // Kayıt ortasında çıkıldıysa ses modunu geri al — yoksa sonraki ders kısık çalar
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
    })();
  },
};
