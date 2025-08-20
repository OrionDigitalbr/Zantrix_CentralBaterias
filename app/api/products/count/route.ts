import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📦 [PRODUCTS COUNT API] Buscando total de produtos...')
    
    const supabase = createServerSupabaseClient()

    // Contar produtos ativos
    const { count: totalProducts, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (error) {
      console.error('❌ [PRODUCTS COUNT API] Erro ao contar produtos:', error)
      throw error
    }

    console.log(`📦 [PRODUCTS COUNT API] Total de produtos encontrados: ${totalProducts}`)

    return NextResponse.json({
      success: true,
      total_products: totalProducts || 0,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [PRODUCTS COUNT API] Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao contar produtos',
      details: error.details,
      code: error.code,
    }, { status: 500 })
  }
}
