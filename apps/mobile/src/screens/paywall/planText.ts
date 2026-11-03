import type { ProPlan } from "../../domain/pro";
import { tr } from "../../i18n/tr";

/** Planın adı ("Yıllık"; özel pakette ürünün kendi adı) */
export const planTitle = (plan: ProPlan): string =>
  plan.kind === "custom" ? plan.title || tr.paywall.package.custom! : tr.paywall.package[plan.kind]!;

/** Adın altındaki satır: deneme ya da nasıl faturalandığı */
export const planNote = (plan: ProPlan): string =>
  plan.trial ? tr.paywall.trial(plan.trial.count, plan.trial.unit) : tr.paywall.billing[plan.kind]!;

/** Eylemin sözü: deneme varsa "Ücretsiz dene" */
export function ctaLabel(plan: ProPlan | undefined): string {
  if (plan?.trial) return tr.paywall.ctaTrial;
  if (plan?.kind === "lifetime") return tr.paywall.ctaLifetime;
  return tr.paywall.ctaSubscribe;
}

/** Mağazanın şartı: neyin ne zaman alınacağı ve iptal edilene kadar yenilendiği */
export function termsLine(plan: ProPlan): string {
  if (plan.kind === "lifetime" || plan.kind === "custom") return tr.paywall.termsLifetime(plan.price);
  const period = tr.paywall.period[plan.kind] ?? "";
  if (plan.trial) return tr.paywall.termsTrial(tr.paywall.trial(plan.trial.count, plan.trial.unit), plan.price, period);
  return tr.paywall.termsRenews(plan.price, period);
}
