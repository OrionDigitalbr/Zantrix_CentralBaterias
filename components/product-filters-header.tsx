"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useIsMobile } from "@/hooks/use-mobile"

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
}

interface Brand {
  brand: string
}

export function ProductFiltersHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isFilterClosing, setIsFilterClosing] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 5000])
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar scroll para mostrar o cabeçalho
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar o cabeçalho quando o scroll passar de 300px
      if (window.scrollY > 300) {
        setIsHeaderVisible(true)
      } else {
        setIsHeaderVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Buscar categorias e marcas
  useEffect(() => {
    async function fetchFilters() {
      try {
        const supabase = createClientSupabaseClient()

        // Buscar categorias
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name, slug, parent_id")
          .eq("active", true)
          .order("name")

        if (categoriesData) {
          setCategories(categoriesData)
        }

        // Buscar marcas únicas
        const { data: brandsData } = await supabase.from("products").select("brand").eq("active", true).order("brand")

        if (brandsData) {
          const uniqueBrands = Array.from(new Set(brandsData.map((item) => item.brand))).filter(Boolean) as string[]
          setBrands(uniqueBrands)
        }

        // Buscar faixa de preços
        const { data: priceData } = await supabase.from("products").select("price").eq("active", true).order("price")

        if (priceData && priceData.length > 0) {
          const prices = priceData.map((p) => p.price).filter(Boolean)
          if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices))
            const maxPrice = Math.ceil(Math.max(...prices))
            setPriceRange([minPrice, maxPrice])
            setSelectedPriceRange([minPrice, maxPrice])
          }
        }
      } catch (error) {
        console.error("Erro ao buscar filtros:", error)
      }
    }

    fetchFilters()
  }, [])

  // Controlar o scroll quando o filtro está aberto
  useEffect(() => {
    if ((isFilterOpen && !isFilterClosing) || isFilterClosing) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isFilterOpen, isFilterClosing])

  // Limpar timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim())
      // Resetar para a primeira página ao fazer uma nova busca
      params.delete('page')
    } else {
      params.delete('q')
    }
    
    router.push(`/loja?${params.toString()}`)
  }

  const handleOpenFilter = () => {
    setIsFilterOpen(true)
    setIsFilterClosing(false)
  }

  const handleCloseFilter = () => {
    setIsFilterClosing(true)

    // Definir um timeout para realmente fechar o filtro após a animação
    closeTimeoutRef.current = setTimeout(() => {
      setIsFilterOpen(false)
      setIsFilterClosing(false)
    }, 300) // Duração da animação de saída
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Atualizar categoria
    if (selectedCategory) {
      params.set("categoria", selectedCategory)
    } else {
      params.delete("categoria")
    }

    // Atualizar marca
    if (selectedBrand) {
      params.set("marca", selectedBrand)
    } else {
      params.delete("marca")
    }

    // Atualizar faixa de preço
    if (selectedPriceRange[0] > priceRange[0]) {
      params.set("preco_min", selectedPriceRange[0].toString())
    } else {
      params.delete("preco_min")
    }

    if (selectedPriceRange[1] < priceRange[1]) {
      params.set("preco_max", selectedPriceRange[1].toString())
    } else {
      params.delete("preco_max")
    }

    // Resetar para a primeira página ao aplicar filtros
    params.delete('page')
    
    router.push(`/loja?${params.toString()}`)
    handleCloseFilter()
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSelectedPriceRange(priceRange)
    // Limpar o campo de busca
    setSearchTerm('')
    // Limpar todos os parâmetros
    router.push('/loja')
    handleCloseFilter()
  }

  // Separar categorias principais e subcategorias
  const mainCategories = categories.filter((c) => !c.parent_id)
  const subCategories = categories.filter((c) => c.parent_id)

  // Renderização condicional baseada no dispositivo
  if (!isMobile) {
    // Versão para desktop
    return (
      <div className="bg-card shadow-sm mb-6 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {mainCategories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => router.push(`/loja?categoria=${category.slug}`)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {mainCategories.length > 6 && (
                <div className="relative group">
                  <button className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors">
                    Mais Categorias
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-popover rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {mainCategories.slice(6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => router.push(`/loja?categoria=${category.slug}`)}
                        className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex items-center max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              </div>
              <button
                type="submit"
                className="ml-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 bg-muted hover:bg-accent text-accent-foreground px-4 py-2 rounded-full transition-colors"
              >
                Limpar
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Versão para mobile
  return (
    <>
      {/* Cabeçalho fixo que aparece após scroll */}
      <div
        className={`fixed top-0 left-0 right-0 bg-background shadow-md z-30 transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ top: "60px" }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              </div>
              <button
                type="submit"
                className="ml-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search size={18} />
              </button>
            </form>

            <button
              onClick={handleOpenFilter}
              className="flex items-center ml-2 p-2 bg-muted hover:bg-accent rounded-full transition-colors"
              aria-label="Filtros"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu lateral de filtros (apenas mobile) */}
      {(isFilterOpen || isFilterClosing) && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50 ${
            isFilterClosing ? "animate-fadeOutBackdrop" : "animate-fadeInBackdrop"
          }`}
          onClick={handleCloseFilter}
        >
          {/* Container do filtro */}
          <div
            className={`fixed top-0 right-0 h-full w-4/5 bg-background shadow-xl overflow-y-auto ${
              isFilterClosing ? "animate-slideOutRight" : "animate-slideInRight"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho do filtro */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold text-foreground">Filtros</h3>
                <button
                  className="text-foreground focus:outline-none"
                  onClick={handleCloseFilter}
                  aria-label="Fechar filtro"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Conteúdo do filtro */}
              <div className="p-4 overflow-y-auto">
                {/* Categorias */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-foreground">Categorias</h4>
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
                  <h4 className="font-semibold mb-2 text-foreground">Marcas</h4>
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

                {/* Faixa de Preço */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-foreground">Preço</h4>
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
              </div>

              {/* Botões de ação */}
              <div className="mt-auto p-4 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-muted hover:bg-accent text-accent-foreground py-2 px-4 rounded-lg transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
