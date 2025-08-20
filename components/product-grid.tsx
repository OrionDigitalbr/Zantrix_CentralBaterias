"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Grid, List, Eye, ArrowUpDown, Heart, EyeIcon, AlertCircle, ShoppingBag } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { ProductCardPrice, ProductListPrice } from "@/components/price-display"
import { useIsMobile } from "@/hooks/use-mobile"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  image_url?: string
  category_id: number
  brand: string
  short_description?: string
  likes?: number
  views?: number
  has_units: boolean
}

type SortOption = {
  label: string
  value: string
  icon: React.ReactNode
}

export default function ProductGrid() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // Obter a página atual da URL ou usar 1 como padrão
  const initialPage = searchParams?.get('page') ? Number(searchParams.get('page')) : 1
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [hasUnits, setHasUnits] = useState(false)
  const productsPerPage = 12
  
  // Obter parâmetros da URL com verificação de segurança
  const searchTerm = searchParams?.get('q') || null
  const categorySlug = searchParams?.get('categoria') || null
  const brand = searchParams?.get('marca') || null
  const minPrice = searchParams?.get('preco_min') || null
  const maxPrice = searchParams?.get('preco_max') || null

  const sortOptions: SortOption[] = [
    { label: "Nome (A-Z)", value: "name-asc", icon: <ArrowUpDown size={16} /> },
    { label: "Nome (Z-A)", value: "name-desc", icon: <ArrowUpDown size={16} className="transform rotate-180" /> },
    { label: "Preço (menor-maior)", value: "price-asc", icon: <ArrowUpDown size={16} /> },
    { label: "Preço (maior-menor)", value: "price-desc", icon: <ArrowUpDown size={16} className="transform rotate-180" /> },
    { label: "Mais curtidos", value: "likes-desc", icon: <Heart size={16} /> },
    { label: "Mais vistos", value: "views-desc", icon: <EyeIcon size={16} /> },
  ]

  useEffect(() => {
    async function checkUnits() {
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase.from("units").select("id").eq("active", true).limit(1)

        if (error) {
          console.error("Erro ao verificar unidades:", error)
          return
        }

        setHasUnits(data && data.length > 0)
      } catch (error) {
        console.error("Erro ao verificar unidades:", error)
      }
    }

    checkUnits()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const supabase = createClientSupabaseClient()

        // Iniciar a query base
        let query = supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            price,
            sale_price,
            short_description,
            description,
            category_id,
            brand,
            product_images!left(url, is_main),
            categories!inner(name, slug)
          `, { count: 'exact' })
          .eq("active", true)

        // Aplicar filtro de categoria
        if (categorySlug) {
          query = query.eq('categories.slug', categorySlug)
        }

        // Aplicar filtro de busca
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }

        // Aplicar filtro de marca
        if (brand) {
          query = query.eq('brand', brand)
        }

        // Aplicar filtro de preço
        if (minPrice) {
          query = query.gte('price', Number(minPrice))
        }
        if (maxPrice) {
          query = query.lte('price', Number(maxPrice))
        }

        // Obter a contagem total com os filtros aplicados
        const { count, error: countError } = await query
        
        if (countError) throw countError
        
        const total = count || 0
        setTotalPages(Math.ceil(total / productsPerPage))

        // Determinar a ordenação
        let orderColumn = "name"
        let ascending = true

        if (sortBy === "name-desc") {
          orderColumn = "name"
          ascending = false
        } else if (sortBy === "price-asc") {
          orderColumn = "price"
          ascending = true
        } else if (sortBy === "price-desc") {
          orderColumn = "price"
          ascending = false
        }

        // Aplicar ordenação e paginação
        const { data: productsData, error } = await query
          .order(orderColumn, { ascending })
          .range((currentPage - 1) * productsPerPage, currentPage * productsPerPage - 1)

        if (error) {
          console.error("Erro ao buscar produtos:", error)
          setProducts([])
          return
        }

        // Formatar os dados para o formato esperado pelo componente
        const formattedProducts = productsData.map((product) => {
          // Encontrar a imagem principal ou usar a primeira disponível
          const mainImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0]

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            sale_price: product.sale_price,
            short_description: product.short_description,
            image_url: mainImage?.url || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name)}`,
            category_id: product.category_id,
            brand: product.brand,
            likes: Math.floor(Math.random() * 50) + (product.id % 10) * 5,
            views: Math.floor(Math.random() * 200) + (product.id % 20) * 10,
            has_units: hasUnits,
          }
        })

        // Ordenação manual para likes e views
        const sortedProducts = [...formattedProducts]
        if (sortBy === "likes-desc") {
          sortedProducts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        } else if (sortBy === "views-desc") {
          sortedProducts.sort((a, b) => (b.views || 0) - (a.views || 0))
        }

        setProducts(sortedProducts)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, sortBy, hasUnits, searchTerm, categorySlug, brand, minPrice, maxPrice])
  
  // Sincronizar o estado da página com a URL
  useEffect(() => {
    const page = searchParams?.get('page')
    if (page && Number(page) !== currentPage) {
      setCurrentPage(Number(page))
    }
  }, [searchParams, currentPage])

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categorySlug, brand, minPrice, maxPrice, sortBy])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-4">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-card-foreground mb-2">Nenhum produto encontrado</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          No momento não temos produtos disponíveis nesta categoria. Por favor, volte mais tarde.
        </p>
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    if (!searchParams) return
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/loja?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPagination = () => {
    const delta = 2
    const left = currentPage - delta
    const right = currentPage + delta + 1
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative">
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center space-x-2 bg-card rounded-lg shadow-sm p-3 text-card-foreground hover:bg-muted transition-colors"
          >
            <ArrowUpDown size={16} />
            <span>Ordenar por: {sortOptions.find((option) => option.value === sortBy)?.label}</span>
          </button>

          {showSortOptions && (
            <div className="absolute left-0 mt-2 w-64 bg-popover rounded-lg shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value)
                    setShowSortOptions(false)
                  }}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-muted ${
                    sortBy === option.value ? "bg-orange-50 dark:bg-orange-900/20 text-cliente dark:text-orange-400" : "text-popover-foreground"
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-card rounded-lg shadow-sm p-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${
              viewMode === "grid" ? "bg-orange-100 dark:bg-orange-900/20 text-cliente dark:text-orange-400" : "text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Visualização em grade"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list" ? "bg-orange-100 dark:bg-orange-900/20 text-cliente dark:text-orange-400" : "text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Visualização em lista"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Visualização em Grade */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/produto/${product.slug}`}
              className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="relative p-4 flex justify-center">
                <div className="relative w-full h-48">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Heart size={12} className="mr-1" />
                    <span>{product.likes}</span>
                    <EyeIcon size={12} className="ml-2 mr-1" />
                    <span>{product.views}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-card-foreground line-clamp-2 h-14">{product.name}</h3>
                
                {/* Usar ProductCardPrice que já tem a lógica de show_prices */}
                <ProductCardPrice
                  price={product.price}
                  salePrice={product.sale_price}
                />
                
                {product.has_units ? (
                  <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors">
                    Comprar
                  </button>
                ) : (
                  <div className="mt-3 w-full bg-muted text-muted-foreground py-2 rounded-md font-medium flex items-center justify-center">
                    <AlertCircle size={16} className="mr-2 text-cliente" />
                    Indisponível
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Visualização em Lista */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 p-4 flex justify-center">
                  <div className="relative w-full h-48">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="md:w-3/4 p-4 md:border-l">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Heart size={14} className="mr-1" />
                      <span>{product.likes}</span>
                      <EyeIcon size={14} className="ml-3 mr-1" />
                      <span>{product.views}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">{product.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{product.short_description}</p>
                  <div className="flex flex-wrap items-center justify-between">
                    
                    {/* Usar ProductListPrice que já tem a lógica de show_prices */}
                    <ProductListPrice
                      price={product.price}
                      salePrice={product.sale_price}
                    />
                    
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <Link
                        href={`/produto/${product.slug}`}
                        className="flex items-center bg-muted hover:bg-accent text-accent-foreground px-4 py-2 rounded-md transition-colors"
                      >
                        <Eye size={18} className="mr-2" />
                        Visualizar
                      </Link>
                      {product.has_units ? (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                          Comprar
                        </button>
                      ) : (
                        <div className="bg-muted text-muted-foreground px-4 py-2 rounded-md font-medium flex items-center">
                          <AlertCircle size={16} className="mr-2 text-cliente" />
                          Indisponível
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-muted text-muted-foreground disabled:opacity-50"
            >
              Anterior
            </button>

            {getPagination().map((page, index) =>
              page === '...' ? (
                <span key={index} className="px-3 py-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md bg-muted text-muted-foreground disabled:opacity-50"
            >
              Próxima
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
