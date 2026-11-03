import { CreditCard, RotateCcw } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { PaywallController } from "../../controllers/PaywallController";
import { ProController } from "../../controllers/ProController";
import { usePro } from "../../hooks/usePro";
import { tr } from "../../i18n/tr";
import { useProStore } from "../../stores/useProStore";

/** Abonelik: satın alımı geri yükle; Pro'da mağazanın abonelik sayfası. */
export function SubscriptionSettings() {
  const pro = usePro();
  const restoring = useProStore((s) => s.restoring);
  return (
    <SettingsGroup title={tr.profile.groups.subscription}>
      <SettingsRow icon={RotateCcw} label={tr.profile.rows.restore} accessory="none" busy={restoring} onPress={() => void PaywallController.restore()} />
      {pro ? <SettingsRow icon={CreditCard} label={tr.profile.rows.manage} accessory="external" onPress={() => void ProController.manageSubscriptions()} /> : null}
    </SettingsGroup>
  );
}
