import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Skeleton className="w-1/3 h-10 mb-8" />
      <div className="w-full mb-4 flex gap-4">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-32 h-10" />
      </div>
      <div className="w-full">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
} 