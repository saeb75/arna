/** Cümle kurma maddesi cevaplanabilir mi? LLM ÇAĞRISI YOK.
 *
 *  `say("that be / where I / will stop", ["That's where I'll stop."])` — karışık
 *  dizinin kabul edilen cevabı GERÇEKTEN üretebildiğini hiçbir kapı denetlemiyordu.
 *  Külliyatta 330 madde var, her biri elle yazıldı.
 *
 *  DENETLENEN TEK ŞEY: öğrenciye ELİNE VERİLEN bir kelime, kabul edilen cevapların
 *  hiçbirinde kullanılamıyorsa madde bozuktur. Öğrenci verilen malzemeyle doğru
 *  cümleyi kurar ve REDDEDİLİR:
 *
 *    dizi   "we / left the station / we saw a cafe / soon after"
 *    cevap  "Not long after we left the station, we saw a cafe."
 *      → "soon after" verilmiş ama hiçbir kabulde yok; kullanan öğrenci yanlış sayılır
 *
 *  Zarar sessiz ve pahalı: deterministik eşleşme kaçar → öğrenci DOĞRU cevapta
 *  judge'a düşer → judge öğretilen biçimde hoşgörüsüz (CLAUDE.md, kasten) → hak yenir.
 *
 *  TERS YÖN (cevapta olup dizide olmayan kelime) KASTEN DENETLENMEZ. Ölçtüm: 102
 *  bulgunun çoğu buradan geliyordu ve hepsi meşruydu — alıştırmanın KENDİSİ yardımcı
 *  fiili öğrenciye ürettiriyor ("I / not / from / this city" → "I'm not from this
 *  city"). O eksik `am` hatanın değil, ölçümün ta kendisi.
 *
 *  BİÇİM EKSENİ DE GÖRMEZDEN GELİNİR: dizi LEMMA taşır (`that be`), cevap çekimli
 *  biçimi (`that's`). Denetlenen şey çekim değil ÖBEĞİN VARLIĞI; çekimi alıştırma
 *  zaten ölçüyor. Kısaltma açılır, düzenli ek ve düzensiz fiil eşdeğer sayılır.
 *
 *  YALNIZCA KELİME BANKASI maddeleri denetlenir (` / ` ayırıcısı taşıyanlar).
 *  Külliyatta ikinci bir gelenek var — düz yazı durum ipucu ("someone says the
 *  meeting is at 3, but you heard 2") — ve orada cevabın ipucundan farklı kelime
 *  kullanması normaldir. Bu maddeler ATLANIR ve sayısı ayrıca basılır: iki geleneğin
 *  varlığı gizlenmemeli, çünkü tek `say_sentence` biçimi altında yaşıyorlar.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-say-fit.ts` */
import { LESSONS as A1 } from "./authored/a1.js";
import { LESSONS as A2 } from "./authored/a2.js";
import { LESSONS as B1 } from "./authored/b1.js";
import { LESSONS as B2 } from "./authored/b2.js";
import { LESSONS as C1 } from "./authored/c1.js";
import { LESSONS as C2 } from "./authored/c2.js";
import type { Authored } from "./authored/dsl.js";

/** Düzensiz fiiller — lemma ipucu ile çekimli biçimi bağlar. */
const IRREGULAR: Record<string, string[]> = {
  be: ["is", "are", "was", "were", "am", "been", "being"],
  have: ["has", "had", "having"],
  do: ["does", "did", "done", "doing"],
  go: ["goes", "went", "gone", "going"],
  get: ["gets", "got", "gotten", "getting"],
  make: ["makes", "made", "making"],
  say: ["says", "said", "saying"],
  take: ["takes", "took", "taken", "taking"],
  come: ["comes", "came", "coming"],
  see: ["sees", "saw", "seen", "seeing"],
  think: ["thinks", "thought", "thinking"],
  know: ["knows", "knew", "known", "knowing"],
  give: ["gives", "gave", "given", "giving"],
  find: ["finds", "found", "finding"],
  leave: ["leaves", "left", "leaving"],
  feel: ["feels", "felt", "feeling"],
  keep: ["keeps", "kept", "keeping"],
  hold: ["holds", "held", "holding"],
  stand: ["stands", "stood", "standing"],
  understand: ["understands", "understood", "understanding"],
  win: ["wins", "won", "winning"],
  lose: ["loses", "lost", "losing"],
  put: ["puts", "putting"],
  let: ["lets", "letting"],
  meet: ["meets", "met", "meeting"],
  hear: ["hears", "heard", "hearing"],
  tell: ["tells", "told", "telling"],
  bring: ["brings", "brought", "bringing"],
  buy: ["buys", "bought", "buying"],
  catch: ["catches", "caught", "catching"],
  teach: ["teaches", "taught", "teaching"],
  run: ["runs", "ran", "running"],
  begin: ["begins", "began", "begun", "beginning"],
  drive: ["drives", "drove", "driven", "driving"],
  write: ["writes", "wrote", "written", "writing"],
  speak: ["speaks", "spoke", "spoken", "speaking"],
  break: ["breaks", "broke", "broken", "breaking"],
  choose: ["chooses", "chose", "chosen", "choosing"],
  rise: ["rises", "rose", "risen", "rising"],
  fall: ["falls", "fell", "fallen", "falling"],
  grow: ["grows", "grew", "grown", "growing"],
  pay: ["pays", "paid", "paying"],
  sell: ["sells", "sold", "selling"],
  send: ["sends", "sent", "sending"],
  spend: ["spends", "spent", "spending"],
  sit: ["sits", "sat", "sitting"],
  eat: ["eats", "ate", "eaten", "eating"],
  mean: ["means", "meant", "meaning"],
  lead: ["leads", "led", "leading"],
  deal: ["deals", "dealt", "dealing"],
  read: ["reads", "reading"],
  wear: ["wears", "wore", "worn", "wearing"],
  sleep: ["sleeps", "slept", "sleeping"],
  build: ["builds", "built", "building"],
  forget: ["forgets", "forgot", "forgotten", "forgetting"],
  forgive: ["forgives", "forgave", "forgiven", "forgiving"],
  hide: ["hides", "hid", "hidden", "hiding"],
  hit: ["hits", "hitting"],
  cut: ["cuts", "cutting"],
  cost: ["costs", "costing"],
  shut: ["shuts", "shutting"],
  quit: ["quits", "quitting"],
  set: ["sets", "setting"],
  spread: ["spreads", "spreading"],
  beat: ["beats", "beaten", "beating"],
  hurt: ["hurts", "hurting"],
  lay: ["lays", "laid", "laying"],
  lie: ["lies", "lay", "lain", "lying"],
  ride: ["rides", "rode", "ridden", "riding"],
  ring: ["rings", "rang", "rung", "ringing"],
  shake: ["shakes", "shook", "shaken", "shaking"],
  sing: ["sings", "sang", "sung", "singing"],
  steal: ["steals", "stole", "stolen", "stealing"],
  stick: ["sticks", "stuck", "sticking"],
  strike: ["strikes", "struck", "striking"],
  swim: ["swims", "swam", "swum", "swimming"],
  throw: ["throws", "threw", "thrown", "throwing"],
  wake: ["wakes", "woke", "woken", "waking"],
  freeze: ["freezes", "froze", "frozen", "freezing"],
  draw: ["draws", "drew", "drawn", "drawing"],
  fight: ["fights", "fought", "fighting"],
  fly: ["flies", "flew", "flown", "flying"],
  hang: ["hangs", "hung", "hanging"],
  seek: ["seeks", "sought", "seeking"],
  swear: ["swears", "swore", "sworn", "swearing"],
  tear: ["tears", "tore", "torn", "tearing"],
  upset: ["upsets", "upsetting"],
  withdraw: ["withdraws", "withdrew", "withdrawn", "withdrawing"],
};

/**
 * YÖNERGE sözcükleri — malzeme değil, öğrenciye ne yapacağını söyleyen ipuçlar.
 * Kapalı ve kısa tutuluyor; uzayan bir liste kuralın kendisini anlamsızlaştırır.
 * Her biri külliyatta bir madde ÇİFTİNDE ölçüldü, tahminle eklenmedi.
 */
const CUE_WORDS = new Set(["question", "negative", "plural", "use", "opinion", "final"]);

/** Kısaltmayı açar, noktalamayı atar, sözcüklere böler (`demonstrates` ile aynı eksen). */
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\([^)]*\)/g, " ") // parantezli ipucu şablonun parçası, denetime girmez
    // `let's` tek istisna: buradaki `'s` "is" değil "us" (genel kuraldan ÖNCE)
    .replace(/\blet's\b/g, " let us")
    .replace(/n't\b/g, " not")
    .replace(/'d\b/g, " would")
    .replace(/'ll\b/g, " will")
    .replace(/'re\b/g, " are")
    .replace(/'ve\b/g, " have")
    .replace(/'m\b/g, " am")
    .replace(/'s\b/g, " is")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Aynı sözcüğün iki biçimi mi? Çekim ekseni KASTEN geçirilir (dosya başlığı). */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (IRREGULAR[a]?.includes(b) || IRREGULAR[b]?.includes(a)) return true;
  // düzenli ek: stop→stopped, carry→carries, argue→argued (y ve sessiz ikizlemesi dahil)
  const [x, y] = a.length <= b.length ? [a, b] : [b, a];
  // Kök: "try"→"tr" (y), "argue"→"argu" (e). Kısa kökte 3 sınırı `try/tried` gibi
  // meşru çiftleri düşürüyordu, o yüzden ham biçim de denenir.
  for (const sx of [x, x.replace(/y$/, ""), x.replace(/e$/, "")]) {
    if (sx.length >= 2 && y.startsWith(sx) && y.length - sx.length <= 4) return true;
  }
  return false;
}

const has = (pool: string[], w: string) => pool.some((p) => sameWord(p, w));

let fail = 0;
const report: string[] = [];

for (const [level, lessons] of [["A1", A1], ["A2", A2], ["B1", B1], ["B2", B2], ["C1", C1], ["C2", C2]] as const) {
  let checked = 0;
  let prose = 0;
  const bad: string[] = [];

  for (const l of lessons as Authored[]) {
    for (const e of l.ex) {
      if (e.t !== "say") continue;
      // Düz yazı durum ipucu (` / ` yok) ikinci gelenek — cevabın ipucundan farklı
      // kelime kullanması orada normaldir, denetlenmez ama sayılır.
      if (!e.item.includes("/")) { prose++; continue; }
      checked++;

      const scramble = tokens(e.item).filter((w) => !CUE_WORDS.has(w));
      const answers = e.accept.map(tokens);

      // Öğrencinin eline verilen her sözcük en az bir kabulde kullanılabilmeli
      const unusable = scramble.filter((w) => !answers.some((a) => has(a, w)));
      if (unusable.length) {
        bad.push(`${l.id} · dizide var, hiçbir cevapta yok: ${JSON.stringify(unusable)}\n      "${e.item}" → "${e.accept[0]}"`);
      }

    }
  }

  const ok = bad.length === 0;
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${level}: ${checked} kelime bankası · ${bad.length} bozuk (+${prose} düz yazı ipucu, denetim dışı)`);
  report.push(...bad);
}

if (report.length) {
  console.log();
  for (const r of report) console.log(`   ${r}`);
}

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} seviyede cevaplanamaz madde var`}`);
process.exit(fail === 0 ? 0 : 1);
