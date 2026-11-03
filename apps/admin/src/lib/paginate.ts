/**
 * İstemci tarafı sayfalama — saf. Panel listeleri sunucudan tek seferde gelir
 * (≤1000 satır), süzme/sıralama istemcide; sayfalama da burada, tablo asla
 * yüzlerce satırı tek anda çizmez. `page` 1 tabanlı; aralık dışıysa kırpılır.
 */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  /** 1 tabanlı görünen aralık; boş listede 0–0 */
  from: number;
  to: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Paged<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), pageCount);
  const start = (p - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page: p,
    pageSize,
    total,
    pageCount,
    from: total ? start + 1 : 0,
    to: total ? start + slice.length : 0,
  };
}

/** Sunucu tarafı sayfalanmış cevaptan aynı `Paged` şekli — TablePagination tek tip okur */
export function pagedFromServer<T>(items: T[], page: number, pageSize: number, total: number): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items,
    page,
    pageSize,
    total,
    pageCount,
    from: total ? start + 1 : 0,
    to: total ? start + items.length : 0,
  };
}

/**
 * Küçük kart tabloları (detay ekranlarındaki alt listeler) için sayfa durumu —
 * store'larda `Record<anahtar, PageState>` olarak durur. Ebat değişimi sayfayı 1'e alır.
 */
export interface PageState {
  page: number;
  pageSize: PageSize;
}

export const FIRST_PAGE: PageState = { page: 1, pageSize: 25 };

export function nextPageState(prev: PageState, patch: Partial<PageState>): PageState {
  if (patch.pageSize !== undefined && patch.pageSize !== prev.pageSize) return { page: 1, pageSize: patch.pageSize };
  return { ...prev, ...patch };
}
