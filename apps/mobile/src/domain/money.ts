const formats = new Map<string, Intl.NumberFormat>();

/** "$4.99" · "₺249,99" — mağazanın kendi biçimi yoksa (haftalık karşılık) */
export function formatMoney(value: number, currency: string): string {
  const key = currency;
  let f = formats.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    formats.set(key, f);
  }
  return f.format(value);
}
