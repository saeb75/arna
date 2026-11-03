import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

/** Dış bağlantılar — yasal sayfalar uygulama içi tarayıcıda, e-posta posta uygulamasında. */
export class BrowserService {
  static async open(url: string): Promise<void> {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      await Linking.openURL(url).catch(() => undefined);
    }
  }

  static async mail(address: string, subject: string): Promise<void> {
    await Linking.openURL(`mailto:${address}?subject=${encodeURIComponent(subject)}`).catch(() => undefined);
  }
}
