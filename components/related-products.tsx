"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ProductCardPrice } from "@/components/price-display"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

interface RelatedProduct {
  id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  image_url?: string | null
}

interface RelatedProductsProps {
  categoryId?: number
  currentProductId?: number
  limit?: number
}

export function RelatedProducts({ 
  categoryId, 
  currentProductId, 
  limit = 4 
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!categoryId) return
      
      setLoading(true)
      setError(null)

      try {
        const supabase = createClientSupabaseClient()

        // Construir a query base
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            sale_price,
            product_images!left(url, is_main)
          `)
          .eq('active', true)
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false })
          .limit(limit + 1) // Pegar um a mais para compensar o produto atual

        // Se temos um ID de produto atual, garantir que não o incluímos nos relacionados
        if (currentProductId) {
          query = query.neq('id', currentProductId)
        }

        const { data, error: queryError } = await query

        if (queryError) {
          throw queryError
        }

        // Se não encontrou produtos relacionados, buscar produtos em destaque
        if (!data || data.length === 0) {
          await fetchFeaturedProducts()
          return
        }

        // Formatar os dados para o formato esperado
        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          sale_price: product.sale_price,
          image_url: product.product_images?.find((img: any) => img.is_main)?.url || 
                    product.product_images?.[0]?.url || 
                    '/placeholder.svg'
        }))

        // Garantir que não excedemos o limite
        setRelatedProducts(formattedProducts.slice(0, limit))
      } catch (error) {
        console.error('Erro ao buscar produtos relacionados:', error)
        setError('Não foi possível carregar os produtos relacionados.')
      } finally {
        setLoading(false)
      }
    }

    async function fetchFeaturedProducts() {
      try {
        const supabase = createClientSupabaseClient()
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            sale_price,
            product_images!left(url, is_main)
          `)
          .eq('active', true)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        if (data && data.length > 0) {
          const formattedProducts = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            sale_price: product.sale_price,
            image_url: product.product_images?.find((img: any) => img.is_main)?.url || 
                      product.product_images?.[0]?.url || 
                      '/placeholder.svg'
          }))

          setRelatedProducts(formattedProducts)
        }
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error)
        setError('Não foi possível carregar os produtos em destaque.')
      }
    }

    if (categoryId) {
      fetchRelatedProducts()
    } else {
      // Se não houver categoryId, buscar produtos em destaque
      fetchFeaturedProducts()
    }
  }, [categoryId, currentProductId, limit])

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Produtos Relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-4 flex justify-center">
                <Skeleton className="w-40 h-40 bg-muted" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-10 w-full mt-4 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      </section>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-foreground mb-8">Produtos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/produto/${product.slug}`}
            className="group bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <div className="p-4 flex-1 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex flex-col flex-1">
              <h3 className="text-lg font-semibold mb-2 text-card-foreground group-hover:text-green-600 transition-colors line-clamp-2" title={product.name}>
                {product.name}
              </h3>
              <div className="mt-auto">
                <ProductCardPrice price={product.price} salePrice={product.sale_price} />
                <button 
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Comprar
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
