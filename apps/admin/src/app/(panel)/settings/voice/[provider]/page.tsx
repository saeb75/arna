"use client";

import { ttsProviderSchema } from "@glotmate/contracts";
import { useParams } from "next/navigation";
import { Redirect } from "@/components/shared/Redirect";
import { TtsProviderScreen } from "@/screens/tts-provider/TtsProviderScreen";

export default function TtsProviderRoute() {
  const { provider } = useParams<{ provider: string }>();
  const parsed = ttsProviderSchema.safeParse(provider);
  if (!parsed.success) return <Redirect href="/settings/voice" />;
  return <TtsProviderScreen provider={parsed.data} />;
}
