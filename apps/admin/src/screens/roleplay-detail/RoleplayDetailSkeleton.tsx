import { Skeleton } from "@/components/ui/skeleton";

export function RoleplayDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-8 w-96 rounded-lg" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Skeleton className="h-[480px] rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
