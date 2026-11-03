import { FileText, Mail, Shield } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { LEGAL, SUPPORT_EMAIL } from "../../config/legal";
import { tr } from "../../i18n/tr";
import { BrowserService } from "../../services/BrowserService";

/** Destek: bize yaz, gizlilik, koşullar (uygulama dışı açılır). */
export function SupportSettings() {
  return (
    <SettingsGroup title={tr.profile.groups.support}>
      <SettingsRow icon={Mail} label={tr.profile.rows.contact} accessory="external" onPress={() => void BrowserService.mail(SUPPORT_EMAIL, "GlotMate")} />
      <SettingsRow icon={Shield} label={tr.profile.rows.privacy} accessory="external" onPress={() => void BrowserService.open(LEGAL.privacy)} />
      <SettingsRow icon={FileText} label={tr.profile.rows.terms} accessory="external" onPress={() => void BrowserService.open(LEGAL.terms)} />
    </SettingsGroup>
  );
}
