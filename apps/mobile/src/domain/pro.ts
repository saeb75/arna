import { formatMoney } from "./money";

// Paywall planları — mağaza paketlerinden SAF dönüşüm (GlotCast domain/pro portu).

export type PlanKind = "lifetime" | "annual" | "sixMonth" | "threeMonth" | "twoMonth" | "monthly" | "weekly" | "custom";

const KIND_BY_TYPE: Record<string, PlanKind> = {
  LIFETIME: "lifetime",
  ANNUAL: "annual",
  SIX_MONTH: "sixMonth",
  THREE_MONTH: "threeMonth",
  TWO_MONTH: "twoMonth",
  MONTHLY: "monthly",
  WEEKLY: "weekly",
};

/** Bir faturalama döneminin kaç ay olduğu (null: abonelik değil) */
const MONTHS: Record<PlanKind, number | null> = {
  lifetime: null,
  annual: 12,
  sixMonth: 6,
  threeMonth: 3,
  twoMonth: 2,
  monthly: 1,
  weekly: 12 / 52,
  custom: null,
};

/** Paywall'ın okuduğu kadarıyla mağaza paketi (react-native-purchases `PurchasesPackage` uyar) */
export interface StorePackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
    pricePerWeekString?: string | null;
    introPrice: { price: number; periodUnit: string; periodNumberOfUnits: number } | null;
  };
}

export interface ProPlan<P extends StorePackage = StorePackage> {
  key: string;
  kind: PlanKind;
  title: string;
  /** Mağazanın her dönem faturaladığı tutar, kendi biçiminde */
  price: string;
  /** Uzun planların haftalık karşılığı; haftalık/tek seferlik için null */
  perWeek: string | null;
  /** Bu Apple ID'nin hâlâ alabileceği ücretsiz deneme */
  trial: { count: number; unit: "day" | "month" | "year" } | null;
  amount: number;
  months: number | null;
  pkg: P;
}

const TRIAL_UNIT: Record<string, "day" | "month" | "year"> = { DAY: "day", MONTH: "month", YEAR: "year" };

function freeTrial(pkg: StorePackage): ProPlan["trial"] {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price > 0) return null;
  if (intro.periodUnit === "WEEK") return { count: intro.periodNumberOfUnits * 7, unit: "day" };
  const unit = TRIAL_UNIT[intro.periodUnit];
  return unit ? { count: intro.periodNumberOfUnits, unit } : null;
}

/** Planlar OFFERING SIRASIYLA (RevenueCat'te ayarlanır; ilki önseçili). Deneme yalnız uygun ürüne vaat edilir. */
export function toPlans<P extends StorePackage>(packages: P[], trialEligible: ReadonlySet<string>): ProPlan<P>[] {
  return packages.map((pkg) => {
    const kind = KIND_BY_TYPE[pkg.packageType] ?? "custom";
    const months = MONTHS[kind];
    const { product } = pkg;
    const perWeek =
      kind === "weekly" || kind === "lifetime" || kind === "custom"
        ? null
        : (product.pricePerWeekString ??
          (months ? formatMoney(Math.floor((product.price / ((months * 52) / 12)) * 100) / 100, product.currencyCode) : null));
    return {
      key: pkg.identifier,
      kind,
      title: product.title,
      price: product.priceString,
      perWeek,
      trial: trialEligible.has(product.identifier) ? freeTrial(pkg) : null,
      amount: product.price,
      months,
      pkg,
    };
  });
}

/** En pahalı aylık karşılığa göre tam yüzde tasarruf; anlamsızsa 0 */
export function savingsPct(plan: ProPlan, plans: readonly ProPlan[]): number {
  if (!plan.months) return 0;
  const perMonth = (p: ProPlan) => (p.months ? p.amount / p.months : 0);
  const worst = Math.max(...plans.map(perMonth));
  if (!(worst > 0)) return 0;
  const pct = Math.floor((1 - perMonth(plan) / worst) * 100);
  return pct >= 5 ? pct : 0;
}

/** RevenueCat'siz derleme: paywall'ın görünümü, planlanan fiyatlarla — hiçbir şey satın alınmaz */
export const PREVIEW_PACKAGES: StorePackage[] = [
  {
    identifier: "$rc_annual",
    packageType: "ANNUAL",
    product: {
      identifier: "preview.annual",
      title: "Annual",
      price: 49.99,
      priceString: "$49.99",
      currencyCode: "USD",
      pricePerWeekString: null,
      introPrice: { price: 0, periodUnit: "DAY", periodNumberOfUnits: 3 },
    },
  },
  {
    identifier: "$rc_weekly",
    packageType: "WEEKLY",
    product: {
      identifier: "preview.weekly",
      title: "Weekly",
      price: 5.99,
      priceString: "$5.99",
      currencyCode: "USD",
      pricePerWeekString: null,
      introPrice: null,
    },
  },
];
