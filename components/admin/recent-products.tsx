'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Loader2, Package, ArrowRight } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  created_at: string
  product_images?: Array<{
    url: string
    is_main: boolean
  }>
}

interface RecentProductsProps {
  limit?: number
  className?: string
}

export function RecentProducts({ limit = 5, className = '' }: RecentProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentProducts() {
      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()

        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            created_at,
            product_images (
              url,
              is_main
            )
          `)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        // Processar produtos para adicionar a imagem principal
        const processedProducts = data?.map((product) => {
          const mainImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0] || null
          return {
            ...product,
            image_url: mainImage ? mainImage.url : null,
          }
        }) || []

        setProducts(processedProducts)
      } catch (err: any) {
        console.error('Erro ao buscar produtos recentes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProducts()
  }, [limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (loading) {
    return (
      <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Produtos Recentes</h3>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Produtos Recentes</h3>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 text-sm">Erro ao carregar produtos: {error}</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Produtos Recentes</h3>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum produto cadastrado ainda.</p>
          <Link
            href="/admin/products/add"
            className="inline-flex items-center mt-3 text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Cadastrar primeiro produto
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Produtos Recentes</h3>
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          // Encontrar a imagem principal ou usar a primeira disponível
          const mainImage = product.product_images?.find(img => img.is_main) || product.product_images?.[0]
          const imageUrl = mainImage?.url || "/placeholder.svg?height=48&width=48&text=" + encodeURIComponent(product.name.charAt(0))

          return (
            <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="flex-shrink-0 h-12 w-12 relative rounded-md overflow-hidden bg-muted">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=48&width=48&text=" + encodeURIComponent(product.name.charAt(0))
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-orange-500 font-semibold">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(product.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/admin/products"
          className="inline-flex items-center w-full justify-center px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-md transition-colors"
        >
          Ver todos os produtos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
