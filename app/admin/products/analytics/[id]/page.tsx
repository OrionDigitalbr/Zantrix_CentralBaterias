import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProductAnalytics } from "@/components/admin/product-analytics"

export default async function ProductAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Análise de Produto</h1>
            <p className="text-muted-foreground">Estatísticas detalhadas do produto #{id}</p>
          </div>

          <ProductAnalytics productId={id} />
        </main>
      </div>
    </div>
  )
}
