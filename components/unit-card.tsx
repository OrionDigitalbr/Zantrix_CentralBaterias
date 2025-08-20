'use client'

import { MapPin, Phone, Mail } from "lucide-react"
import { useUnitClick } from "@/lib/hooks/use-analytics"
import { createClient } from "@/lib/supabase/client"
import { UnitImage } from "@/lib/unit-images"

interface Unit {
  id: number
  name: string
  address: string
  city: string
  state: string
  postal_code: string
  phone: string
  email: string | null
  active: boolean
  created_at: string
  updated_at: string
  latitude: number | null
  longitude: number | null
  image_url?: string | null
  whatsapp?: string | null
  maps_url?: string | null
  primary_image?: UnitImage | null
}

interface UnitCardProps {
  unit: Unit
}

export function UnitCard({ unit }: UnitCardProps) {
  const { trackUnitClick } = useUnitClick()

  const handleUnitClick = (action: string) => {
    console.log(`📍 [UNIT CLICK] ${action} - Unidade: ${unit.name}`)
    trackUnitClick(unit.id.toString())
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Se a imagem não carregar, substitui pelo placeholder
    const target = e.target as HTMLImageElement
    target.src = "/images/placeholder-unit.svg"
    target.onerror = null // Previne loop de erro
  }

  // Função para obter URL da imagem com prioridade para primary_image
  const getImageUrl = (): string => {
    // Prioridade 1: Imagem da tabela unit_images
    if (unit.primary_image?.image_url) {
      return unit.primary_image.image_url
    }

    // Prioridade 2: image_url da tabela units (legacy)
    if (unit.image_url) {
      // Se for uma URL completa, retorna direto
      if (unit.image_url.startsWith('http')) return unit.image_url

      // Se for um caminho do Supabase Storage, adiciona a URL base
      try {
        const supabase = createClient()
        const { data: { publicUrl } } = supabase.storage
          .from('unit-images')
          .getPublicUrl(unit.image_url)

        return publicUrl || '/images/placeholder-unit.svg'
      } catch (error) {
        console.error('Erro ao obter URL da imagem:', error)
        return '/images/placeholder-unit.svg'
      }
    }

    // Fallback: placeholder
    return '/images/placeholder-unit.svg'
  }

  // Função para obter alt text da imagem
  const getImageAlt = (): string => {
    if (unit.primary_image?.alt_text) {
      return unit.primary_image.alt_text
    }
    return `Unidade ${unit.name}`
  }

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-48 overflow-hidden">
        <a 
          href={unit.maps_url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
          onClick={(e) => {
            if (!unit.maps_url) {
              e.preventDefault()
            }
            handleUnitClick('image_click')
          }}
        >
          <img
            src={getImageUrl()}
            alt={getImageAlt()}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
          />
        </a>
      </div>

      <div className="p-6">
        <h2
          className="text-xl font-bold mb-2 cursor-pointer text-card-foreground hover:text-orange-600 transition-colors"
          onClick={() => handleUnitClick('title_click')}
        >
          {unit.name}
        </h2>
        <p className="text-muted-foreground mb-4">{unit.address}</p>

        <div className="space-y-2">
          {unit.phone && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-muted-foreground mr-2" />
              <a
                href={`tel:${unit.phone}`}
                className="text-card-foreground hover:text-orange-600 transition-colors"
                onClick={() => handleUnitClick('phone_click')}
              >
                {unit.phone}
              </a>
            </div>
          )}



          {unit.email && (
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-muted-foreground mr-2" />
              <a
                href={`mailto:${unit.email}`}
                className="text-blue-600 hover:underline"
                onClick={() => handleUnitClick('email_click')}
              >
                {unit.email}
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <a
            href={unit.maps_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block px-4 py-2 rounded transition-colors ${
              unit.maps_url
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!unit.maps_url) {
                e.preventDefault()
                return
              }
              handleUnitClick('maps_click')
            }}
          >
            {unit.maps_url ? 'Ver no Mapa' : 'Localização não disponível'}
          </a>

          {unit.phone && (
            <a
              href={`https://wa.me/55${unit.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded transition-colors bg-green-600 text-white hover:bg-green-700 cursor-pointer flex items-center"
              onClick={() => handleUnitClick('whatsapp_button_click')}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
