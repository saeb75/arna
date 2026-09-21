import { Skeleton } from "@/components/ui/skeleton";

/** İlk yüklemede tablonun iskeleti — gerçek düzenle aynı oranlar, sıçrama olmaz */
export function LessonsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-8 w-72 rounded-lg" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="overflow-hidden rounded-xl border border-border/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-3 w-5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
