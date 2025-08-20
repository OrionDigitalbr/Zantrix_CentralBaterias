import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ProductGrid from "@/components/product-grid"
import { ProductFiltersHeader } from "@/components/product-filters-header"
import { ShopHeader } from "@/components/shop-header"

export default function ShopPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <ShopHeader
          title="Loja Virtual"
          description="Encontre as melhores peças e acessórios para seu veículo com os melhores preços."
          desktopImageUrl="/images/Paginas/Zantrix_1920x448_Central_PC_PG_LOJA.jpg"
          mobileImageUrl="/images/Paginas/Zantrix_300x400_Central_Cell_PG_LOJA.jpg"
        />

        <ProductFiltersHeader />

        <div className="my-6">
          <ProductGrid />
        </div>
      </div>

      <Footer />
    </main>
  )
}
