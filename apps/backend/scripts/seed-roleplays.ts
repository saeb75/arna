/**
 * ROLEPLAY TOHUMLAMA — iki pilotu repo dosyasından DB'ye yazar.
 *
 *   npx tsx scripts/seed-roleplays.ts [--dry-run]
 *
 * DERSLERDEN AYRIŞAN YÖN: müfredat repo-kaynaklıdır (DB türetilmiş projeksiyon),
 * roleplay ise DB-KAYNAKLIDIR. İki pilot incelenebilirlik için repoda duruyor ama
 * tohumlamadan sonra doğruluk kaynağı DB'dir — gerisi panelin işi.
 *
 * DEĞİŞMEZ REVİZYON: yayınlanmış satır GÜNCELLENMEZ. `specHash` değiştiyse yeni
 * revizyon doğar, eskisi `retired` olur ama SİLİNMEZ — oturumlar kesin revizyona
 * pinlendiği için "bozuk içeriği kim gördü" sorusu cevaplanabilir kalır.
 * (`catalog_lessons` ↔ `lesson_cores` ilişkisinin aynısı, aynı sebeple.)
 *
 * Kapı burada koşar: `lintRoleplay` HATA verirse hiçbir şey yazılmaz. Panel
 * geldiğinde aynı modülü çağıracak — kural iki yerde yazılmayacak.
 */
import { createHash } from "node:crypto";
import { and, eq, notInArray } from "drizzle-orm";
import { roleplaySpecSchema, ROLEPLAY_SPEC_FORMAT, type RoleplaySpec } from "@arna/contracts";
import { db } from "../src/db/client.js";
import { roleplayRevisions, roleplays } from "../src/db/schema.js";
import { lintRoleplay } from "../src/modules/roleplay/lintRoleplay.js";
import { COMPLAINT_REFUND } from "./roleplays/complaint-refund.js";
import { RESTAURANT_ORDER } from "./roleplays/restaurant-order.js";

const DRY_RUN = process.argv.includes("--dry-run");

const PILOTS = [RESTAURANT_ORDER, COMPLAINT_REFUND];

/** Oynatmayı etkileyen alanların parmak izi — başlık/kategori DIŞINDA tutulmadı,
 *  çünkü ikisi de brief'te görünüyor ve değişmesi yeni revizyonu hak ediyor. */
function specHash(spec: RoleplaySpec): string {
  return createHash("sha256").update(JSON.stringify(spec)).digest("hex").slice(0, 16);
}

console.log(`\nROLEPLAY TOHUMLAMA${DRY_RUN ? " (dry-run — hiçbir şey yazılmaz)" : ""}\n`);

let blocked = 0;
let inserted = 0;
let unchanged = 0;
let revised = 0;

for (const pilot of PILOTS) {
  // Şema önce: kapı geçerli olmayan bir nesneyi denetlemeye çalışmasın
  const parsed = roleplaySpecSchema.safeParse(pilot.spec);
  if (!parsed.success) {
    blocked++;
    console.log(`  ✗ ${pilot.slug}: şema — ${JSON.stringify(parsed.error.issues[0])}`);
    continue;
  }
  const spec = parsed.data;

  const report = lintRoleplay(spec);
  for (const w of report.warnings) console.log(`  ⚠ ${pilot.slug}: ${w}`);
  if (report.errors.length) {
    blocked++;
    for (const e of report.errors) console.log(`  ✗ ${pilot.slug}: ${e}`);
    continue;
  }

  const hash = specHash(spec);

  if (DRY_RUN) {
    console.log(`  ○ ${pilot.slug} (${hash}) — ${spec.objectives.length} hedef, ${spec.complications.length} komplikasyon`);
    continue;
  }

  // --- Kimlik satırı: upsert, güvenli ---------------------------------------
  await db
    .insert(roleplays)
    .values({
      id: pilot.slug,
      category: spec.category,
      recommendedFrom: spec.recommendedFrom,
      supportedFrom: spec.supportedFrom,
      status: "active",
    })
    .onConflictDoUpdate({
      target: roleplays.id,
      set: {
        category: spec.category,
        recommendedFrom: spec.recommendedFrom,
        supportedFrom: spec.supportedFrom,
        status: "active",
        updatedAt: new Date(),
      },
    });

  // --- Revizyon: DEĞİŞMEZ --------------------------------------------------
  const existing = await db
    .select({ id: roleplayRevisions.id, revision: roleplayRevisions.revision, specHash: roleplayRevisions.specHash, status: roleplayRevisions.status })
    .from(roleplayRevisions)
    .where(eq(roleplayRevisions.roleplayId, pilot.slug));

  const published = existing.find((r) => r.status === "published");

  if (published?.specHash === hash) {
    unchanged++;
    console.log(`  = ${pilot.slug} r${published.revision} (${hash}) — değişmedi`);
    continue;
  }

  const nextRevision = existing.reduce((m, r) => Math.max(m, r.revision), 0) + 1;

  // Eski yayın emekliye ayrılır, SİLİNMEZ: eski oturumlar ona pinli.
  if (published) {
    await db
      .update(roleplayRevisions)
      .set({ status: "retired", updatedAt: new Date() })
      .where(and(eq(roleplayRevisions.roleplayId, pilot.slug), eq(roleplayRevisions.status, "published")));
  }

  await db.insert(roleplayRevisions).values({
    roleplayId: pilot.slug,
    revision: nextRevision,
    specFormat: ROLEPLAY_SPEC_FORMAT,
    specHash: hash,
    status: "published",
    spec,
  });

  if (published) {
    revised++;
    console.log(`  ↑ ${pilot.slug} r${published.revision} → r${nextRevision} (${hash}) — eski yayın retired`);
  } else {
    inserted++;
    console.log(`  + ${pilot.slug} r${nextRevision} (${hash}) — ilk yayın`);
  }
}

// Repo'dan çıkarılmış pilotları emekliye ayır (silme yok — oturumlar pinli)
if (!DRY_RUN) {
  const wanted = PILOTS.map((p) => p.slug);
  const orphans = await db
    .select({ id: roleplays.id })
    .from(roleplays)
    .where(and(eq(roleplays.status, "active"), notInArray(roleplays.id, wanted)));
  for (const o of orphans) {
    await db.update(roleplays).set({ status: "retired", updatedAt: new Date() }).where(eq(roleplays.id, o.id));
    console.log(`  - ${o.id}: repoda yok → retired`);
  }
}

console.log(
  `\n${DRY_RUN ? "[KURU KOŞU] " : ""}${inserted} yeni · ${revised} yeni revizyon · ${unchanged} değişmedi · ${blocked} kapıda kaldı`,
);
process.exit(blocked > 0 ? 1 : 0);
