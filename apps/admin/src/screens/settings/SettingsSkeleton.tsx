import { Skeleton } from "@/components/ui/skeleton";

/** İlk yüklemede ayar kartlarının iskeleti — gerçek düzenle aynı oranlar */
export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
