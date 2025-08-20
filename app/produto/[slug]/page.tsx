import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { RelatedProducts } from "@/components/related-products"
import { ProductTabs } from "@/components/product-tabs"
import { createServerSupabaseClient } from "@/lib/supabase"

interface Product {
  id: number
  name: string
  description: string
  short_description: string
  technical_specifications: { name: string; value: string }[]
  category_id?: number
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Buscar dados do produto no servidor para passar para ProductTabs
  let product: Product | null = null
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        short_description,
        technical_specifications,
        category_id
      `)
      .eq("slug", slug)
      .eq("active", true)
      .single()

    product = data as Product | null
  } catch (error) {
    console.error("Erro ao buscar produto para tabs:", error)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <ProductDetail slug={slug} />
        <ProductTabs product={product} />
        {product && (
          <RelatedProducts 
            categoryId={product.category_id}
            currentProductId={product.id}
          />
        )}
      </div>

      <Footer />
    </main>
  )
}
