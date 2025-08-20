import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface UnitImage {
  id: number
  unit_id: number
  image_url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Buscar todas as imagens de uma unidade
 */
export async function getUnitImages(unitId: number): Promise<UnitImage[]> {
  try {
    const { data, error } = await supabase
      .from('unit_images')
      .select('*')
      .eq('unit_id', unitId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erro ao buscar imagens da unidade:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens da unidade:', error)
    return []
  }
}

/**
 * Buscar a imagem primária de uma unidade
 */
export async function getPrimaryUnitImage(unitId: number): Promise<UnitImage | null> {
  try {
    const { data, error } = await supabase
      .from('unit_images')
      .select('*')
      .eq('unit_id', unitId)
      .eq('is_primary', true)
      .single()

    if (error) {
      // Se não encontrar imagem primária, buscar a primeira imagem
      const { data: firstImage, error: firstError } = await supabase
        .from('unit_images')
        .select('*')
        .eq('unit_id', unitId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single()

      if (firstError || !firstImage) {
        return null
      }

      return firstImage
    }

    return data
  } catch (error) {
    console.error('Erro inesperado ao buscar imagem primária da unidade:', error)
    return null
  }
}

/**
 * Buscar imagens de múltiplas unidades
 */
export async function getMultipleUnitsImages(unitIds: number[]): Promise<Record<number, UnitImage[]>> {
  try {
    if (unitIds.length === 0) return {}

    const { data, error } = await supabase
      .from('unit_images')
      .select('*')
      .in('unit_id', unitIds)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Erro ao buscar imagens de múltiplas unidades:', error)
      return {}
    }

    // Agrupar imagens por unit_id
    const groupedImages: Record<number, UnitImage[]> = {}
    
    data?.forEach(image => {
      if (!groupedImages[image.unit_id]) {
        groupedImages[image.unit_id] = []
      }
      groupedImages[image.unit_id].push(image)
    })

    return groupedImages
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens de múltiplas unidades:', error)
    return {}
  }
}

/**
 * Buscar imagens primárias de múltiplas unidades
 */
export async function getMultipleUnitsPrimaryImages(unitIds: number[]): Promise<Record<number, UnitImage | null>> {
  try {
    if (unitIds.length === 0) return {}

    // Buscar imagens primárias
    const { data: primaryImages, error: primaryError } = await supabase
      .from('unit_images')
      .select('*')
      .in('unit_id', unitIds)
      .eq('is_primary', true)

    if (primaryError) {
      console.error('Erro ao buscar imagens primárias:', primaryError)
      return {}
    }

    // Criar mapa de imagens primárias
    const primaryMap: Record<number, UnitImage> = {}
    primaryImages?.forEach(image => {
      primaryMap[image.unit_id] = image
    })

    // Para unidades sem imagem primária, buscar a primeira imagem
    const unitsWithoutPrimary = unitIds.filter(id => !primaryMap[id])
    
    if (unitsWithoutPrimary.length > 0) {
      const { data: firstImages, error: firstError } = await supabase
        .from('unit_images')
        .select('*')
        .in('unit_id', unitsWithoutPrimary)
        .order('display_order', { ascending: true })

      if (!firstError && firstImages) {
        // Agrupar por unit_id e pegar apenas a primeira de cada
        const firstImagesByUnit: Record<number, UnitImage> = {}
        firstImages.forEach(image => {
          if (!firstImagesByUnit[image.unit_id]) {
            firstImagesByUnit[image.unit_id] = image
          }
        })

        // Adicionar ao mapa principal
        Object.assign(primaryMap, firstImagesByUnit)
      }
    }

    // Converter para o formato esperado (incluindo null para unidades sem imagem)
    const result: Record<number, UnitImage | null> = {}
    unitIds.forEach(unitId => {
      result[unitId] = primaryMap[unitId] || null
    })

    return result
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens primárias de múltiplas unidades:', error)
    return {}
  }
}

/**
 * Adicionar nova imagem para uma unidade
 * Se isPrimary for true, remove todas as imagens anteriores da unidade
 */
export async function addUnitImage(
  unitId: number,
  imageUrl: string,
  altText?: string,
  isPrimary: boolean = false
): Promise<UnitImage | null> {
  try {
    console.log(`🖼️ [UNIT IMAGES] Adicionando imagem para unidade ${unitId}, isPrimary: ${isPrimary}`)

    const response = await fetch('/api/admin/unit-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unit_id: unitId,
        image_url: imageUrl,
        alt_text: altText,
        is_primary: isPrimary
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao adicionar imagem da unidade:', error)
      return null
    }

    const result = await response.json()
    console.log('✅ [UNIT IMAGES] Imagem adicionada com sucesso:', result)
    return result
  } catch (error) {
    console.error('Erro inesperado ao adicionar imagem da unidade:', error)
    return null
  }
}

/**
 * Atualizar imagem existente
 */
export async function updateUnitImage(
  imageId: number,
  updates: Partial<Pick<UnitImage, 'image_url' | 'alt_text' | 'is_primary' | 'display_order'>>
): Promise<UnitImage | null> {
  try {
    const response = await fetch('/api/admin/unit-images', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: imageId,
        ...updates
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao atualizar imagem da unidade:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Erro inesperado ao atualizar imagem da unidade:', error)
    return null
  }
}

/**
 * Remover imagem
 */
export async function deleteUnitImage(imageId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/unit-images?id=${imageId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao deletar imagem da unidade:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro inesperado ao deletar imagem da unidade:', error)
    return false
  }
}

/**
 * Substituir imagem primária de uma unidade
 * Remove todas as imagens anteriores e adiciona a nova como primária
 */
export async function replacePrimaryUnitImage(
  unitId: number,
  imageUrl: string,
  altText?: string
): Promise<UnitImage | null> {
  try {
    console.log(`🔄 [UNIT IMAGES] Substituindo imagem primária da unidade ${unitId}`)

    // Usar a função addUnitImage com isPrimary=true
    // Isso automaticamente remove as imagens anteriores
    return await addUnitImage(unitId, imageUrl, altText, true)
  } catch (error) {
    console.error('Erro inesperado ao substituir imagem primária:', error)
    return null
  }
}
