"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useSettings } from "@/lib/hooks/use-settings"

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
}

interface Brand {
  brand: string
}

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getSettingBoolean } = useSettings()

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [loading, setLoading] = useState(true)

  // Verificar se os preços devem ser exibidos
  const showPrices = getSettingBoolean('show_prices', true)

  // Filtros ativos
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("categoria") || null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(searchParams.get("marca") || null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    Number(searchParams.get("preco_min")) || 0,
    Number(searchParams.get("preco_max")) || 5000,
  ])

  useEffect(() => {
    async function fetchFilters() {
      setLoading(true)
      try {
        const supabase = createClientSupabaseClient()

        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, slug, parent_id")
          .eq("active", true)
          .order("name")

        if (categoriesError) {
          console.error("Erro ao buscar categorias:", categoriesError)
        } else {
          setCategories(categoriesData || [])
        }

        // Buscar marcas únicas
        const { data: brandsData, error: brandsError } = await supabase
          .from("products")
          .select("brand")
          .eq("active", true)
          .order("brand")

        if (brandsError) {
          console.error("Erro ao buscar marcas:", brandsError)
        } else {
          // Extrair marcas únicas
          const uniqueBrands = Array.from(new Set((brandsData || []).map((item) => item.brand))).filter(
            Boolean,
          ) as string[]

          setBrands(uniqueBrands)
        }

        // Buscar faixa de preços
        const { data: priceData, error: priceError } = await supabase
          .from("products")
          .select("price")
          .eq("active", true)
          .order("price")

        if (priceError) {
          console.error("Erro ao buscar preços:", priceError)
        } else if (priceData && priceData.length > 0) {
          const prices = priceData.map((p) => p.price).filter(Boolean)
          if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices))
            const maxPrice = Math.ceil(Math.max(...prices))
            setPriceRange([minPrice, maxPrice])

            // Se não houver preço selecionado, definir o range completo
            if (!searchParams.get("preco_min") && !searchParams.get("preco_max")) {
              setSelectedPriceRange([minPrice, maxPrice])
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar filtros:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [searchParams])

  // Aplicar filtros
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set("categoria", selectedCategory)
    }

    if (selectedBrand) {
      params.set("marca", selectedBrand)
    }

    if (selectedPriceRange[0] > priceRange[0]) {
      params.set("preco_min", selectedPriceRange[0].toString())
    }

    if (selectedPriceRange[1] < priceRange[1]) {
      params.set("preco_max", selectedPriceRange[1].toString())
    }

    router.push(`/loja?${params.toString()}`)
  }

  // Limpar filtros
  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSelectedPriceRange(priceRange)
    router.push("/loja")
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-muted rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Separar categorias principais e subcategorias
  const mainCategories = categories.filter((c) => !c.parent_id)
  const subCategories = categories.filter((c) => c.parent_id)

  return (
    <div className="bg-card rounded-lg shadow p-4 text-card-foreground">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Filtros</h3>

      {/* Categorias */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Categorias</h4>
        <div className="space-y-2">
          {mainCategories.map((category) => (
            <div key={category.id}>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category.slug}
                  onChange={() => setSelectedCategory(category.slug)}
                  className="mr-2"
                />
                {category.name}
              </label>

              {/* Subcategorias */}
              {selectedCategory === category.slug && (
                <div className="ml-6 mt-1 space-y-1">
                  {subCategories
                    .filter((sub) => sub.parent_id === category.id)
                    .map((subCategory) => (
                      <label key={subCategory.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === subCategory.slug}
                          onChange={() => setSelectedCategory(subCategory.slug)}
                          className="mr-2"
                        />
                        {subCategory.name}
                      </label>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Marcas */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Marcas</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand}
                onChange={() => setSelectedBrand(brand)}
                className="mr-2"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      {/* Faixa de Preço - só exibir se os preços estão habilitados */}
      {showPrices && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Preço</h4>
          <div className="px-2">
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={selectedPriceRange[1]}
              onChange={(e) => setSelectedPriceRange([selectedPriceRange[0], Number.parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>R$ {selectedPriceRange[0]}</span>
              <span>R$ {selectedPriceRange[1]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={applyFilters}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={clearFilters}
          className="bg-muted hover:bg-accent text-accent-foreground py-2 px-4 rounded transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  )
}
