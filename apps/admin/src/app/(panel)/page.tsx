import { OverviewScreen } from "@/screens/overview/OverviewScreen";

/** Kök = Overview. Auth/admin kapısı `(panel)/layout.tsx`'te — oturumsuz ziyaret /login'e düşer. */
export default function OverviewRoute() {
  return <OverviewScreen />;
}
