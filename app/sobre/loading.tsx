import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <Skeleton className="w-1/2 h-10 mb-6" />
      <Skeleton className="w-full max-w-2xl h-6 mb-4" />
      <Skeleton className="w-full max-w-2xl h-6 mb-4" />
      <Skeleton className="w-full max-w-2xl h-6 mb-4" />
      <Skeleton className="w-80 h-48 rounded-lg mt-8" />
    </div>
  );
} 