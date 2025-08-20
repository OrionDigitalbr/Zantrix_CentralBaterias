"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useNotify } from "@/contexts/notification-context"
import { createNotification } from "@/lib/notifications"
import { ProductBasicInfo } from "./product-form/product-basic-info"
import { ProductMediaManager } from "./product-form/product-media-manager"
import { ProductUnitsSelector } from "./product-form/product-units-selector"
import { ProductDescription } from "./product-form/product-description"
import { ProductFormActions } from "./product-form/product-form-actions"
import { useProductValidation } from "@/hooks/use-product-validation"
import type { Category, Unit, ProductImage } from "@/lib/database.types"

interface ProductFormProps {
  productId?: string
}

interface ProductState {
  name: string
  slug: string
  sku: string
  description: string
  short_description: string
  price: number
  sale_price: number | null
  stock: number
  category_id: number
  brand: string
  featured: boolean
  active: boolean
  video_url: string | null
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const isEditing = !!productId
  const supabase = createClientSupabaseClient()
  const { validateProduct, clearErrors, hasErrors } = useProductValidation()

  // Estados consolidados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnits, setSelectedUnits] = useState<number[]>([])
  const [images, setImages] = useState<ProductImage[]>([])

  const [product, setProduct] = useState<ProductState>({
    name: "",
    slug: "",
    sku: "",
    description: "",
    short_description: "",
    price: 0,
    sale_price: null,
    stock: 0,
    category_id: 0,
    brand: "",
    featured: false,
    active: true,
    video_url: null,
  })

  // Função para atualizar produto usando useCallback para otimização
  const updateProduct = useCallback((field: string, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }))
  }, [])

  // Função para buscar dados usando useCallback
  const fetchData = useCallback(async () => {
      try {
        setLoading(true)
        setError(null)

      // Buscar categorias
          const { data: categoriesData, error: categoriesError } = await supabase
            .from("categories")
            .select("*")
            .eq("active", true)
            .order("name")

          if (categoriesError) {
            console.warn("Erro ao buscar categorias:", categoriesError)
            setCategories([])
          } else {
            setCategories(categoriesData || [])
        }

      // Buscar unidades
          const { data: unitsData, error: unitsError } = await supabase
            .from("units")
            .select("*")
            .eq("active", true)
            .order("name")

          if (unitsError) {
            console.warn("Erro ao buscar unidades:", unitsError)
            setUnits([])
          } else {
            setUnits(unitsData || [])
        }

      // Se estiver editando, buscar produto
        if (isEditing && productId) {
            const { data: productData, error: productError } = await supabase
              .from("products")
              .select("*")
              .eq("id", productId)
              .single()

            if (productError) {
              console.error("Erro ao buscar produto:", productError)
              setError("Produto não encontrado ou erro ao carregar dados.")
            } else {
              setProduct({
                name: productData.name || "",
                slug: productData.slug || "",
                sku: productData.sku || "",
                description: productData.description || "",
                short_description: productData.short_description || "",
                price: productData.price || 0,
                sale_price: productData.sale_price,
                stock: productData.stock || 0,
                category_id: productData.category_id || 0,
                brand: productData.brand || "",
                featured: productData.featured || false,
                active: productData.active !== false,
                video_url: productData.video_url,
              })

              // Buscar imagens do produto
                const { data: imagesData, error: imagesError } = await supabase
                  .from("product_images")
                  .select("*")
                  .eq("product_id", productId)
                  .order("display_order")

                if (!imagesError && imagesData) {
                  setImages(imagesData)
              }

              // Buscar unidades do produto
                const { data: productUnitsData, error: productUnitsError } = await supabase
                  .from("product_units")
                  .select("unit_id")
                  .eq("product_id", productId)

                if (!productUnitsError && productUnitsData) {
                  setSelectedUnits(productUnitsData.map((pu) => pu.unit_id))
                }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError("Falha ao carregar dados. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
  }, [isEditing, productId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Função de submissão usando useCallback
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      clearErrors()

      // Validar dados usando hook customizado
      const isValid = validateProduct({
        name: product.name,
        slug: product.slug,
        category_id: product.category_id,
        price: product.price,
        selectedUnits
      })

      if (!isValid) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, corrija os erros de validação.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      let finalProductId: number

      if (isEditing && productId) {
        // Atualizar produto existente
        const { data, error } = await supabase
          .from("products")
          .update(product)
          .eq("id", Number(productId))
          .select()

        if (error) throw error
        finalProductId = data[0].id
      } else {
        // Criar novo produto
        const { data, error } = await supabase
          .from("products")
          .insert(product)
          .select()

        if (error) throw error
        finalProductId = data[0].id
      }

      // Salvar imagens
      if (images.length > 0) {
        // Primeiro, remover todas as imagens existentes se estiver editando
        if (isEditing && productId) {
          await supabase
            .from("product_images")
            .delete()
            .eq("product_id", finalProductId)
        }

        // Inserir todas as imagens
        const imageInserts = images
          .filter((img) => img.url && !img.url.startsWith("blob:"))
          .map((img, index) => ({
            product_id: finalProductId,
            url: img.url,
            alt_text: img.alt_text || `${product.name} - Imagem ${index + 1}`,
            is_main: img.is_main || index === 0,
            display_order: index + 1
          }))

        if (imageInserts.length > 0) {
          const { error: imagesError } = await supabase
            .from("product_images")
            .insert(imageInserts)

          if (imagesError) {
            throw new Error("Erro ao salvar imagens do produto")
          }
        }
      }

      // Atualizar unidades do produto
      if (isEditing) {
        await supabase.from("product_units").delete().eq("product_id", finalProductId)
      }

      // Adicionar as unidades selecionadas
      const productUnits = selectedUnits.map((unitId) => ({
        product_id: finalProductId,
        unit_id: unitId,
      }))

      if (productUnits.length > 0) {
        const { error: unitsError } = await supabase
          .from("product_units")
          .insert(productUnits)
        if (unitsError) throw unitsError
      }

      // Notificação de sucesso
      const notificationTitle = isEditing ? "Produto Atualizado" : "Novo Produto Criado"
      const notificationMessage = `O produto "${product.name}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`
      
      notify.success(notificationTitle, notificationMessage)

      // Criar notificação no sistema
      const { data: { user: adminUser } } = await supabase.auth.getUser()
      if (adminUser) {
        await createNotification({
          user_id: adminUser.id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'success'
        })
      }

      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: notificationMessage,
      })

      router.push("/admin/products")
    } catch (err) {
      console.error("Erro ao salvar produto:", err)
      setError("Falha ao salvar produto. Por favor, tente novamente.")
      setSaving(false)

      notify.error(
        "Erro ao Salvar Produto",
        "Ocorreu um erro ao salvar o produto. Verifique os dados e tente novamente."
      )

      toast({
        title: "Erro ao salvar produto",
        description: "Ocorreu um erro ao salvar o produto. Tente novamente.",
        variant: "destructive",
      })
    }
  }, [product, selectedUnits, images, isEditing, productId, supabase, router, notify, clearErrors, validateProduct, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-all duration-200 hover:scale-105"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <ProductBasicInfo 
        product={product} 
        categories={categories} 
        onChange={updateProduct} 
      />

      <ProductUnitsSelector 
        units={units} 
        selectedUnits={selectedUnits} 
        onUnitsChange={setSelectedUnits} 
      />

      <ProductDescription 
        shortDescription={product.short_description} 
        description={product.description} 
        onChange={updateProduct} 
      />

      <ProductMediaManager 
        images={images} 
        videoUrl={product.video_url} 
        onImagesChange={setImages} 
        onVideoChange={(url) => updateProduct("video_url", url)} 
        productName={product.name} 
      />

      <ProductFormActions 
        saving={saving} 
        onSave={handleSubmit} 
      />
    </form>
  )
}
