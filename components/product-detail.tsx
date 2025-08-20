"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Share,
  TruckIcon,
  ShieldIcon,
  ChevronLeft,
  ChevronRight,
  ShoppingCartIcon as CartIcon,
  AlertCircle,
} from "lucide-react"
import { UnitSelectorModal } from "./unit-selector-modal"
import { ProductDetailPrice } from "@/components/price-display"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useNotify } from "@/contexts/notification-context"
import { useAnalytics } from "@/lib/hooks/use-analytics"

interface ProductDetailProps {
  slug: string
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const notify = useNotify()
  const { trackPageView } = useAnalytics()
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnits, setHasUnits] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar se o usuário já curtiu este produto
  useEffect(() => {
    const hasLikedBefore = localStorage.getItem(`liked_product_${slug}`) === "true"
    setHasLiked(hasLikedBefore)
  }, [slug])

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClientSupabaseClient()

        // Verificar se existem unidades disponíveis
        const { data: unitsData, error: unitsError } = await supabase
          .from("units")
          .select("id")
          .eq("active", true)
          .limit(1)

        if (unitsError) {
          console.error("Erro ao verificar unidades:", unitsError)
        } else {
          setHasUnits(unitsData && unitsData.length > 0)
        }

        // Buscar produto pelo slug
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            sku,
            description,
            short_description,
            price,
            sale_price,
            stock,
            category_id,
            brand,
            featured,
            technical_specifications,
            product_images(id, url, alt_text, is_main),
            product_attributes(id, name, value)
          `)
          .eq("slug", slug)
          .eq("active", true)
          .single()

        if (error) {
          console.error("Erro ao buscar produto:", error)
          setError("Produto não encontrado ou indisponível.")
          return
        }

        // Buscar categoria do produto usando a tabela de relacionamento
        let productCategory = null
        let parentCategory = null
        
        if (data.category_id) {
          // Buscar categoria direta
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("id, name, slug, parent_id")
            .eq("id", data.category_id)
            .single()

          if (!categoryError && categoryData) {
            productCategory = categoryData
            
            // Se for subcategoria, buscar categoria pai
            if (categoryData.parent_id) {
              const { data: parentData, error: parentError } = await supabase
                .from("categories")
                .select("id, name, slug")
                .eq("id", categoryData.parent_id)
                .single()

              if (!parentError && parentData) {
                parentCategory = parentData
              }
            }
          }
        }

        // Buscar curtidas do produto (com fallback)
        let likesCount = 0
        try {
          const { count, error: likesError } = await supabase
            .from("product_likes")
            .select("*", { count: "exact" })
            .eq("product_id", data.id)

          if (likesError) {
            console.warn("Tabela product_likes não encontrada, usando valor padrão")
            likesCount = 0
          } else {
            likesCount = count || 0
          }
        } catch (error) {
          console.warn("Erro ao buscar curtidas, usando valor padrão:", error)
          likesCount = 0
        }

        // Formatar os dados para o formato esperado pelo componente
        const formattedProduct = {
          ...data,
          images: data.product_images.map((img: any) => img.url),
          features: data.product_attributes
            .filter((attr: any) => attr.name.toLowerCase().includes("feature"))
            .map((attr: any) => attr.value),
          specifications: data.product_attributes.reduce((acc: any, attr: any) => {
            if (!attr.name.toLowerCase().includes("feature")) {
              acc[attr.name] = attr.value
            }
            return acc
          }, {}),
          category: parentCategory ? parentCategory.name : (productCategory?.name || 'Sem categoria'),
          categorySlug: parentCategory ? parentCategory.slug : (productCategory?.slug || ''),
          subcategory: parentCategory ? (productCategory?.name || null) : null,
          subcategorySlug: parentCategory ? (productCategory?.slug || null) : null,
          likes: likesCount || 0,
        }

        setProduct(formattedProduct)
        setLikes(likesCount || 0)

        // ✅ Rastrear visualização do produto com UUID correto
        console.log('📊 [PRODUCT DETAIL] Rastreando visualização do produto:', {
          id: formattedProduct.id,
          name: formattedProduct.name,
          slug: slug
        })

        // Usar o UUID do produto para analytics
        trackPageView('product', formattedProduct.id)

        console.log('✅ [PRODUCT DETAIL] Produto carregado:', formattedProduct.name)
      } catch (error) {
        console.error("Erro ao buscar produto:", error)
        setError("Ocorreu um erro ao carregar o produto. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="h-[400px] bg-muted rounded-lg mb-4"></div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="h-8 bg-muted rounded mb-4 w-3/4"></div>
            <div className="h-10 bg-muted rounded mb-6 w-full"></div>
            <div className="h-6 bg-muted rounded mb-4 w-1/2"></div>
            <div className="h-24 bg-muted rounded mb-6"></div>
            <div className="h-40 bg-muted rounded mb-6"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-6">{error || "Este produto não está disponível no momento."}</p>
        <Link
          href="/loja"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleBuyClick = () => {
    if (hasUnits) {
      setIsUnitModalOpen(true)
    }
  }

  const handleUnitSelect = (whatsappUrl: string) => {
    window.open(whatsappUrl, "_blank")
    setIsUnitModalOpen(false)
  }

  const handleLike = async () => {
    if (hasLiked) return

    try {
      const supabase = createClientSupabaseClient()

      // Adicionar curtida
      await supabase.from("product_likes").insert({
        product_id: product.id,
        ip_address: "anonymous", // Em produção, usar o IP real do usuário
        created_at: new Date().toISOString(),
      })

      // Atualizar contagem
      setLikes(likes + 1)
      setHasLiked(true)

      // Salvar no localStorage para evitar curtidas duplicadas
      localStorage.setItem(`liked_product_${product.id}`, "true")
    } catch (error) {
      console.error("Erro ao curtir produto:", error)
      // Fallback para comportamento offline
      setLikes(likes + 1)
      setHasLiked(true)
    }
  }

  const handleShare = () => {
    try {
      if (navigator.share && typeof navigator.share === "function") {
        navigator
          .share({
            title: product.name,
            text: product.short_description || product.description.substring(0, 100) + "...",
            url: window.location.href,
          })
          .catch((error) => {
            console.log("Erro ao compartilhar:", error)
            // Fallback para cópia do link
            copyToClipboard()
          })
      } else {
        // Fallback para navegadores que não suportam a API Web Share
        copyToClipboard()
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
      // Fallback final
      copyToClipboard()
    }
  }

  // Função auxiliar para copiar para a área de transferência
  const copyToClipboard = () => {
    try {
      // Método moderno de copiar para a área de transferência
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            notify.success("Link Copiado", "Link copiado para a área de transferência!")
          })
          .catch((err) => {
            console.error("Erro ao copiar com clipboard API:", err)
            // Fallback para o método antigo
            fallbackCopyToClipboard()
          })
      } else {
        // Fallback para o método antigo
        fallbackCopyToClipboard()
      }
    } catch (error) {
      console.error("Erro ao copiar para área de transferência:", error)
      notify.error("Erro ao Copiar", "Não foi possível copiar o link. Por favor, copie manualmente: " + window.location.href)
    }
  }

  // Método antigo de copiar para a área de transferência
  const fallbackCopyToClipboard = () => {
    const textArea = document.createElement("textarea")
    textArea.value = window.location.href
    textArea.style.position = "fixed" // Evita rolar para o elemento
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        notify.success("Link Copiado", "Link copiado para a área de transferência!")
      } else {
        notify.error("Erro ao Copiar", "Não foi possível copiar o link. Por favor, copie manualmente: " + window.location.href)
      }
    } catch (err) {
      console.error("Erro ao executar execCommand:", err)
      notify.error("Erro ao Copiar", "Não foi possível copiar o link. Por favor, copie manualmente: " + window.location.href)
    }

    document.body.removeChild(textArea)
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Imagens do produto */}
        <div className="md:w-1/2">
          <div className="relative h-[400px] rounded-lg overflow-hidden mb-4">
            <Image
              src={product.images[currentImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card rounded-full p-2 shadow-md text-card-foreground hover:bg-muted"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-card rounded-full p-2 shadow-md text-card-foreground hover:bg-muted"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                  index === currentImage ? "border-orange-500" : "border-border"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Imagem ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Informações do produto */}
        <div className="md:w-1/2">
          <div className="mb-2">
            <Link href="/loja" className="text-orange-500 hover:text-orange-600 text-sm">
              Voltar para Loja
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Link href={`/loja?categoria=${product.categorySlug}`} className="text-muted-foreground text-sm">
              {product.category}
            </Link>
            {product.subcategory && (
              <>
                <span className="text-muted-foreground">/</span>
                <Link href={`/loja?categoria=${product.subcategorySlug}`} className="text-muted-foreground text-sm">
                  {product.subcategory}
                </Link>
              </>
            )}
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

          <div className="mb-6">
            <ProductDetailPrice
              price={product.price}
              salePrice={product.sale_price}
            />
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground mb-4">{product.description}</p>
            {product.features && product.features.length > 0 && (
              <ul className="space-y-1">
                {product.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="text-foreground mr-4">Quantidade:</span>
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-1 text-muted-foreground hover:bg-muted"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-border">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 text-muted-foreground hover:bg-muted"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="ml-4 text-sm text-muted-foreground">
                {product.stock} {product.stock === 1 ? "unidade" : "unidades"} disponíveis
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {hasUnits ? (
                <button
                  onClick={handleBuyClick}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <CartIcon className="w-5 h-5 mr-2" />
                  Comprar pelo WhatsApp
                </button>
              ) : (
                <div className="flex-1 bg-muted text-muted-foreground font-bold py-3 px-6 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Produto indisponível no momento
                </div>
              )}
              <button
                className={`p-3 border rounded-lg transition-colors flex items-center ${
                  hasLiked ? "border-red-300 bg-red-50 text-red-500" : "border-border text-muted-foreground hover:bg-muted"
                }`}
                onClick={handleLike}
                disabled={hasLiked}
              >
                <Heart size={20} className={hasLiked ? "fill-current" : ""} />
                {likes > 0 && <span className="ml-1 text-sm">{likes}</span>}
              </button>
              <button
                className="p-3 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                onClick={handleShare}
              >
                <Share size={20} />
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-start mb-3">
              <TruckIcon className="text-muted-foreground mr-2 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-foreground font-medium">Entrega disponível</p>
                <p className="text-muted-foreground text-sm">Consulte o prazo e o valor do frete</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShieldIcon className="text-muted-foreground mr-2 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-foreground font-medium">
                  Garantia de {product.specifications?.Garantia || "12 meses"}
                </p>
                <p className="text-muted-foreground text-sm">Garantia do fabricante contra defeitos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasUnits && (
        <UnitSelectorModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          onSelectUnit={handleUnitSelect}
          productName={product.name}
          productSku={product.sku}
          quantity={quantity}
        />
      )}
    </div>
  )
}
