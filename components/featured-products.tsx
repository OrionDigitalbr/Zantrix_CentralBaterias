import { createServerSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { ProductCardPrice } from "@/components/price-display"

export default async function FeaturedProducts() {
  let products = []
  let error = null

  try {
    const supabase = createServerSupabaseClient()
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
      error = fetchError
      console.error("Erro ao buscar produtos em destaque:", fetchError)
    } else {
      products = data || []
    }
  } catch (e) {
    error = e
    console.error("Erro ao buscar produtos em destaque:", e)
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Produtos em Destaque</h2>

          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum produto em destaque</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No momento não temos produtos em destaque disponíveis. Por favor, volte mais tarde.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Produtos em Destaque</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Encontrar a imagem principal ou usar a primeira disponível
            const mainImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0]
            const imageUrl = mainImage?.url || "/placeholder.svg"

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/produto/${product.slug}`}>
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>

                  {product.sale_price && product.sale_price < product.price && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      OFERTA
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/produto/${product.slug}`}>
                  <h3 className="text-lg font-semibold mb-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                </Link>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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
