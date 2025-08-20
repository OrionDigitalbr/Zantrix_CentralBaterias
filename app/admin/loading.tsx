import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="flex gap-6 mb-8">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
} 