import { useLocalSearchParams } from "expo-router";
import { RoleplayPlayScreen } from "../../../screens/roleplayPlay/RoleplayPlayScreen";

export default function RoleplayPlayRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <RoleplayPlayScreen slug={slug} />;
}
