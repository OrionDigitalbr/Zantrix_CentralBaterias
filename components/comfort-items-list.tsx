import { createServerSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Sofa } from "lucide-react"
import { ProductCardPrice } from "@/components/price-display"

export default async function ComfortItemsList() {
  const supabase = createServerSupabaseClient()

  let products = []
  let error = null

  try {
    // Primeiro, buscar a categoria de conforto
    const { data: comfortCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "conforto")
      .single()

    if (categoryError) {
      if (categoryError.code !== "PGRST116") {
        // Não encontrado
        console.error("Erro ao buscar categoria de conforto:", categoryError)
      }
    } else if (comfortCategory) {
      // Buscar produtos da categoria de conforto
      const { data, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category_id", comfortCategory.id)
        .order("created_at", { ascending: false })
        .limit(4)

      if (productsError) {
        error = productsError
        console.error("Erro ao buscar produtos de conforto:", productsError)
      } else {
        products = data || []
      }
    }
  } catch (e) {
    error = e
    console.error("Erro ao buscar produtos de conforto:", e)
  }

  if (products.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">LISTA DE ITENS DE CONFORTO AO MOTORISTA</h2>

          <div className="text-center py-8 bg-card rounded-lg shadow-sm">
            <Sofa className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Nenhum item de conforto disponível</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No momento não temos itens de conforto cadastrados. Por favor, volte mais tarde.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">LISTA DE ITENS DE CONFORTO AO MOTORISTA</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              <Link href={`/produto/${product.slug}`}>
                <div className="h-48 bg-muted">
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Sofa className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/produto/${product.slug}`}>
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">{product.name}</h3>
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
