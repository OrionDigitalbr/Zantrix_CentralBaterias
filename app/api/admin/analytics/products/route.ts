import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface ProductAnalytics {
  totalProducts: number
  mostViewedProducts: Array<{
    entity_id: string
    views: number
    clicks: number
    product_info: {
      id: string
      name: string
      slug: string
      category_id: string
      image_url?: string
      price?: number
    }
    top_unit?: {
      name: string
      count: number
    }
  }>
  categoryAnalytics: Array<{
    category_name: string
    category_id: string
    total_views: number
    total_clicks: number
    total_products: number
  }>
  productStats: {
    total_views: number
    total_products_with_views: number
    avg_views_per_product: number
  }
}

export async function GET(request: Request) {
  try {
    console.log('📊 [PRODUCTS ANALYTICS API] Iniciando busca de dados...')

    const { searchParams } = new URL(request.url)

    // EXTRAIR PARÂMETROS DE PERÍODO DA URL
    const period = searchParams.get('period') // 'last_7_days', 'last_30_days', 'last_90_days'
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')
    const daysParam = parseInt(searchParams.get('days') || '30') // Compatibilidade

    // LÓGICA PARA DETERMINAR AS DATAS COM BASE NO PERÍODO
    let days = daysParam
    if (!startDate || !endDate) {
      const now = new Date()
      if (period === 'last_7_days') days = 7
      else if (period === 'last_30_days') days = 30
      else if (period === 'last_90_days') days = 90

      const calculatedStartDate = new Date()
      calculatedStartDate.setDate(now.getDate() - days)
      startDate = calculatedStartDate.toISOString()
      endDate = now.toISOString()
    }

    console.log(`📅 [PRODUCTS API] Período selecionado: ${period || 'padrão'} (${days} dias)`)
    console.log(`📅 [PRODUCTS API] Data início: ${startDate}`)
    console.log(`📅 [PRODUCTS API] Data fim: ${endDate}`)

    const supabase = createServerSupabaseClient()

    // 1. Total de Produtos
    console.log('📦 [PRODUCTS API] Buscando total de produtos...')
    const { count: totalProductsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (productsError) {
      console.error('❌ [PRODUCTS API] Erro ao buscar produtos:', productsError)
      throw productsError
    }

    console.log(`📦 [PRODUCTS API] Total de produtos: ${totalProductsCount}`)

    // 3. Produtos Mais Visualizados (usando período calculado)
    console.log('👁️ [PRODUCTS API] Buscando produtos mais visualizados...')
    const { data: mostViewedData, error: mostViewedError } = await supabase
      .from('analytics_events')
      .select('entity_id, event_type')
      .in('event_type', ['product_view', 'unit_click'])
      .eq('entity_type', 'product')
      .not('entity_id', 'is', null)
      .gte('timestamp', startDate) // CRÍTICO: Usar data calculada
      .lte('timestamp', endDate)   // CRÍTICO: Usar data calculada

    if (mostViewedError) {
      console.error('❌ [PRODUCTS API] Erro ao buscar visualizações:', mostViewedError)
      throw mostViewedError
    }

    // Contar visualizações e cliques por produto
    const eventCounts: { [key: string]: { views: number, clicks: number } } = {}
    mostViewedData?.forEach(event => {
      if (event.entity_id) {
        if (!eventCounts[event.entity_id]) {
          eventCounts[event.entity_id] = { views: 0, clicks: 0 }
        }
        if (event.event_type === 'product_view') {
          eventCounts[event.entity_id].views++
        } else if (event.event_type === 'unit_click') {
          eventCounts[event.entity_id].clicks++
        }
      }
    })

    // Ordenar por visualizações e pegar top 10
    const topProductIds = Object.entries(eventCounts)
      .sort(([,a], [,b]) => b.views - a.views)
      .slice(0, 10)
      .map(([id, counts]) => ({ entity_id: id, views: counts.views, clicks: counts.clicks }))

    console.log(`👁️ [PRODUCTS API] Top produtos encontrados: ${topProductIds.length}`)

    // 4. Buscar detalhes dos produtos mais visualizados
    let mostViewedProducts: any[] = []
    if (topProductIds.length > 0) {
      const productIds = topProductIds.map(p => p.entity_id)
      
      const { data: productDetails, error: productDetailsError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          slug, 
          category_id, 
          price,
          product_images!inner(url)
        `)
        .in('id', productIds)
        .eq('product_images.is_main', true)
        .limit(1)

      if (productDetailsError) {
        console.error('❌ [PRODUCTS API] Erro ao buscar detalhes dos produtos:', productDetailsError)
      } else {
        mostViewedProducts = topProductIds.map(mvp => ({
          ...mvp,
          product_info: {
            ...productDetails?.find(pd => pd.id === mvp.entity_id),
            image_url: productDetails?.find(pd => pd.id === mvp.entity_id)?.product_images?.[0]?.url
          }
        })).filter(p => p.product_info?.id) // Filtrar produtos que existem
      }
    }

    // 5. Analytics por Categoria
    console.log('📂 [PRODUCTS API] Buscando analytics por categoria...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')

    if (categoriesError) {
      console.error('❌ [PRODUCTS API] Erro ao buscar categorias:', categoriesError)
      throw categoriesError
    }

    const categoryAnalytics = []
    for (const category of categories || []) {
      // Contar produtos na categoria
      const { count: productsInCategory } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('active', true)

      // Contar visualizações e cliques de produtos da categoria
      const { data: categoryEvents } = await supabase
        .from('analytics_events')
        .select('entity_id, event_type')
        .in('entity_id', (await supabase.from('products').select('id').eq('category_id', category.id)).data?.map(p => p.id) || [])
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)

      const categoryViewsCount = categoryEvents?.filter(e => e.event_type === 'product_view').length || 0
      const categoryClicksCount = categoryEvents?.filter(e => e.event_type === 'unit_click').length || 0

      categoryAnalytics.push({
        category_name: category.name,
        category_id: category.id,
        total_views: categoryViewsCount,
        total_clicks: categoryClicksCount,
        total_products: productsInCategory || 0,
      })
    }

    // 6. Estatísticas Gerais
    const totalViews = mostViewedData?.length || 0
    const totalProductsWithViews = Object.keys(eventCounts).length
    const avgViewsPerProduct = totalProductsWithViews > 0 ? totalViews / totalProductsWithViews : 0

    const result: ProductAnalytics = {
      totalProducts: totalProductsCount || 0,
      mostViewedProducts,
      categoryAnalytics: categoryAnalytics.sort((a, b) => b.total_views - a.total_views),
      productStats: {
        total_views: totalViews,
        total_products_with_views: totalProductsWithViews,
        avg_views_per_product: Math.round(avgViewsPerProduct * 100) / 100
      }
    }

    console.log('✅ [PRODUCTS API] Dados processados com sucesso')
    console.log(`📊 [PRODUCTS API] Resumo: ${result.totalProducts} produtos, ${result.mostViewedProducts.length} com visualizações`)

    return NextResponse.json({
      success: true,
      data: result,
      period_days: days,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [PRODUCTS ANALYTICS API] Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao buscar dados de analytics de produtos',
      details: error.details,
      code: error.code,
    }, { status: 500 })
  }
}
