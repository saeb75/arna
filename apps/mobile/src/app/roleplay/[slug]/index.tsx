import { useLocalSearchParams } from "expo-router";
import { RoleplayBriefScreen } from "../../../screens/roleplayBrief/RoleplayBriefScreen";

export default function RoleplayBriefRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <RoleplayBriefScreen slug={slug} />;
}
