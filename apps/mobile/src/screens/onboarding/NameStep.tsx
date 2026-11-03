import { KeyboardAvoidingView, Platform, View } from "react-native";
import Animated from "react-native-reanimated";
import { CtaButton } from "../../components/ui/CtaButton";
import { TextField } from "../../components/ui/TextField";
import { OnboardingController } from "../../controllers/OnboardingController";
import { tr } from "../../i18n/tr";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { QuestionShell, rise, type ShellProps } from "./QuestionShell";

/** Ad — Emma derslerde seni adınla selamlar. */
export function NameStep({ shell }: { shell: ShellProps }) {
  const name = useOnboardingStore((s) => s.displayName);
  const ok = name.trim().length > 0;
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <QuestionShell
        {...shell}
        title={tr.onboarding.name.title}
        body={tr.onboarding.name.body}
        footer={<CtaButton label={tr.common.continue} disabled={!ok} onPress={() => OnboardingController.next()} />}
      >
        <Animated.View entering={rise(2)} className="px-6">
          <TextField
            large
            autoFocus
            value={name}
            maxLength={60}
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            placeholder={tr.onboarding.name.placeholder}
            onChangeText={(displayName) => OnboardingController.answer({ displayName })}
            onSubmitEditing={() => ok && OnboardingController.next()}
          />
        </Animated.View>
        <View className="flex-1" />
      </QuestionShell>
    </KeyboardAvoidingView>
  );
}
