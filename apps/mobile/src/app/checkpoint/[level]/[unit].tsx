import { useLocalSearchParams } from "expo-router";
import { CheckpointScreen } from "../../../screens/checkpoint/CheckpointScreen";

export default function CheckpointRoute() {
  const { level, unit } = useLocalSearchParams<{ level: string; unit: string }>();
  return <CheckpointScreen level={level} unit={unit} />;
}
