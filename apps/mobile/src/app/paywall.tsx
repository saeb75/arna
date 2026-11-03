import { useLocalSearchParams } from "expo-router";
import type { PaywallSource } from "../controllers/PaywallController";
import { PaywallScreen } from "../screens/paywall/PaywallScreen";

export default function PaywallRoute() {
  const { source } = useLocalSearchParams<{ source?: PaywallSource }>();
  return <PaywallScreen source={source ?? "home"} />;
}
