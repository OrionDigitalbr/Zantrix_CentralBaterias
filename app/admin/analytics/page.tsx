import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AnalyticsOverview } from "@/components/admin/analytics-overview"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { TopProducts } from "@/components/admin/top-products"
import { ProductsAnalytics } from "@/components/admin/products-analytics"
import { TrafficSources } from "@/components/admin/traffic-sources"
import { SlidesAnalytics } from "@/components/admin/slides-analytics"
import { UnitsAnalytics } from "@/components/admin/units-analytics"
import { AnalyticsPDFExport } from "@/components/admin/analytics-pdf-export"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">Análise detalhada do desempenho do sistema</p>
            </div>
            <AnalyticsPDFExport />
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="units">Unidades</TabsTrigger>
              <TabsTrigger value="traffic">Tráfego</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <AnalyticsOverview />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnalyticsCharts />
                <TopProducts />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <ProductsAnalytics />
            </TabsContent>

            <TabsContent value="slides" className="space-y-4">
              <SlidesAnalytics />
            </TabsContent>

            <TabsContent value="units" className="space-y-4">
              <UnitsAnalytics />
            </TabsContent>

            <TabsContent value="traffic" className="space-y-4">
              <TrafficSources />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
