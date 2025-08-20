import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = "nodejs" // importante p/ service role

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log('🔍 [API IMAGES] Recebido:', { action, data })

    if (!data || !data.images) {
      return NextResponse.json({ error: 'Dados das imagens não fornecidos' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    switch (action) {
      case 'insert':
        console.log('🔍 [API IMAGES] Inserindo imagens:', data.images)
        
        const { error: insertError } = await supabase
          .from('product_images')
          .insert(data.images)

        if (insertError) {
          console.error('❌ [API IMAGES] Erro ao inserir imagens:', insertError)
          throw insertError
        }

        console.log('✅ [API IMAGES] Imagens inseridas com sucesso')
        return NextResponse.json({ success: true })

      case 'delete':
        if (!data.imageId) {
          return NextResponse.json({ error: 'ID da imagem não fornecido' }, { status: 400 })
        }

        console.log('🔍 [API IMAGES] Deletando imagem:', data.imageId)
        
        const { error: deleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('id', data.imageId)

        if (deleteError) {
          console.error('❌ [API IMAGES] Erro ao deletar imagem:', deleteError)
          throw deleteError
        }

        console.log('✅ [API IMAGES] Imagem deletada com sucesso')
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ [API IMAGES] Erro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
