import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { WebView } from "react-native-webview";
import { AVATAR_SYSTEM_OF, avatarIdSchema, type AvatarActivity } from "@glotmate/contracts";
import { SPRITE_RIG_GEOMETRY } from "@glotmate/contracts/avatar";
import { SPRITE_ASSETS } from "../../domain/spriteAssets";
import { tr } from "../../i18n/tr";
import { AvatarBridge } from "../../lib/avatarBridge";
import { Skeleton } from "../ui/Skeleton";
import { SpeakingIndicator } from "./SpeakingIndicator";
import { SpriteAvatar } from "./SpriteAvatar";

/**
 * Avatar sahnesi — apps/web'in /embed/avatar sayfasını WebView'da yükler
 * (ders VE rol yapma ekranı paylaşır). Ses, avatar aktifken WebView İÇİNDE
 * çalar (dudak senkronu); bu bileşen yalnız köprünün fiziksel ucudur:
 * attach/detach + onMessage → AvatarBridge. Karar vermez, store'a yazmaz.
 *
 * EXPO_PUBLIC_AVATAR_URL boşsa ya da sayfa yüklenemezse SpeakingIndicator.
 *
 * 2.5D avatarlar WebView'a HİÇ girmez (5 Kas 2026): native SpriteAvatar çizer,
 * köprü bağlanmadığı için VoiceService sesi expo-audio'yla çalar ve avatar ağzını
 * SpeechClock'tan sürer. Sebep: WKWebView'daki Web Audio mikrofon sonrası ses
 * oturumu değişiminde askıya düşüp sesi yutuyordu (ağız oynuyor, ses yok). 3D
 * (three.js) WebView'da kalır — expo-gl'de draco/52-morph güvenilmez.
 */
export function AvatarStage({
  speaking,
  avatarId,
  tutorName,
  activity = "idle",
  fill = false,
}: {
  speaking: boolean;
  avatarId: string;
  /** Öğretmenin adı — avatarsız göstergede ve yükleme yazısında */
  tutorName: string;
  /** öğrenci konuşuyor → dinler, yanıt bekleniyor → düşünür (avatar jestleri) */
  activity?: AvatarActivity;
  /**
   * Ebeveyni doldur (çerçeve ve ölçü ebeveynde): ders ekranı sahneyi büyük ↔
   * küçük arasında AYNI WebView ile canlandırır — yeniden yüklemeden.
   */
  fill?: boolean;
}) {
  const parsedId = avatarIdSchema.safeParse(avatarId);
  const spriteId = parsedId.success && AVATAR_SYSTEM_OF[parsedId.data] === "2.5d" ? parsedId.data : null;
  const rig = spriteId ? SPRITE_RIG_GEOMETRY[spriteId] : undefined;
  const spriteAssets = spriteId ? SPRITE_ASSETS[spriteId] : undefined;
  const native = Boolean(rig && spriteAssets);
  // Native 2.5D'de WebView adresi kurulmaz → köprü bağlanmaz → ses expo-audio yolunda
  const base = native ? undefined : process.env.EXPO_PUBLIC_AVATAR_URL;
  // Aktif avatar YETKİLİ istemcide çözüldü (GET /v1/avatar) — embed sayfası auth'suz, kimlik URL'de
  const url = base ? `${base}${base.includes("?") ? "&" : "?"}avatar=${avatarId}` : undefined;
  const webviewRef = useRef<WebView>(null);
  const [failed, setFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!url || failed) return;
    AvatarBridge.attach({
      inject: (js) => webviewRef.current?.injectJavaScript(js),
      reload: () => webviewRef.current?.reload(),
    });
    return () => AvatarBridge.detach();
  }, [url, failed]);

  useEffect(() => {
    AvatarBridge.setActivity(activity);
  }, [activity]);

  if (rig && spriteAssets) {
    return (
      <View className={fill ? "flex-1" : "px-4 pb-2 pt-1"}>
        <View className={fill ? "flex-1 overflow-hidden bg-card" : "aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-card"}>
          <SpriteAvatar rig={rig} assets={spriteAssets} activity={activity} />
        </View>
      </View>
    );
  }

  if (!url || failed) {
    return fill ? (
      <View className="flex-1 items-center justify-center bg-card">
        <SpeakingIndicator speaking={speaking} name={tutorName} />
      </View>
    ) : (
      <SpeakingIndicator speaking={speaking} name={tutorName} />
    );
  }

  return (
    <View className={fill ? "flex-1" : "px-4 pb-2 pt-1"}>
      {/* 4:3 YATAY, genişlik sürücü: kadraj göğüsten yukarı (AvatarScene FRAMING_DISTANCE) */}
      <View className={fill ? "flex-1 overflow-hidden bg-card" : "aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-card"}>
        <WebView
          ref={webviewRef}
          source={{ uri: url }}
          className="flex-1 bg-card"
          // WKWebView'da sayfa içi otomatik ses için İKİSİ de gerekli
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          onMessage={(e) => {
            const type = AvatarBridge.handleMessage(e.nativeEvent.data);
            if (type === "sceneReady") setSceneReady(true);
          }}
          // Sayfa gidiyor/yeniden yükleniyor: bekleyen konuşmayı düşür (VoiceService expo-audio'ya döner)
          onLoadStart={() => {
            AvatarBridge.reset("navigating");
            setSceneReady(false);
          }}
          // iOS içerik süreci öldü / Android render süreci gitti: toparla
          onContentProcessDidTerminate={() => {
            AvatarBridge.reset("process_died");
            setSceneReady(false);
            webviewRef.current?.reload();
          }}
          onRenderProcessGone={() => {
            AvatarBridge.reset("process_died");
            setSceneReady(false);
            webviewRef.current?.reload();
          }}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
        />
        {!sceneReady && (
          <Animated.View exiting={FadeOut.duration(300)} className="absolute inset-0 items-center justify-center gap-3 bg-card">
            <Skeleton className="size-24 rounded-full" />
            <Text className="text-xs font-semibold text-muted-foreground">{tr.lesson.avatarLoading(tutorName)}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
