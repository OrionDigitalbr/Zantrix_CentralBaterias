"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useNotify } from "@/contexts/notification-context"

interface SimpleProductFormProps {
  productId?: string
}

export function SimpleProductForm({ productId }: SimpleProductFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const isEditing = !!productId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    short_description: "",
    price: 0,
    sale_price: null as number | null,
    stock: 0,
    category_id: 0,
    brand: "",
    featured: false,
    active: true,
    video_url: "",
  })

  const [units, setUnits] = useState<any[]>([])
  const [selectedUnits, setSelectedUnits] = useState<number[]>([])
  const [images, setImages] = useState<any[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Criar cliente Supabase dentro do useEffect
        const supabase = createClientSupabaseClient()

        // Buscar categorias
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .eq("active", true)
          .order("name")

        setCategories(categoriesData || [])

        // Buscar unidades
        const { data: unitsData } = await supabase
          .from("units")
          .select("*")
          .eq("active", true)
          .order("name")

        setUnits(unitsData || [])

        // Se estiver editando, buscar produto
        if (isEditing && productId) {
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single()

          if (productError) {
            setError("Produto não encontrado")
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
              video_url: productData.video_url || "",
            })

            // Buscar imagens do produto
            const { data: imagesData } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", productId)
              .order("display_order")

            if (imagesData) {
              setImages(imagesData)
            }

            // Buscar unidades do produto
            const { data: productUnitsData } = await supabase
              .from("product_units")
              .select("unit_id")
              .eq("product_id", productId)

            if (productUnitsData) {
              setSelectedUnits(productUnitsData.map((pu) => pu.unit_id))
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isEditing, productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement
      setProduct((prev) => ({ ...prev, [name]: checked }))
    } else if (name === "price" || name === "sale_price" || name === "stock") {
      const numValue = Number(value) || 0
      setProduct((prev) => ({
        ...prev,
        [name]: name === "sale_price" && numValue === 0 ? null : numValue
      }))
    } else if (name === "category_id") {
      setProduct((prev) => ({ ...prev, [name]: Number(value) || 0 }))
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }))
    }

    // Gerar slug automaticamente
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      setProduct((prev) => ({ ...prev, slug }))
    }
  }

  const handleUnitChange = (unitId: number, checked: boolean) => {
    if (checked) {
      setSelectedUnits(prev => [...prev, unitId])
    } else {
      setSelectedUnits(prev => prev.filter(id => id !== unitId))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prev => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.name || !product.slug || !product.category_id) {
      notify.error("Campos Obrigatórios", "Preencha nome, slug e categoria")
      return
    }

    try {
      setSaving(true)

      // Criar cliente Supabase dentro da função
      const supabase = createClientSupabaseClient()

      let productIdToUse = productId

      if (isEditing && productId) {
        // Atualizar produto
        const { error } = await supabase
          .from("products")
          .update(product)
          .eq("id", productId)

        if (error) throw error
      } else {
        // Criar produto
        const { data, error } = await supabase
          .from("products")
          .insert(product)
          .select()
          .single()

        if (error) throw error
        productIdToUse = data.id
      }

      // Salvar unidades selecionadas
      if (productIdToUse && selectedUnits.length > 0) {
        // Remover unidades existentes se estiver editando
        if (isEditing) {
          await supabase
            .from("product_units")
            .delete()
            .eq("product_id", productIdToUse)
        }

        // Inserir novas unidades
        const unitInserts = selectedUnits.map(unitId => ({
          product_id: Number(productIdToUse),
          unit_id: unitId
        }))

        await supabase
          .from("product_units")
          .insert(unitInserts)
      }

      // Upload de imagens (simplificado por enquanto)
      if (newImages.length > 0) {
        console.log("Imagens para upload:", newImages.length)
        // TODO: Implementar upload de imagens
      }

      notify.success(
        isEditing ? "Produto Atualizado" : "Produto Criado",
        isEditing ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!"
      )
      router.push("/admin/products")
    } catch (err) {
      console.error("Erro ao salvar:", err)
      notify.error("Erro ao Salvar", "Erro ao salvar produto: " + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={product.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Preço (R$) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={product.category_id || ""}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={product.description}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={product.active}
          onChange={handleChange}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Produto Ativo
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="inline-block mr-2 h-4 w-4" />
          Voltar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="inline-block mr-2 h-4 w-4" />
              {isEditing ? "Atualizar" : "Criar"} Produto
            </>
          )}
        </button>
      </div>
    </form>
  )
}
