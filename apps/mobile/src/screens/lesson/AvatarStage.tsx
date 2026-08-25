import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AvatarBridge } from "../../lib/avatarBridge";
import { SpeakingIndicator } from "./SpeakingIndicator";

/**
 * Avatar sahnesi — apps/web'in /embed/avatar sayfasını WebView'da yükler.
 * Ses, avatar aktifken WebView İÇİNDE çalar (dudak senkronu için ses+timeline
 * aynı bağlamda olmalı); bu bileşen yalnız köprünün fiziksel ucudur:
 * attach/detach + onMessage → AvatarBridge. Karar vermez, store'a yazmaz.
 * Konuşma rotası seçimi ve settle sahipliği VoiceService'tedir.
 *
 * EXPO_PUBLIC_AVATAR_URL boşsa veya sayfa yüklenemezse eski SpeakingIndicator
 * gösterilir — avatar bir süs, ders onsuz da aynen çalışır.
 */
export function AvatarStage({ speaking }: { speaking: boolean }) {
  const url = process.env.EXPO_PUBLIC_AVATAR_URL;
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

  if (!url || failed) return <SpeakingIndicator speaking={speaking} />;

  return (
    <View className="items-center py-2">
      <View className="aspect-[3/4] h-[34vh] overflow-hidden rounded-2xl bg-card">
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
          // Sayfa gidiyor/yeniden yükleniyor: bekleyen konuşmayı düşür
          // (VoiceService expo-audio'ya döner), örtüyü geri getir
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
          <View className="absolute inset-0 items-center justify-center bg-card">
            <ActivityIndicator color="#6366f1" />
            <Text className="mt-2 text-xs text-muted">Emma hazırlanıyor…</Text>
          </View>
        )}
      </View>
    </View>
  );
}
