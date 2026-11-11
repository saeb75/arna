import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { TutorGrid } from "../../components/shared/TutorGrid";
import { CtaButton } from "../../components/ui/CtaButton";
import { LoadFailed } from "../../components/ui/LoadFailed";
import { SheetHeader } from "../../components/ui/SheetHeader";
import { Skeleton } from "../../components/ui/Skeleton";
import { TutorController } from "../../controllers/TutorController";
import { tr } from "../../i18n/tr";
import { useMeStore } from "../../stores/useMeStore";
import { useTutorsStore } from "../../stores/useTutorsStore";
import { closeSheetSoon } from "./closeSheet";

/**
 * Öğretmen (yüz + ses + ad) — açıklama DİLİ `TutorSheet`te. Karta dokunmak seçer ve
 * sesini çalar; kayıt "Kaydet"le (dokunur dokunmaz kapanmaz: sesleri karşılaştırabilsin).
 * Taslak seçim sunumsal yerel durum (NameSheet deseni). Bir sonraki dersten geçerli.
 */
export function TeacherSheet() {
  const current = useMeStore((s) => s.me?.tutor?.id ?? null);
  const saving = useMeStore((s) => s.saving);
  const tutors = useTutorsStore((s) => s.tutors);
  const failed = useTutorsStore((s) => s.error !== null);
  const sampling = useTutorsStore((s) => s.sampling);
  const [picked, setPicked] = useState<string | null>(current);

  useEffect(() => {
    void TutorController.load();
    return () => TutorController.stopSample(); // sheet kapanınca ses susar
  }, []);

  const save = async () => {
    TutorController.stopSample();
    if (!picked || picked === current) return closeSheetSoon();
    if (await TutorController.save(picked)) closeSheetSoon();
  };

  return (
    // Kaydırıcı sheet'in TEK ve KÖK çocuğu (LevelSheet notu)
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-4 px-5 pb-10 pt-8">
      <SheetHeader title={tr.settings.teacherTitle} body={tr.settings.teacherBody} />
      {tutors?.length ? (
        <TutorGrid
          tutors={tutors}
          selectedId={picked}
          samplingId={sampling}
          delay={0}
          onPick={(id) => {
            setPicked(id);
            void TutorController.playSample(id);
          }}
        />
      ) : tutors ? null : failed ? (
        <LoadFailed onRetry={() => void TutorController.load()} />
      ) : (
        <View className="flex-row justify-between">
          <Skeleton className="aspect-[4/5] w-[48.5%] rounded-3xl" />
          <Skeleton className="aspect-[4/5] w-[48.5%] rounded-3xl" />
        </View>
      )}
      <CtaButton label={tr.common.save} busy={saving} disabled={!tutors?.length || !picked} onPress={() => void save()} />
    </ScrollView>
  );
}
