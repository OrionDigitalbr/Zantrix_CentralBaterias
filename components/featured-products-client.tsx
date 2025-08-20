'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { ProductCardPrice } from "@/components/price-display"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number | null
  short_description?: string
  description?: string
  product_images?: Array<{
    url: string
    is_main: boolean
  }>
}

export default function FeaturedProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error: fetchError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            price,
            sale_price,
            short_description,
            product_images(url, is_main)
          `)
          .eq("active", true)
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(4)

        if (fetchError) {
          setError(fetchError.message)
          console.error("Erro ao buscar produtos em destaque:", fetchError.message, fetchError)
        } else {
          setProducts(data || [])
        }
      } catch (e: any) {
        const errorMessage = e?.message || 'Erro desconhecido'
        setError(errorMessage)
        console.error("Erro ao buscar produtos em destaque:", errorMessage, e)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Produtos em Destaque</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Produtos em Destaque</h2>

          <div className="text-center py-8 bg-card rounded-lg shadow-sm">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Nenhum produto em destaque</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No momento não temos produtos em destaque disponíveis. Por favor, volte mais tarde.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Produtos em Destaque</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Encontrar a imagem principal ou usar a primeira disponível
            const mainImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0]
            const imageUrl = mainImage?.url || "/placeholder.svg"

            return (
              <div
                key={product.id}
                className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/produto/${product.slug}`}>
                  <div className="h-48 bg-muted relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />

                    {product.sale_price && product.sale_price < product.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        OFERTA
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/produto/${product.slug}`}>
                    <h3 className="text-lg font-semibold mb-1 text-card-foreground hover:text-blue-600 transition-colors">{product.name}</h3>
                  </Link>

                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.short_description || product.description}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <ProductCardPrice
                      price={product.price}
                      salePrice={product.sale_price}
                    />

                    <Link
                      href={`/produto/${product.slug}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Ver produto
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/loja"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ver todos os produtos
          </Link>
        </div>
      </div>
    </section>
  )
}
