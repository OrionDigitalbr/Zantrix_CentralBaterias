import { createServerSupabaseClient } from "@/lib/supabase"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnitCard } from "@/components/unit-card"
import { getMultipleUnitsPrimaryImages } from "@/lib/unit-images"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Nossas Unidades | Grupo Central",
  description: "Conheça todas as unidades do Grupo Central e encontre a mais próxima de você.",
}

export default async function UnidadesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: units, error } = await supabase
    .from("units")
    .select("*")
    .eq("active", true)
    .order("name")

  if (error) {
    console.error("Erro ao buscar unidades:", error)
  }

  // Buscar imagens primárias de todas as unidades
  let unitsWithImages = units || []
  if (units && units.length > 0) {
    const unitIds = units.map(unit => unit.id)
    const unitImages = await getMultipleUnitsPrimaryImages(unitIds)

    // Adicionar imagem primária a cada unidade
    unitsWithImages = units.map(unit => ({
      ...unit,
      primary_image: unitImages[unit.id]
    }))
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[300px] md:h-[400px]">
        {/* Imagem para desktop (acima de 768px) */}
        <div className="hidden md:block h-full w-full">
          <Image 
            src="/images/Paginas/Zantrix_1920x448_Central_PC_PG_UNIDADES.jpg" 
            alt="Nossas Unidades" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Imagem para mobile (abaixo de 768px) */}
        <div className="md:hidden h-full w-full">
          <Image 
            src="/images/Paginas/Modelo_loja.jpg" 
            alt="Nossas Unidades" 
            fill 
            className="object-cover" 
            priority
            sizes="100vw"
          />
        </div>
        
        <div className="absolute inset-0 from-black/70 to-black/30 flex items-end md:items-center justify-center pb-8 md:pb-0">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">Unidade mais próxima</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 bg-background">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Encontre a Unidade Mais Próxima</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            O Grupo Central está presente em diversas cidades para melhor atender você. Confira nossas unidades e visite
            a mais próxima.
          </p>
        </div>

        {unitsWithImages && unitsWithImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {unitsWithImages.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Nenhuma unidade cadastrada</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              No momento não temos unidades cadastradas no sistema. Por favor, entre em contato conosco para mais
              informações.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
