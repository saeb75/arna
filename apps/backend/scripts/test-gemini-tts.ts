/**
 * GEMINI TTS DUMAN TESTİ — gerçek API: tam klip (mp3) + akış bileti üzerinden HTTP
 * akışı (üretimdeki `openStream` + `pipeStreamTicket`, yerel http sunucusu).
 * Ölçer: tam klip süresi, akışta ilk mp3 baytı, çıktının geçerli mp3 olması (afinfo).
 *
 *   cd apps/backend && set -a && source .env && set +a && npx tsx scripts/test-gemini-tts.ts [çıktı-klasörü]
 */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { geminiProvider, GEMINI_MODELS } from "../src/modules/tts/gemini.js";
import { getStreamTicket, openStream, pipeStreamTicket } from "../src/modules/tts/stream.js";

const OUT = process.argv[2] ?? mkdtempSync(join(tmpdir(), "gemini-tts-"));
const RUNS = [
  { languageCode: "tr", text: "Neredeyse doğru! Burada geçmiş zaman yardımcı fiili gerekiyor. Doğru cümle şöyle:" },
  { languageCode: "en", text: "When I arrived, the movie had already started." },
];

function duration(file: string): number {
  const out = execFileSync("afinfo", [file]).toString();
  return Number(/estimated duration: ([\d.]+)/.exec(out)?.[1] ?? 0);
}

let fail = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${msg}`);
};

for (const modelId of [GEMINI_MODELS[0], GEMINI_MODELS[1]]) {
  const t0 = Date.now();
  const clip = await geminiProvider.synthesizeRuns!({ runs: RUNS, voiceId: "Kore", modelId });
  const file = join(OUT, `${modelId}-tam.mp3`);
  writeFileSync(file, Buffer.from(clip.audioBase64, "base64"));
  const d = duration(file);
  check(d > 2 && clip.alignment === null, `${modelId} tam klip: ${((Date.now() - t0) / 1000).toFixed(1)} sn bekleme, ${d.toFixed(1)} sn mp3`);
}

// Akış: bilet → yerel HTTP → ilk bayt süresi + bütün dosya
const server = createServer((req, res) => {
  const t = getStreamTicket(req.url!.slice(1));
  if (!t) return res.writeHead(404).end();
  pipeStreamTicket(t, res);
});
await new Promise<void>((r) => server.listen(0, r));
const port = (server.address() as { port: number }).port;

for (const modelId of [GEMINI_MODELS[0], GEMINI_MODELS[1]]) {
  const t0 = Date.now();
  const id = openStream({ provider: geminiProvider, voiceId: "Kore", modelId }, RUNS);
  const res = await fetch(`http://127.0.0.1:${port}/${id}`);
  let first = 0;
  const parts: Buffer[] = [];
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    if (!first) first = Date.now() - t0;
    parts.push(Buffer.from(chunk));
  }
  const file = join(OUT, `${modelId}-akis.mp3`);
  writeFileSync(file, Buffer.concat(parts));
  const d = duration(file);
  check(res.status === 200 && res.headers.get("content-type") === "audio/mpeg" && d > 2,
    `${modelId} akış: ilk mp3 baytı ${(first / 1000).toFixed(2)} sn, toplam ${((Date.now() - t0) / 1000).toFixed(1)} sn, ${d.toFixed(1)} sn mp3`);
  // Aynı bilet ikinci kez: oynatıcı yeniden isterse aynı ses baştan gelmeli (üretim tekrarlanmaz)
  const again = Buffer.from(await (await fetch(`http://127.0.0.1:${port}/${id}`)).arrayBuffer());
  check(again.equals(Buffer.concat(parts)), `${modelId} aynı bilet ikinci istek: birebir aynı ${again.length} bayt`);
}

const missing = await fetch(`http://127.0.0.1:${port}/yok-boyle-bilet`);
check(missing.status === 404, "bilinmeyen bilet → 404");
server.close();
console.log(`\nçıktılar: ${OUT}`);
console.log(fail ? `❌ ${fail} kontrol başarısız` : "✅ hepsi geçti");
process.exit(fail ? 1 : 0);
