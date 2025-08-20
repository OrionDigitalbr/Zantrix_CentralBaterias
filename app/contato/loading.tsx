import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <Skeleton className="w-1/2 h-10 mb-6" />
      <div className="w-full max-w-xl flex flex-col gap-4 mb-8">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-1/3 h-10" />
      </div>
      <Skeleton className="w-full max-w-2xl h-64 rounded-lg" />
    </div>
  );
} 