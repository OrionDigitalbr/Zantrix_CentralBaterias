import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Carousel } from "@/components/carousel"
import { MainDepartments } from "@/components/main-departments"
import { TopBrands } from "@/components/top-brands"
import FeaturedProductsClient from "@/components/featured-products-client"
import { WhatsappSection } from "@/components/whatsapp-section"
import { BatteryAdvantages } from "@/components/battery-advantages"
import { LightingItems } from "@/components/lighting-items"
import TopLightingItems from "@/components/top-lighting-items"
import { ComfortItems } from "@/components/comfort-items"
import ComfortItemsList from "@/components/comfort-items-list"
import { SafetyItems } from "@/components/safety-items"
import SafetyItemsList from "@/components/safety-items-list"
import { TruckBrands } from "@/components/truck-brands"
import { ProductCatalog } from "@/components/product-catalog"
import { MainClients } from "@/components/main-clients"
import { PointsProgram } from "@/components/points-program"
import { Testimonials } from "@/components/testimonials"
import { AdvantagesSection } from "@/components/advantages-section"


export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* 1. Cabeçalho */}
      <Header />

      {/* 2. Slide */}
      <Carousel />

      {/* 3. Vantagens da empresa */}
      <AdvantagesSection />
      
      
      {/* 4. PRINCIPAIS DEPARTAMENTOS */}
      <MainDepartments />

      {/* 5. Melhores marcas automotivas */}
      {<TopBrands />}

      

      {/* 6. Produtos em destaques */}
      <FeaturedProductsClient />
      

      {/* 7. Compre pelo whatsapp */}
      <WhatsappSection />

      {/* 8. Vantagens das baterias Jupiter */}
      <BatteryAdvantages />

      {/* 9. Itens de iluminação */}
      <LightingItems />

      <div className="container mx-auto px-4">
        {/* 10. Principais itens de iluminação */}
        <TopLightingItems />
      </div>

      {/* 11. Itens de conforto ao motorista */}
      <ComfortItems />

      <div className="container mx-auto px-4">
        {/* 12. Lista de itens de conforto ao motorista */}
        <ComfortItemsList />
      </div>

      {/* 13. Itens de segurança */}
      <SafetyItems />

      <div className="container mx-auto px-4">
        {/* 14. Itens de segurança (produtos mais clicados) */}
        <SafetyItemsList />

        {/* 15. Principais marcas */}
        <TruckBrands />
      </div>

      {/* 16. Catálogo de produtos */}
      <ProductCatalog />

  

      {/* 18. Programa de pontos */}
      <PointsProgram />

      <div className="container mx-auto px-4">
        {/* 19. Depoimentos */}
        <Testimonials />
      </div>

      {/* 20. RODAPÉ */}
      <Footer />
    </main>
  )
}
