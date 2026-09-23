// Mobil WebView'ın yüklediği avatar sahnesi — /embed/avatar içeriği.
//
// RN tarafı yetkili TTS isteğini kendi atar ve base64 klipleri
// `window.__ARNA_AVATAR__.push(json)` ile buraya iter (JWT buraya asla
// girmez); bu bileşen çalar (clipPlayer), AvatarScene'i sürer ve olayları
// `window.ReactNativeWebView.postMessage` ile geri bildirir. Protokol:
// @glotmate/contracts avatarProtocol.ts. Masaüstü tarayıcıda (ReactNativeWebView
// yok) olaylar console'a düşer — sayfa elle test edilebilir.
//
// `ended` konuşma başına TAM BİR KEZ gider ama NİHAİ settle sahibi RN'deki
// watchdog'dur — bu sayfa ölse de ders kilitlenmez.
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { AvatarCommand, AvatarEvent } from "@glotmate/contracts";
import AvatarScene from "@/components/AvatarScene";
import { resolveAvatarProfile } from "@/lib/avatarProfiles";
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
  const [profile] = useState(() =>
    resolveAvatarProfile(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("avatar")),
  );
  const playerRef = useRef<ClipPlayer | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [playing, setPlaying] = useState(false);
  // Sahne, closure'ları her karede yoklar — güncel timeline'a ref'ten ulaşırlar
  const timelineRef = useRef<Timeline | null>(null);
  timelineRef.current = timeline;

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
    let sceneAnnounced = false;
    THREE.DefaultLoadingManager.onLoad = () => {
      prevOnLoad?.();
      if (!sceneAnnounced) {
        sceneAnnounced = true;
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
  // AudioContext askıda kalırsa analyser 0 döner — çene yine oynasın diye
  // timeline "konuşuyor" dediği anlarda sabit sahte seviyeye düşülür
  const getLevel = () => {
    const p = playerRef.current;
    if (!p) return null;
    const level = p.getLevel();
    if (level !== null && !p.analyserSuspended()) return level;
    const t = p.getTime();
    const tl = timelineRef.current;
    if (t !== null && tl && isSpeaking(tl.intervals, t)) return 0.08;
    return level;
  };

  return (
    <div className="h-dvh w-full">
      <AvatarScene
        profile={profile}
        timeline={timeline}
        getTime={getTime}
        getLevel={getLevel}
        greet={playing}
      />
    </div>
  );
}
