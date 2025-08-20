"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Eye, Edit } from "lucide-react"

export function RecentProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchRecentProducts() {
      try {
        setLoading(true)

        // Buscar produtos mais recentes
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        // Processar produtos para adicionar a imagem principal
        const processedProducts = data.map((product) => {
          // Encontrar a imagem principal ou a primeira imagem
          const mainImage = product.product_images.find((img: any) => img.is_main) || product.product_images[0] || null

          return {
            ...product,
            image: mainImage ? mainImage.url : null,
          }
        })

        setProducts(processedProducts)
      } catch (err) {
        console.error("Erro ao buscar produtos recentes:", err)
        setError("Falha ao carregar produtos recentes.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProducts()
  }, [supabase])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos Recentes</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos Recentes</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos Recentes</h2>

      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center">
              <div className="w-12 h-12 relative rounded-md overflow-hidden mr-3">
                <Image
                  src={product.image || `/placeholder.svg?height=48&width=48&text=${product.name.charAt(0)}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-500">{new Date(product.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/produto/${product.slug}`}
                  target="_blank"
                  className="text-gray-500 hover:text-gray-700"
                  title="Visualizar"
                >
                  <Eye size={16} />
                </Link>
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="text-blue-500 hover:text-blue-700"
                  title="Editar"
                >
                  <Edit size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">Nenhum produto cadastrado ainda.</div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link href="/admin/products" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
          Ver todos os produtos →
        </Link>
      </div>
    </div>
  )
}
