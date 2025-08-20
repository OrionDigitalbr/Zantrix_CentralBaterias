"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useNotify } from "@/contexts/notification-context"
import { createNotification } from "@/lib/notifications"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Edit, Trash2, Move, Eye, EyeOff } from "lucide-react"

interface Slide {
  id: number
  title: string
  subtitle?: string | null
  link_url: string | null
  image_url: string
  mobile_image_url?: string | null
  display_order: number
  active: boolean
  button_text: string | null
  created_at: string
  updated_at: string
}

// Componente para linha sortable
function SortableSlideRow({ slide, index, onToggleStatus, onConfirmDelete }: {
  slide: Slide
  index: number
  onToggleStatus: (id: number) => void
  onConfirmDelete: (id: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-muted">
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className="flex items-center justify-center cursor-move"
          {...attributes}
          {...listeners}
        >
          <Move size={16} className="text-muted-foreground" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative h-16 w-32 rounded-md overflow-hidden">
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
          />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-foreground">{slide.title}</div>
        {slide.subtitle && (
          <div className="text-xs text-muted-foreground mt-1">{slide.subtitle}</div>
        )}
        {/* Mostrar informações extras em mobile */}
        <div className="md:hidden text-xs text-muted-foreground mt-1">
          {slide.link_url && <div>Link: {slide.link_url}</div>}
          <div className="lg:hidden mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                slide.active
                  ? "bg-green-500/10 text-green-600"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {slide.active ? (
                <>
                  <Eye size={10} className="mr-1" />
                  Ativo
                </>
              ) : (
                <>
                  <EyeOff size={10} className="mr-1" />
                  Inativo
                </>
              )}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-6 py-4">
        <div className="text-sm text-muted-foreground truncate max-w-xs">{slide.link_url || 'Sem link'}</div>
      </td>
      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(slide.id)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            slide.active
              ? "bg-green-500/10 text-green-600"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {slide.active ? (
            <>
              <Eye size={12} className="mr-1" />
              Ativo
            </>
          ) : (
            <>
              <EyeOff size={12} className="mr-1" />
              Inativo
            </>
          )}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <Link
            href={`/`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground"
            title="Visualizar no site"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => onToggleStatus(slide.id)}
            className={`${slide.active ? "text-destructive hover:text-destructive/80" : "text-green-500 hover:text-green-600"}`}
            title={slide.active ? "Desativar" : "Ativar"}
          >
            {slide.active ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <Link
            href={`/admin/slides/edit/${slide.id}`}
            className="text-primary hover:text-primary/80"
            title="Editar"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={() => onConfirmDelete(slide.id)}
            className="text-destructive hover:text-destructive/80"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function SlidesManager() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [slideToDelete, setSlideToDelete] = useState<number | null>(null)

  const notify = useNotify()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      console.log('🎠 [SLIDES MANAGER] Buscando slides...')
      setLoading(true)

      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('display_order')

      if (error) {
        console.error('❌ [SLIDES MANAGER] Erro ao buscar slides:', error)
        throw error
      }

      console.log('✅ [SLIDES MANAGER] Slides encontrados:', data.length)
      setSlides(data || [])
    } catch (error) {
      console.error('❌ [SLIDES MANAGER] Erro:', error)
      notify.error('Erro', 'Falha ao carregar slides')
    } finally {
      setLoading(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((item) => item.id === active.id)
      const newIndex = slides.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(slides, oldIndex, newIndex)

      // Update order property
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        display_order: index + 1,
      }))

      setSlides(updatedItems)

      // Update order in database
      try {
        for (const item of updatedItems) {
          await supabase
            .from('slides')
            .update({ display_order: item.display_order })
            .eq('id', item.id)
        }
        notify.success('Sucesso', 'Ordem dos slides atualizada!')
        await createNotification({
          user_id: 'uuid-do-admin', // SUBSTITUIR PELA LÓGICA REAL
          title: 'Ordem dos Slides Atualizada',
          message: 'A ordem de exibição dos slides foi alterada.',
          type: 'info'
        })
      } catch (error) {
        console.error('❌ [SLIDES MANAGER] Erro ao atualizar ordem:', error)
        notify.error('Erro', 'Falha ao atualizar ordem dos slides')
        fetchSlides() // Recarregar em caso de erro
      }
    }
  }

  const toggleSlideStatus = async (id: number) => {
    try {
      const slide = slides.find(s => s.id === id)
      if (!slide) return

      const newStatus = !slide.active

      const { error } = await supabase
        .from('slides')
        .update({ active: newStatus })
        .eq('id', id)

      if (error) throw error

      setSlides(slides.map((slide) =>
        slide.id === id ? { ...slide, active: newStatus } : slide
      ))

      const notificationMessage = `O slide "${slide.title}" foi ${newStatus ? 'ativado' : 'desativado'}.`
      notify.success('Sucesso', notificationMessage)
      await createNotification({
        user_id: 'uuid-do-admin', // SUBSTITUIR PELA LÓGICA REAL
        title: 'Status do Slide Alterado',
        message: notificationMessage,
        type: 'info'
      })
    } catch (error) {
      console.error('❌ [SLIDES MANAGER] Erro ao alterar status:', error)
      notify.error('Erro', 'Falha ao alterar status do slide')
    }
  }

  const confirmDelete = (id: number) => {
    setSlideToDelete(id)
    setShowDeleteModal(true)
  }

  const deleteSlide = async () => {
    if (!slideToDelete) return

    try {
      console.log('🗑️ [SLIDES MANAGER] Excluindo slide:', slideToDelete)

      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideToDelete)

      if (error) throw error

      setSlides(slides.filter((slide) => slide.id !== slideToDelete))
      const deletedSlideTitle = slides.find(s => s.id === slideToDelete)?.title || 'ID ' + slideToDelete
      setShowDeleteModal(false)
      setSlideToDelete(null)
      notify.success('Sucesso', 'Slide excluído com sucesso!')
      await createNotification({
        user_id: 'uuid-do-admin', // SUBSTITUIR PELA LÓGICA REAL
        title: 'Slide Excluído',
        message: `O slide "${deletedSlideTitle}" foi excluído.`,
        type: 'warning'
      })
    } catch (error) {
      console.error('❌ [SLIDES MANAGER] Erro ao excluir slide:', error)
      notify.error('Erro', 'Falha ao excluir slide')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setSlideToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Carregando slides...</div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10"
                >
                  Ordem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Imagem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Título
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Link
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <SortableContext items={slides.map(slide => slide.id)} strategy={verticalListSortingStrategy}>
                {slides.map((slide, index) => (
                  <SortableSlideRow
                    key={slide.id}
                    slide={slide}
                    index={index}
                    onToggleStatus={toggleSlideStatus}
                    onConfirmDelete={confirmDelete}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Confirmar Exclusão</h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir este slide? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button onClick={deleteSlide} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
