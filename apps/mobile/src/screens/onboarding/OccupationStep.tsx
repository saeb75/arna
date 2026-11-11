import { KeyboardAvoidingView, Platform, View } from "react-native";
import Animated from "react-native-reanimated";
import { CtaButton } from "../../components/ui/CtaButton";
import { TextButton } from "../../components/ui/TextButton";
import { TextField } from "../../components/ui/TextField";
import { OnboardingController } from "../../controllers/OnboardingController";
import { useDraftTutorName } from "../../hooks/useTutorName";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/** Meslek — opsiyonel; yalnız canlı sohbette kullanılır (paylaşımlı içeriğe ASLA girmez). */
export function OccupationStep({ shell }: { shell: ShellProps }) {
  const occupation = useOnboardingStore((s) => s.occupation);
  const tutorName = useDraftTutorName();
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <QuestionShell
        {...shell}
        title={tr.onboarding.occupation.title}
        body={tr.onboarding.occupation.body(tutorName)}
        footer={
          <View className="gap-1">
            <CtaButton label={tr.common.continue} disabled={!occupation.trim()} onPress={() => OnboardingController.next()} />
            <TextButton
              center
              label={tr.common.skip}
              onPress={() => {
                OnboardingController.answer({ occupation: "" });
                OnboardingController.next();
              }}
            />
          </View>
        }
      >
        <Animated.View entering={rise(2)} className="px-6">
          <TextField
            large
            value={occupation}
            maxLength={120}
            returnKeyType="next"
            placeholder={tr.onboarding.occupation.placeholder}
            onChangeText={(v) => OnboardingController.answer({ occupation: v })}
            onSubmitEditing={() => occupation.trim() && OnboardingController.next()}
          />
        </Animated.View>
      </QuestionShell>
    </KeyboardAvoidingView>
  );
}
