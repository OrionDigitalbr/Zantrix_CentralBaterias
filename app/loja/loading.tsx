import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Filtros */}
      <div className="flex gap-4 mb-8 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-32 h-10 rounded-md" />
        ))}
      </div>
      {/* Grid de produtos */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="w-full h-48 mb-4" />
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-2" />
              <Skeleton className="w-1/3 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
