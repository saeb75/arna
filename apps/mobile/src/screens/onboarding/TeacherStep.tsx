import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { CtaButton } from "../../components/ui/CtaButton";
import { Skeleton } from "../../components/ui/Skeleton";
import { TutorGrid } from "../../components/shared/TutorGrid";
import { OnboardingController } from "../../controllers/OnboardingController";
import { TutorController } from "../../controllers/TutorController";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useTutorsStore } from "../../stores/useTutorsStore";
import { QuestionShell, type ShellProps } from "./QuestionShell";

/**
 * Öğretmen seçimi (yüz + ses + ad) — açıklama DİLİ sorusundan (`TutorStep`) ayrı.
 * Varsayılan ön seçili; karta dokunmak seçer ve öğretmenin sesini çalar. Kendiliğinden
 * ilerlemez (sesleri karşılaştırabilsin) — "{ad} ile devam et".
 */
export function TeacherStep({ shell }: { shell: ShellProps }) {
  const tutors = useTutorsStore((s) => s.tutors);
  const failed = useTutorsStore((s) => s.error !== null);
  const sampling = useTutorsStore((s) => s.sampling);
  const selected = useOnboardingStore((s) => s.tutorId);
  const name = useDraftTutorName();

  useEffect(() => {
    if (tutors?.length) OnboardingController.preselectTutor();
    // Liste boş ya da alınamadı → bu adım yok sayılır (sunucu varsayılanı kullanır)
    else if (tutors || failed) OnboardingController.next();
  }, [tutors, failed]);

  // Adımdan çıkınca (ileri/geri) ses susar
  useEffect(() => () => TutorController.stopSample(), []);

  return (
    <QuestionShell
      {...shell}
      title={tr.onboarding.teacher.title}
      body={tr.onboarding.teacher.body}
      footer={
        <CtaButton
          label={tr.onboarding.teacher.cta(name)}
          disabled={!tutors?.length || !selected}
          onPress={() => {
            TutorController.stopSample();
            OnboardingController.next();
          }}
        />
      }
    >
      <ScrollView contentContainerClassName="px-6 pb-6">
        {tutors?.length ? (
          <TutorGrid
            tutors={tutors}
            selectedId={selected}
            samplingId={sampling}
            onPick={(tutorId) => {
              OnboardingController.answer({ tutorId });
              void TutorController.playSample(tutorId);
            }}
          />
        ) : (
          <View className="flex-row justify-between">
            <Skeleton className="aspect-[4/5] w-[48.5%] rounded-3xl" />
            <Skeleton className="aspect-[4/5] w-[48.5%] rounded-3xl" />
          </View>
        )}
      </ScrollView>
    </QuestionShell>
  );
}
