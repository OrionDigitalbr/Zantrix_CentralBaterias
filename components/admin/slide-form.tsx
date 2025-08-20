"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Save, ArrowLeft } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useNotify } from "@/contexts/notification-context"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import SlideImageSlot from "@/components/SlideImageSlot"

interface SlideFormProps {
  slideId?: string
}

export function SlideForm({ slideId }: SlideFormProps) {
  const router = useRouter()
  const notify = useNotify()
  const supabase = createClientSupabaseClient()
  const isEditing = !!slideId

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 1,
    active: true,
  })

  // Estado unificado para as imagens (URLs do banco)
  const [imageUrls, setImageUrls] = useState({
    desktop: null as string | null,
    mobile: null as string | null,
    notebook: null as string | null,
  })

  // Carregar dados do slide se estiver editando
  useEffect(() => {
    if (isEditing && slideId) {
      fetchSlideData()
    }
  }, [isEditing, slideId])

  const fetchSlideData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("slides")
        .select("*")
        .eq("id", slideId)
        .single()

      if (error) throw error

      setFormData({
        title: data.title || '',
        link_url: data.link_url || '',
        display_order: data.display_order || 1,
        active: data.active !== false,
      })

      // Atualizar URLs das imagens
      setImageUrls({
        desktop: data.image_url || null,
        mobile: data.mobile_image_url || null,
        notebook: data.notebook_image_url || null,
      })
    } catch (error) {
      console.error("Erro ao carregar slide:", error)
      notify.error("Erro", "Não foi possível carregar os dados do slide")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (variant: "desktop" | "mobile" | "notebook", url: string | null) => {
    setImageUrls(prev => ({ ...prev, [variant]: url }))
    
    if (url) {
      notify.success("Sucesso", `Imagem ${variant} ${url ? 'carregada' : 'removida'} com sucesso!`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      // Preparar dados para salvar
      const slideData = {
        title: formData.title,
        link_url: formData.link_url || null,
        display_order: Number(formData.display_order),
        active: formData.active,
        image_url: imageUrls.desktop,
        mobile_image_url: imageUrls.mobile,
        notebook_image_url: imageUrls.notebook,
      }

      if (isEditing && slideId) {
        // Atualizar slide existente
        const { error } = await supabase
          .from("slides")
          .update(slideData)
          .eq("id", slideId)

        if (error) throw error

        notify.success("Slide Atualizado", "O slide foi atualizado com sucesso!")
      } else {
        // Criar novo slide
        const { error } = await supabase
          .from("slides")
          .insert(slideData)

        if (error) throw error

        notify.success("Slide Criado", "O slide foi criado com sucesso!")
      }

      // Redirecionar para lista de slides
      router.push("/admin/slides")

    } catch (error) {
      console.error("Erro ao salvar slide:", error)
      notify.error("Erro", "Ocorreu um erro ao salvar o slide. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Pegar a cor do tema se disponível
  const themeColor = typeof window !== 'undefined' 
    ? (document.getElementById("themeColor") as HTMLInputElement | null)?.value || "#f97316"
    : "#f97316"

  return (
    <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
      {/* Configurações Básicas */}
      <div className="py-6 px-0 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "Editar Slide" : "Novo Slide"}
        </h2>

        <div className="space-y-6">
          {/* Título e Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Título do Slide <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                placeholder="Ex: Promoção de Baterias"
              />
            </div>

            <div>
              <label htmlFor="link_url" className="block text-sm font-medium mb-1">
                Link de Destino (Opcional)
              </label>
              <input
                type="url"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                placeholder="Ex: /baterias ou https://exemplo.com"
              />
            </div>
          </div>

          {/* Ordem e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium mb-1">
                Ordem de Exibição <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="1"
                required
                className="w-full border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-3">
              <ToggleSwitch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                className="transition-all duration-200"
              />
              <label htmlFor="active" className="block text-sm font-medium mb-1">
                Slide Ativo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Imagens do Slide - Agora usando SlideImageSlot unificado */}
      <div className="py-6 px-0 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Imagens do Slide</h2>

        {/* Desktop */}
        <SlideImageSlot
          slideId={isEditing ? Number(slideId) : undefined}
          column="image_url"
          label="Imagem para Desktop"
          recommended="1920×500 pixels"
          value={imageUrls.desktop}
          onChange={(url) => handleImageChange("desktop", url)}
          variant="desktop"
          themeColor={themeColor}
          placeholder="/placeholder.svg?height=300&width=800&text=Imagem Desktop"
        />

        {/* Mobile */}
        <SlideImageSlot
          slideId={isEditing ? Number(slideId) : undefined}
          column="mobile_image_url"
          label="Imagem para Mobile"
          recommended="375×200 pixels"
          value={imageUrls.mobile}
          onChange={(url) => handleImageChange("mobile", url)}
          variant="mobile"
          themeColor={themeColor}
          placeholder="/placeholder.svg?height=300&width=400&text=Imagem Mobile"
        />

        {/* Notebook */}
        <SlideImageSlot
          slideId={isEditing ? Number(slideId) : undefined}
          column="notebook_image_url"
          label="Imagem para Notebook"
          recommended="1366×400 pixels"
          value={imageUrls.notebook}
          onChange={(url) => handleImageChange("notebook", url)}
          variant="notebook"
          themeColor={themeColor}
          placeholder="/placeholder.svg?height=300&width=1366&text=Imagem Notebook"
        />
      </div>

      {/* Botões de Ação */}
      <div className="pt-6 flex justify-end space-x-4">
        <Link
          href="/admin/slides"
          className="px-6 py-2 border border-input rounded-md text-foreground hover:bg-accent hover:text-accent-foreground flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? "Atualizar Slide" : "Salvar Slide"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
