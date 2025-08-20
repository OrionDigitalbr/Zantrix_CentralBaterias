import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Banner principal */}
      <div className="w-full h-40 md:h-64 mb-8 flex items-center justify-center">
        <Skeleton className="w-3/4 h-32 md:h-48" />
      </div>
      {/* Marcas */}
      <div className="flex gap-4 justify-center mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-36 h-16 rounded-lg" />
        ))}
      </div>
      {/* Produtos em destaque */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
