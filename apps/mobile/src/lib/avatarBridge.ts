// Avatar köprüsü — RN ↔ WebView (/embed/avatar) mesajlaşmasının TEK sahibi.
// voice.ts ile aynı katman: cihaz G/Ç, store'a yazmaz, ekranlar dokunAMAZ
// (AvatarStage yalnız attach/detach + handleMessage için istisnadır — o da
// köprünün fiziksel ucu olduğu için).
//
// Tasarım: tek bekleyen konuşma slotu. `speak(id, ...)`teki id VoiceService'in
// generation sayacıdır; started/ended/error yalnız bekleyen slotun id'siyle
// eşleşince işlenir — bayat bir `ended` asla yanlış konuşmayı sonlandıramaz.
// NİHAİ settle sahibi VoiceService'in watchdog'u: köprü ölürse onError/timeout
// üzerinden expo-audio fallback devreye girer, ders ASLA kilitlenmez.

import type { AvatarClip, AvatarCommand, AvatarEvent } from "@glotmate/contracts";

interface WebViewHandle {
  inject: (js: string) => void;
  reload: () => void;
}

interface PendingSpeak {
  id: number;
  onStarted: () => void;
  onEnded: () => void;
  onError: (code: string) => void;
}

let handle: WebViewHandle | null = null;
let ready = false;
let sceneReady = false;
let pending: PendingSpeak | null = null;

function send(cmd: AvatarCommand): void {
  if (!handle) return;
  // Çifte stringify: payload güvenli JS string literali olur (base64 dahil);
  // sayfa JSON.parse eder. RN→web postMessage bilinçli KULLANILMIYOR
  // (platformlar arası event-target tutarsız).
  const literal = JSON.stringify(JSON.stringify(cmd));
  handle.inject(`window.__ARNA_AVATAR__&&window.__ARNA_AVATAR__.push(${literal});true;`);
}

export const AvatarBridge = {
  /** AvatarStage mount'ta çağırır */
  attach(h: WebViewHandle): void {
    handle = h;
    ready = false;
    sceneReady = false;
  },

  /** AvatarStage unmount'ta çağırır */
  detach(): void {
    this.reset("detached");
    handle = null;
  },

  /** Köprü konuşma taşıyabilir mi (sayfa `ready` dedi ve hâlâ bağlıyız) */
  isReady(): boolean {
    return ready && handle !== null;
  },

  /** GLB inip ilk render alındı mı — AvatarStage örtüsü için */
  isSceneReady(): boolean {
    return sceneReady;
  },

  /**
   * Klipleri WebView'a gönder. Yeni speak eskisini düşürür (VoiceService'te
   * generation zaten ilerlemiştir; eski slotun settle'ı gen korumasına takılır).
   */
  speak(id: number, clips: AvatarClip[], cb: Omit<PendingSpeak, "id">): void {
    if (pending) {
      const old = pending;
      pending = null;
      old.onError("superseded");
    }
    pending = { id, ...cb };
    send({ type: "speak", id, clips });
  },

  stop(): void {
    pending = null; // durdurulan konuşmanın ended'i artık kimseyi ilgilendirmez
    send({ type: "stop" });
  },

  /** Sayfa gitti/yeniden yükleniyor: bekleyeni düşür, hazırlığı sıfırla */
  reset(reason: string): void {
    ready = false;
    sceneReady = false;
    if (pending) {
      const old = pending;
      pending = null;
      old.onError(reason);
    }
  },

  /**
   * WebView onMessage ham verisi. Dönüş: olay tipi (AvatarStage yalnız
   * sceneReady/ready için yerel örtü durumunu günceller, karar vermez).
   */
  handleMessage(raw: string): AvatarEvent["type"] | null {
    let event: AvatarEvent;
    try {
      event = JSON.parse(raw) as AvatarEvent;
    } catch {
      return null;
    }
    switch (event.type) {
      case "ready":
        ready = true;
        break;
      case "sceneReady":
        sceneReady = true;
        break;
      case "started":
        if (pending && pending.id === event.id) pending.onStarted();
        break;
      case "ended":
        if (pending && pending.id === event.id) {
          const p = pending;
          pending = null;
          p.onEnded();
        }
        break;
      case "error":
        if (pending && (event.id === null || pending.id === event.id)) {
          const p = pending;
          pending = null;
          p.onError(event.code);
        }
        break;
    }
    return event.type;
  },

  /** Start-watchdog tetiklenince VoiceService çağırır: sayfayı kendine getir */
  recover(): void {
    this.reset("recovering");
    handle?.reload();
  },
};
