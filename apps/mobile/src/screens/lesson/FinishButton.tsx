import { Button } from "../../components/ui/Button";

/**
 * TEK BİTİRİCİ — kök kural: ders kendiliğinden bitmez; hiçbir sayaç kapatamaz.
 * Yalnız wrapup fazında görünür.
 */
export function FinishButton({ onFinish }: { onFinish: () => void }) {
  return <Button title="Dersi Bitir" onPress={onFinish} />;
}
