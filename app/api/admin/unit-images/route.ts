import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar imagens de uma unidade
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const unitId = searchParams.get('unit_id')

    if (!unitId) {
      return NextResponse.json({
        error: 'unit_id é obrigatório'
      }, { status: 400 })
    }

    console.log('🔍 [UNIT IMAGES API] Buscando imagens para unidade:', unitId)

    const { data, error } = await supabase
      .from('unit_images')
      .select('*')
      .eq('unit_id', unitId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ [UNIT IMAGES API] Erro ao buscar imagens:', error)
      return NextResponse.json({
        error: 'Erro ao buscar imagens',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ [UNIT IMAGES API] Imagens encontradas:', data?.length || 0)
    return NextResponse.json(data || [])

  } catch (error) {
    console.error('❌ [UNIT IMAGES API] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Adicionar nova imagem para uma unidade
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📦 [UNIT IMAGES API] Dados recebidos:', body)

    const { unit_id, image_url, alt_text, is_primary = false } = body

    // Validação
    if (!unit_id || !image_url) {
      return NextResponse.json({
        error: 'unit_id e image_url são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se a unidade existe
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', unit_id)
      .single()

    if (unitError || !unit) {
      console.error('❌ [UNIT IMAGES API] Unidade não encontrada:', unitError)
      return NextResponse.json({
        error: 'Unidade não encontrada'
      }, { status: 404 })
    }

    // Se for imagem primária, remover todas as imagens anteriores da unidade
    if (is_primary) {
      console.log('🔄 [UNIT IMAGES API] Removendo imagens anteriores da unidade...')

      // Buscar imagens existentes para deletar do storage
      const { data: existingImages } = await supabase
        .from('unit_images')
        .select('*')
        .eq('unit_id', unit_id)

      if (existingImages && existingImages.length > 0) {
        console.log(`🗑️ [UNIT IMAGES API] Encontradas ${existingImages.length} imagens para remover`)

        // Deletar todas as imagens existentes da unidade
        const { error: deleteError } = await supabase
          .from('unit_images')
          .delete()
          .eq('unit_id', unit_id)

        if (deleteError) {
          console.error('❌ [UNIT IMAGES API] Erro ao deletar imagens anteriores:', deleteError)
        } else {
          console.log('✅ [UNIT IMAGES API] Imagens anteriores removidas do banco')
        }

        // TODO: Implementar remoção do storage se necessário
        // As imagens ficam no storage mas são removidas da referência do banco
      }
    }

    // Buscar próximo display_order
    const { data: lastImage } = await supabase
      .from('unit_images')
      .select('display_order')
      .eq('unit_id', unit_id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = (lastImage?.[0]?.display_order || 0) + 1

    // Inserir nova imagem
    const insertData = {
      unit_id: parseInt(unit_id),
      image_url,
      alt_text: alt_text || `Imagem da unidade ${unit.name}`,
      is_primary,
      display_order: nextOrder
    }

    console.log('💾 [UNIT IMAGES API] Inserindo imagem:', insertData)

    const { data, error } = await supabase
      .from('unit_images')
      .insert(insertData)
      .select()

    if (error) {
      console.error('❌ [UNIT IMAGES API] Erro ao inserir imagem:', error)
      return NextResponse.json({
        error: 'Erro ao salvar imagem',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ [UNIT IMAGES API] Imagem salva com sucesso:', data)
    return NextResponse.json(data[0])

  } catch (error) {
    console.error('❌ [UNIT IMAGES API] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// PUT - Atualizar imagem existente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📦 [UNIT IMAGES API] Dados para atualização:', body)

    const { id, unit_id, image_url, alt_text, is_primary, display_order } = body

    if (!id) {
      return NextResponse.json({
        error: 'ID da imagem é obrigatório'
      }, { status: 400 })
    }

    // Se for imagem primária, remover a primária atual
    if (is_primary && unit_id) {
      await supabase
        .from('unit_images')
        .update({ is_primary: false })
        .eq('unit_id', unit_id)
        .eq('is_primary', true)
        .neq('id', id)
    }

    const updateData: any = {}
    if (image_url) updateData.image_url = image_url
    if (alt_text !== undefined) updateData.alt_text = alt_text
    if (is_primary !== undefined) updateData.is_primary = is_primary
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from('unit_images')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ [UNIT IMAGES API] Erro ao atualizar imagem:', error)
      return NextResponse.json({
        error: 'Erro ao atualizar imagem',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ [UNIT IMAGES API] Imagem atualizada:', data)
    return NextResponse.json(data[0])

  } catch (error) {
    console.error('❌ [UNIT IMAGES API] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE - Remover imagem
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        error: 'ID da imagem é obrigatório'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('unit_images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ [UNIT IMAGES API] Erro ao deletar imagem:', error)
      return NextResponse.json({
        error: 'Erro ao deletar imagem',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ [UNIT IMAGES API] Imagem deletada com sucesso')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ [UNIT IMAGES API] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
