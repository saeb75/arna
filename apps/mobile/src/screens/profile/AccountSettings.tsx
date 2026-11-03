import { Alert } from "react-native";
import { LogOut, Trash } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { AuthController } from "../../controllers/AuthController";
import { tr } from "../../i18n/tr";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Hesap: çıkış (yalnız kalıcı hesapta — misafirin çıkacağı yer yok) ve hesap
 * silme (herkes: misafirin de kişisel verisi var). İkisi de sistem onayıyla.
 */
export function AccountSettings() {
  const anonymous = useAuthStore((s) => s.isAnonymous);
  const busy = useAuthStore((s) => s.busy);
  return (
    <SettingsGroup title={tr.profile.groups.account}>
      {!anonymous ? (
        <SettingsRow
          icon={LogOut}
          label={tr.profile.rows.signOut}
          accessory="none"
          onPress={() =>
            Alert.alert(tr.profile.signOutTitle, tr.profile.signOutBody, [
              { text: tr.common.cancel, style: "cancel" },
              { text: tr.profile.rows.signOut, style: "destructive", onPress: () => void AuthController.signOut() },
            ])
          }
        />
      ) : null}
      <SettingsRow
        icon={Trash}
        label={tr.profile.rows.delete}
        accessory="none"
        destructive
        busy={busy}
        onPress={() =>
          Alert.alert(tr.profile.deleteTitle, tr.profile.deleteBody, [
            { text: tr.common.cancel, style: "cancel" },
            { text: tr.profile.deleteConfirm, style: "destructive", onPress: () => void AuthController.deleteAccount() },
          ])
        }
      />
    </SettingsGroup>
  );
}
