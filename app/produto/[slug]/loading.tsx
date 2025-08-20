import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-1/2 h-80 rounded-lg" />
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton className="w-3/4 h-8 mb-2" />
          <Skeleton className="w-1/3 h-6 mb-2" />
          <Skeleton className="w-full h-24 mb-2" />
          <Skeleton className="w-1/2 h-10" />
        </div>
      </div>
    </div>
  );
}
