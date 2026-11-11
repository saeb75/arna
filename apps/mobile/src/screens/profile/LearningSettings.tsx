import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Clock, Gauge, GraduationCap, Languages, MessageCircle, UserRound } from "lucide-react-native";
import { SettingsGroup } from "../../components/shared/SettingsGroup";
import { SettingsRow } from "../../components/shared/SettingsRow";
import { DEFAULT_NATIVE_LANGUAGE, languageName } from "../../domain/language";
import { tutorPortrait } from "../../domain/tutors";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";

/** Öğrenme ayarları — her satır bir native sheet açar; kayıt PATCH /v1/me/profile. */
export function LearningSettings() {
  const p = useMeStore((s) => s.me?.profile);
  // Sunucunun çözdüğü öğretmen; null = öğretmen kaydı yok → satır görünmez (eski davranış)
  const tutor = useMeStore((s) => s.me?.tutor ?? null);
  if (!p) return null;
  const portrait = tutor ? tutorPortrait(tutor.avatarId) : null;
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
      {tutor ? (
        <SettingsRow
          icon={GraduationCap}
          label={tr.profile.rows.teacher}
          value={tutor.name}
          display={
            <View className="max-w-[45%] flex-row items-center gap-2">
              {portrait !== null ? (
                <View className="size-7 overflow-hidden rounded-full border border-border bg-muted">
                  {/* expo-image NativeWind sınıfı almaz — ölçü style ile */}
                  <Image source={portrait} contentFit="cover" contentPosition="top" transition={0} style={{ width: "100%", height: "100%" }} />
                </View>
              ) : null}
              <Text numberOfLines={1} className="text-[15px] text-muted-foreground">
                {tutor.name}
              </Text>
            </View>
          }
          onPress={() => router.push("/settings/teacher")}
        />
      ) : null}
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
