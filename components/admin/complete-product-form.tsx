"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClientSupabaseClient } from "@/lib/supabase"
import { uploadProductImage } from "@/lib/storage"
import { Loader2, Save, ArrowLeft, X, Plus, Video, Check } from "lucide-react"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { MultiSelect, type Option } from "@/components/ui/multi-select"
import { useNotify } from "@/contexts/notification-context"
import { TechnicalSpecificationsManager, type Specification } from "@/components/admin/technical-specifications-manager"

interface CompleteProductFormProps {
  productId?: string
}

export function CompleteProductForm({ productId }: CompleteProductFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const isEditing = !!productId
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [selectedUnits, setSelectedUnits] = useState<number[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [images, setImages] = useState<any[]>([])
  const [newImages, setNewImages] = useState<any[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    short_description: "",
    price: 0,
    sale_price: null as number | null,
    stock: 0,
    brand: "",
    featured: false,
    active: true,
    video_url: "",
    technical_specifications: [] as Specification[],
  })

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        if (isEditing && productId) {
          // Usar endpoint admin para carregar todos os dados
          console.log('🔍 [EDITOR] Carregando dados via endpoint admin...')
          
          const response = await fetch(`/api/admin/products/${productId}/editor-data`, { 
            cache: "no-store" 
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erro ao carregar dados do produto')
          }
          
          const editorData = await response.json()
          console.log('✅ [EDITOR] Dados carregados:', editorData)
          
          // Configurar produto
          setProduct({
            name: editorData.product.name || "",
            slug: editorData.product.slug || "",
            sku: editorData.product.sku || "",
            description: editorData.product.description || "",
            short_description: editorData.product.short_description || "",
            price: editorData.product.price || 0,
            sale_price: editorData.product.sale_price,
            stock: editorData.product.stock || 0,
            brand: editorData.product.brand || "",
            featured: editorData.product.featured || false,
            active: editorData.product.active !== false,
            video_url: editorData.product.video_url || "",
            technical_specifications: editorData.product.technical_specifications || [],
          })

          // Configurar categorias e unidades
          setCategories(editorData.categories || [])
          setSelectedCategories(editorData.selectedCategoryIds || [])
          setUnits(editorData.units || [])
          setSelectedUnits(editorData.selectedUnitIds || [])
          
          // Configurar imagens
          setImages(editorData.images || [])
          
        } else {
          // Para criação, carregar apenas categorias e unidades disponíveis
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

  const handleTechnicalSpecificationsChange = (specifications: Specification[]) => {
    setProduct(prev => ({
      ...prev,
      technical_specifications: specifications
    }))
  }

  // Função para log de erros detalhado
  const logError = (tag: string, error: unknown) => {
    if (error instanceof Error) {
      console.error(`${tag}:`, error.message)
      console.error('Stack:', error.stack)
    } else if (typeof error === 'object' && error !== null) {
      console.error(`${tag}:`, JSON.stringify(error, null, 2))
    } else {
      console.error(`${tag}:`, String(error))
    }
  }

  // Função para garantir que o bucket existe
  const ensureBucket = async () => {
    try {
      const response = await fetch("/api/admin/storage/ensure-bucket", { method: "POST" })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Erro ao garantir bucket: ${error.error}`)
      }
      console.log('✅ [UPLOAD] Bucket garantido')
    } catch (error) {
      console.error('❌ [UPLOAD] Erro ao garantir bucket:', error)
      throw error
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImages(true)

    try {
      // Garantir que o bucket existe antes de fazer upload
      await ensureBucket()
      
      const uploaded: string[] = []
      
      for (const file of files) {
        // Validação já feita no servidor, mas dupla verificação no client
        if (file.size > 10 * 1024 * 1024) { // 10MB
          notify.error("Arquivo Muito Grande", `Arquivo ${file.name} é muito grande (máximo 10MB)`)
          continue
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          notify.error("Tipo Inválido", `Arquivo ${file.name} não é um tipo de imagem válido`)
          continue
        }

        const fd = new FormData()
        fd.append("file", file)

        console.log('🔍 [UPLOAD] Enviando arquivo:', { name: file.name, size: file.size, type: file.type })

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
        const json = await res.json()
        
        console.log('🔍 [UPLOAD] Resposta da API:', { status: res.status, ok: res.ok, json })
        
        if (!res.ok) {
          logError("❌ [UPLOAD] Erro no upload", json)
          const errorMessage = json.error || json.message || 'Erro desconhecido'
          notify.error("Erro no Upload", `Falha ao subir ${file.name}: ${errorMessage}`)
          continue
        }
        
        if (json.url) {
          uploaded.push(json.url)
          console.log('✅ [UPLOAD] Arquivo enviado com sucesso:', json.url)
        } else {
          logError("❌ [UPLOAD] Resposta sem URL", json)
          notify.error("Erro no Upload", `Resposta inválida para ${file.name}`)
          continue
        }
      }

      // Adicionar URLs das imagens ao estado
      if (uploaded.length > 0) {
        setNewImages(prev => [
          ...prev,
          ...uploaded.map(url => ({
            file: null,
            url,
            path: url.split('/').pop(),
            uploaded: true
          }))
        ])
        
        notify.success("Upload Concluído", `${uploaded.length} imagem(ns) carregada(s) com sucesso!`)
      }
    } catch (error) {
      logError("❌ [UPLOAD] Erro inesperado", error)
      notify.error("Erro no Upload", "Erro inesperado ao fazer upload das imagens")
    } finally {
      setUploadingImages(false)
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageId: number) => {
    try {
      const supabase = createClientSupabaseClient()

      // Buscar dados da imagem para deletar do storage
      const imageToDelete = images.find(img => img.id === imageId)
      if (imageToDelete?.path) {
        await supabase.storage
          .from('product-images')
          .remove([imageToDelete.path])
      }

      // Remover do banco de dados
      await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      // Remover da lista local
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      notify.error("Erro ao Remover", "Erro ao remover imagem")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🚀 [TESTE CRIAÇÃO] Iniciando criação de produto...')
    console.log('📋 [TESTE CRIAÇÃO] Dados do produto:', product)
    console.log('📂 [TESTE CRIAÇÃO] Categorias selecionadas:', selectedCategories)
    console.log('🏢 [TESTE CRIAÇÃO] Unidades selecionadas:', selectedUnits)

    if (!product.name || !product.slug || selectedCategories.length === 0) {
      console.error('❌ [TESTE CRIAÇÃO] Validação falhou:', {
        name: !!product.name,
        slug: !!product.slug,
        categories: selectedCategories.length
      })
      notify.error("Campos Obrigatórios", "Preencha nome, slug e selecione pelo menos uma categoria")
      return
    }

    try {
      setSaving(true)

      // Validação robusta dos dados
      const numericProductId = Number(productId)
      if (isEditing && (!numericProductId || Number.isNaN(numericProductId))) {
        throw new Error("ID do produto inválido para edição")
      }

      if (selectedCategories.length === 0) {
        throw new Error("Selecione pelo menos uma categoria")
      }

      // Preparar payload validado
      const payload = {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        short_description: product.short_description,
        price: Number(product.price) || 0,
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        stock: Number(product.stock) || 0,
        brand: product.brand,
        featured: product.featured || false,
        active: product.active !== false,
        video_url: product.video_url,
        technical_specifications: product.technical_specifications || [],
        category_ids: selectedCategories,
        unit_ids: selectedUnits
      }

      console.log('🔍 [DEBUG] Payload validado:', JSON.stringify(payload, null, 2))

      if (isEditing && numericProductId) {
        console.log('✏️ [TESTE CRIAÇÃO] Atualizando produto existente:', numericProductId)
        
        // Atualizar via API
        const response = await fetch(`/api/admin/products/${numericProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao atualizar produto')
        }

        console.log('✅ [TESTE CRIAÇÃO] Produto atualizado com sucesso')
      } else {
        console.log('🆕 [TESTE CRIAÇÃO] Criando novo produto...')
        
        // Para criação, usar a API existente ou criar uma nova
        // Por enquanto, vou manter a lógica existente para criação
        notify.info("Funcionalidade", "Criação de produtos será implementada em breve")
        return
      }

      // Salvar imagens via API
      if (newImages.length > 0) {
        const imageInserts = newImages
          .filter((img: any) => img.uploaded && img.url)
          .map((img: any, index: number) => ({
            product_id: Number(numericProductId),
            url: img.url,
            alt_text: `${product.name} - Imagem ${index + 1}`,
            display_order: images.length + index + 1,
            is_main: index === 0 && images.length === 0
          }))

        if (imageInserts.length > 0) {
          const imageResponse = await fetch('/api/admin/products/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'insert',
              data: { images: imageInserts }
            })
          })

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json()
            console.warn('⚠️ [TESTE CRIAÇÃO] Erro ao salvar imagens:', errorData.error)
          }
        }
      }

      console.log('🎉 [TESTE CRIAÇÃO] Produto salvo com sucesso!')
      console.log('🔄 [TESTE CRIAÇÃO] Redirecionando para lista de produtos...')

      notify.success(
        isEditing ? "Produto Atualizado" : "Produto Criado",
        isEditing ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!"
      )

      // Aguardar um pouco antes de redirecionar para garantir que a notificação seja vista
      setTimeout(() => {
        router.push("/admin/products")
      }, 1500)
    } catch (err) {
      console.error("❌ [TESTE CRIAÇÃO] Erro ao salvar:", err)
      notify.error("Erro ao Salvar", "Erro ao salvar produto: " + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="Digite o nome do produto"
            />
            <p className="text-xs text-muted-foreground mt-1">URL amigável do produto (gerada automaticamente)</p>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={product.slug}
              onChange={handleChange}
              required
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="slug-do-produto"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium mb-1">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="Código do produto"
            />
          </div>

                    <div>
            <label htmlFor="brand" className="block text-sm font-medium mb-1">
              Marca
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={product.brand}
              onChange={handleChange}
              className=" border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 w-full"
              placeholder="Marca do produto"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Categorias * (selecione uma ou mais)
            </label>
            <MultiSelect
              options={categories.map((category) => ({
                label: category.name,
                value: category.id
              }))}
              selected={selectedCategories}
              onChange={(values) => setSelectedCategories(values as number[])}
              placeholder="Selecione as categorias..."
              className="border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 w-full"
            />
            {selectedCategories.length === 0 && (
              <p className=" text-xs text-destructive mt-1">Selecione pelo menos uma categoria</p>
            )}
          </div>


        </div>
      </div>

      {/* Preços e Estoque */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Preços e Estoque</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
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
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="sale_price" className="block text-sm font-medium mb-1">
              Preço Promocional (R$)
            </label>
            <input
              type="number"
              id="sale_price"
              name="sale_price"
              step="0.01"
              min="0"
              value={product.sale_price || ""}
              onChange={handleChange}
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="Deixe em branco se não houver promoção"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1">
              Estoque
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={product.stock}
              onChange={handleChange}
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-3 border border-border rounded-md">
            <ToggleSwitch
              checked={product.featured}
              onCheckedChange={(checked) => setProduct(prev => ({ ...prev, featured: checked }))}
            />
            <label
              className="text-sm font-medium cursor-pointer flex-1"
              onClick={() => setProduct(prev => ({ ...prev, featured: !prev.featured }))}
            >
              Produto em Destaque
            </label>
          </div>

          <div className="flex items-center space-x-3 p-3 border border-border rounded-md">
            <ToggleSwitch
              checked={product.active}
              onCheckedChange={(checked) => setProduct(prev => ({ ...prev, active: checked }))}
            />
            <label
              className="text-sm font-medium cursor-pointer flex-1"
              onClick={() => setProduct(prev => ({ ...prev, active: !prev.active }))}
            >
              Ativo
            </label>
          </div>
        </div>
      </div>

      {/* Descrições */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Descrições</h3>

        <div className="space-y-6">
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium mb-1">
              Descrição Curta
            </label>
            <textarea
              id="short_description"
              name="short_description"
              value={product.short_description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="Descrição resumida do produto"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição Completa
            </label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={6}
              className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              placeholder="Descrição detalhada do produto"
            />
          </div>
        </div>
      </div>

      {/* Especificações Técnicas */}
      <TechnicalSpecificationsManager
        initialSpecifications={product.technical_specifications}
        onChange={handleTechnicalSpecificationsChange}
      />

      {/* Unidades Disponíveis */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Unidades Disponíveis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map((unit) => (
            <div key={unit.id} className="flex items-center space-x-3 p-3 border border-border rounded-md hover:bg-muted">
              <ToggleSwitch
                checked={selectedUnits.includes(unit.id)}
                onCheckedChange={(checked) => handleUnitChange(unit.id, checked)}
              />
              <label
                className="text-sm font-medium cursor-pointer flex-1"
                onClick={() => handleUnitChange(unit.id, !selectedUnits.includes(unit.id))}
              >
                {unit.name}
              </label>
            </div>
          ))}
        </div>

        {units.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma unidade cadastrada</p>
        )}
      </div>

      {/* Imagens do Produto */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Imagens do Produto</h3>

        {/* Imagens Existentes */}
        {images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Imagens Atuais</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <Image
                    src={image.url}
                    alt={image.alt_text}
                    width={150}
                    height={150}
                    className="w-full h-32 object-cover rounded-md border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload de Novas Imagens */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? (
              <>
                <Loader2 className="h-8 w-8 mx-auto text-primary mb-2 animate-spin" />
                <p className="text-muted-foreground">Fazendo upload...</p>
              </>
            ) : (
              <>
                <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Adicionar Imagens</p>
              </>
            )}
          </button>

          {/* Preview das Novas Imagens */}
          {newImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-3">Novas Imagens</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((imageData: any, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={imageData.uploaded ? imageData.url : URL.createObjectURL(imageData.file || imageData)}
                      alt={`Nova imagem ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {imageData.uploaded && (
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Você pode adicionar até 10 imagens. Clique em uma imagem para defini-la como principal.
          </p>
        </div>
      </div>

      {/* Vídeo do Produto */}
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border ">
        <h3 className="text-lg font-semibold mb-4">Vídeo do Produto</h3>

        <div>
          <label htmlFor="video_url" className="block text-sm font-medium mb-1">
            URL do Vídeo (YouTube, Vimeo, etc.)
          </label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            value={product.video_url}
            onChange={handleChange}
            className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="mt-4">
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            accept="video/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
          >
            <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Adicionar Vídeo</p>
          </button>

          {videoFile && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm text-foreground">
                <strong>Arquivo selecionado:</strong> {videoFile.name}
              </p>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="mt-2 text-destructive hover:text-destructive/80 text-sm"
              >
                Remover vídeo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Atualizar" : "Criar"} Produto
            </>
          )}
        </button>
      </div>
    </form>
  )
}
