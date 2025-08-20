import { createServerSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Lightbulb } from "lucide-react"
import { ProductCardPrice } from "@/components/price-display"

export default async function TopLightingItems() {
  const supabase = createServerSupabaseClient()

  let products = []
  let error = null

  try {
    // Primeiro, buscar a categoria de iluminação
    const { data: lightingCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "iluminacao")
      .single()

    if (categoryError) {
      if (categoryError.code !== "PGRST116") {
        // Não encontrado
        console.error("Erro ao buscar categoria de iluminação:", categoryError)
      }
    } else if (lightingCategory) {
      // Buscar produtos da categoria de iluminação
      const { data, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category_id", lightingCategory.id)
        .order("created_at", { ascending: false })
        .limit(4)

      if (productsError) {
        error = productsError
        console.error("Erro ao buscar produtos de iluminação:", productsError)
      } else {
        products = data || []
      }
    }
  } catch (e) {
    error = e
    console.error("Erro ao buscar produtos de iluminação:", e)
  }

  if (products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">PRINCIPAIS ITENS DE ILUMINAÇÃO</h2>

          <div className="text-center py-8 bg-card rounded-lg shadow-sm">
            <Lightbulb className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Nenhum produto de iluminação disponível</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              No momento não temos produtos de iluminação cadastrados. Por favor, volte mais tarde.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">PRINCIPAIS ITENS DE ILUMINAÇÃO</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Link href={`/produto/${product.slug}`}>
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/produto/${product.slug}`}>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">{product.name}</h3>
                </Link>

                <div className="mb-4">
                  <ProductCardPrice
                    price={product.price}
                    salePrice={product.sale_price}
                  />
                </div>

                <Link
                  href={`/produto/${product.slug}`}
                  className="block text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition-colors"
                >
                  Comprar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
