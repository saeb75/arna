import type { RichText } from "@glotmate/contracts";

/**
 * ÖRNEK CÜMLE kendi satırında (13 Kas 2026, kullanıcı isteği: "örnekler metnin içinde
 * kayboluyor"). Anlatımdaki İngilizce örnek cümle ana dil düzyazısının ortasında akınca
 * gözden kaçıyordu; ekranda önünden ve ardından satır kırılır.
 *
 * Örnek = vurgulu (`emphasis`) `en` parçası, cümle noktalamasıyla biter ve en az iki
 * kelimedir. Vurguyu yalnız birleştirici koyar (çekirdek örnekleri ve kalıp adı); kalıp
 * adı ("my name is", "am / is / are:") cümle sonu noktalaması taşımaz → satır içinde
 * kalır, "[kalıp] gibi kısa tepkiler…" gibi cümleler bölünmez. Kural noktalamaya bakar,
 * dile değil. YALNIZ GÖSTERİM: ses ve transkript aynı parçaları okur.
 */
function isExample(text: string, emphasis: boolean | undefined): boolean {
  const t = text.trim();
  return !!emphasis && /[.!?…]["'”’)]*$/.test(t) && t.split(/\s+/).length >= 2;
}

export function separateExamples(runs: RichText): RichText {
  if (!runs.some((r) => r.lang === "en" && isExample(r.text, r.emphasis))) return runs;
  return runs.map((r, i) => {
    if (r.lang !== "en" || !isExample(r.text, r.emphasis)) return r;
    const prev = runs[i - 1]?.text;
    const next = runs[i + 1]?.text;
    // Parçanın başında/sonunda zaten satır sonu varsa (görev kartı) ikinci kez kırılmaz;
    // ardından noktalama geliyorsa ("…Daniel." + ",") ona yapışık kalır
    const before = prev !== undefined && !/\n\s*$/.test(prev) ? "\n" : "";
    // Art arda iki örnek: aradaki kırılımı sonraki örneğin "önce"si koyar — boş satır olmasın
    const nextRun = runs[i + 1];
    const nextIsExample = nextRun?.lang === "en" && isExample(nextRun.text, nextRun.emphasis);
    const after =
      next !== undefined && !nextIsExample && !/^\s*\n/.test(next) && !/^[.,!?;:…)\]}]/.test(next) ? "\n" : "";
    return { ...r, text: `${before}${r.text.trim()}${after}` };
  });
}
