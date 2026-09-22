"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAGE_SIZES, type Paged, type PageSize } from "@/lib/paginate";

const SIZE_ITEMS = PAGE_SIZES.map((n) => ({ value: String(n), label: `${n} / page` }));

/**
 * Tablo altı sayfalama şeridi — her liste ekranı aynı bileşeni kullanır.
 * Durum store'da (sayfa/ebat); burası yalnız gösterir ve callback çağırır.
 */
export function TablePagination<T>({
  paged,
  onPage,
  onPageSize,
  noun = "rows",
}: {
  paged: Paged<T>;
  onPage: (page: number) => void;
  onPageSize: (size: PageSize) => void;
  noun?: string;
}) {
  if (paged.total === 0) return null;
  const { page, pageCount } = paged;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="tabular-nums">
        {paged.from}–{paged.to} of {paged.total} {noun}
      </span>
      <Select value={String(paged.pageSize)} onValueChange={(v) => onPageSize(Number(v) as PageSize)} items={SIZE_ITEMS}>
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SIZE_ITEMS.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-xs" onClick={() => onPage(1)} disabled={page <= 1} aria-label="First page">
          <ChevronsLeft />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <span className="min-w-20 text-center tabular-nums">
          Page {page} of {pageCount}
        </span>
        <Button variant="ghost" size="icon-xs" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <ChevronRight />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => onPage(pageCount)} disabled={page >= pageCount} aria-label="Last page">
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
