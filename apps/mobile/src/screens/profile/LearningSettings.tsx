import { Text, View } from "react-native";
import { router } from "expo-router";
import { Clock, Gauge, Languages, MessageCircle, UserRound } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";

/** Öğrenme ayarları — her satır bir native sheet açar; kayıt PATCH /v1/me/profile. */
export function LearningSettings() {
  const p = useMeStore((s) => s.me?.profile);
  if (!p) return null;
  return (
    <SettingsGroup title={tr.profile.groups.learning}>
      <SettingsRow
        icon={Gauge}
        label={tr.profile.rows.level}
        value={`${p.cefrLevel} · ${tr.levels[p.cefrLevel].name}`}
        display={
          <View className="rounded-full bg-brand/15 px-2.5 py-0.5">
            <Text className="text-sm font-bold text-brand">
              {p.cefrLevel} · {tr.levels[p.cefrLevel].name}
            </Text>
          </View>
        }
        onPress={() => router.push("/settings/level")}
      />
      <SettingsRow icon={MessageCircle} label={tr.profile.rows.track} value={tr.tracks[p.track].title} onPress={() => router.push("/settings/track")} />
      <SettingsRow
        icon={Languages}
        label={tr.profile.rows.tutor}
        value={p.tutorLanguage === "english" ? tr.tutorLanguage.english : tr.tutorLanguage.nativeShort(languageName(p.nativeLanguage || DEFAULT_NATIVE_LANGUAGE))}
        onPress={() => router.push("/settings/tutor")}
      />
      <SettingsRow icon={Clock} label={tr.profile.rows.goal} value={tr.common.minutesLong(p.dailyGoalMinutes)} onPress={() => router.push("/settings/goal")} />
      <SettingsRow icon={UserRound} label={tr.profile.rows.name} value={p.displayName} onPress={() => router.push("/settings/name")} />
    </SettingsGroup>
  );
}
