// Mobil WebView'ın yüklediği avatar sahnesi — /embed/avatar içeriği.
//
// RN tarafı yetkili TTS isteğini kendi atar ve base64 klipleri
// `window.__ARNA_AVATAR__.push(json)` ile buraya iter (JWT buraya asla
// girmez); bu bileşen çalar (clipPlayer), avatarı sürer (sistemine göre 3D
// AvatarScene ya da 2.5D SpriteAvatar — protokol ikisinde aynı) ve olayları
// `window.ReactNativeWebView.postMessage` ile geri bildirir. Protokol:
// @glotmate/contracts avatarProtocol.ts. Masaüstü tarayıcıda (ReactNativeWebView
// yok) olaylar console'a düşer — sayfa elle test edilebilir.
//
// `ended` konuşma başına TAM BİR KEZ gider ama NİHAİ settle sahibi RN'deki
// watchdog'dur — bu sayfa ölse de ders kilitlenmez.
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { AvatarActivity, AvatarCommand, AvatarEvent } from "@glotmate/contracts";
import AvatarView from "@/components/AvatarView";
import { resolveAvatar } from "@/lib/avatarProfiles";
import { createClipPlayer, type ClipPlayer } from "@/lib/clipPlayer";
import { alignmentToLine } from "@/lib/alignment";
import { buildTimeline, isSpeaking, type Timeline } from "@/lib/viseme";

declare global {
  interface Window {
    __ARNA_AVATAR__?: { push: (json: string) => void };
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

function post(event: AvatarEvent): void {
  const json = JSON.stringify(event);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
  else console.info("[avatar-embed]", json);
}

export default function AvatarEmbed() {
  // RN, WebView URL'ine ?avatar=<id> ekler (aktif kimliği YETKİLİ istemci çözer;
  // bu sayfa auth'suz kalır — parametre sır değil, bilinmeyen id Fat Man'e düşer).
  const [spec] = useState(() =>
    resolveAvatar(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("avatar")),
  );
  // sceneReady tek sefer: 3D'de GLB yükleme yöneticisi, 2.5D'de katman yüklemesi bildirir
  const sceneAnnouncedRef = useRef(false);
  const announceScene = () => {
    if (sceneAnnouncedRef.current) return;
    sceneAnnouncedRef.current = true;
    post({ type: "sceneReady" });
  };
  const playerRef = useRef<ClipPlayer | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [playing, setPlaying] = useState(false);
  // Sahne, closure'ları her karede yoklar — güncel timeline'a ref'ten ulaşırlar
  const timelineRef = useRef<Timeline | null>(null);
  timelineRef.current = timeline;
  // RN'nin bildirdiği öğrenci durumu — sahne her karede okur (render tetiklemez)
  const activityRef = useRef<AvatarActivity>("idle");

  useEffect(() => {
    const player = createClipPlayer();
    playerRef.current = player;

    const handle = (json: string) => {
      let cmd: AvatarCommand;
      try {
        cmd = JSON.parse(json) as AvatarCommand;
      } catch {
        post({ type: "error", id: null, code: "bad_command_json" });
        return;
      }
      if (cmd.type === "activity") {
        activityRef.current = cmd.activity;
        return;
      }
      if (cmd.type === "stop") {
        player.stop();
        setPlaying(false);
        setTimeline(null);
        return;
      }
      if (cmd.type === "speak") {
        const { id, clips } = cmd;
        if (clips.length === 0) {
          post({ type: "ended", id });
          return;
        }
        void player.play(clips, {
          onClipStart: (i) => {
            const a = clips[i]?.alignment;
            setTimeline(a ? buildTimeline([alignmentToLine(a)], null) : null);
          },
          onStarted: () => {
            setPlaying(true);
            post({ type: "started", id });
          },
          onEnded: () => {
            setPlaying(false);
            setTimeline(null);
            post({ type: "ended", id });
          },
        });
      }
    };

    window.__ARNA_AVATAR__ = { push: handle };
    post({ type: "ready" });

    // GLB + dokular indiğinde bir kez sceneReady — RN yükleme örtüsünü kaldırır
    const prevOnLoad = THREE.DefaultLoadingManager.onLoad;
    THREE.DefaultLoadingManager.onLoad = () => {
      prevOnLoad?.();
      if (!sceneAnnouncedRef.current) {
        sceneAnnouncedRef.current = true;
        post({ type: "sceneReady" });
      }
    };

    return () => {
      delete window.__ARNA_AVATAR__;
      player.stop();
      THREE.DefaultLoadingManager.onLoad = prevOnLoad;
    };
  }, []);

  const getTime = () => playerRef.current?.getTime() ?? null;
  // Enerji zarfı henüz çözülmediyse (ilk ~100-300 ms) ya da çözülemediyse çene
  // yine oynasın diye timeline "konuşuyor" dediği anlarda sabit sahte seviyeye
  // düşülür. Ses çıkışı bundan bağımsızdır (clipPlayer başlığı).
  const getLevel = () => {
    const p = playerRef.current;
    if (!p) return null;
    const level = p.getLevel();
    if (level !== null) return level;
    const t = p.getTime();
    const tl = timelineRef.current;
    if (t !== null && tl && isSpeaking(tl.intervals, t)) return 0.08;
    return level;
  };

  return (
    <div className="h-dvh w-full">
      <AvatarView
        spec={spec}
        timeline={timeline}
        getTime={getTime}
        getLevel={getLevel}
        greet={playing}
        onSpriteReady={announceScene}
        getActivity={() => activityRef.current}
      />
    </div>
  );
}
