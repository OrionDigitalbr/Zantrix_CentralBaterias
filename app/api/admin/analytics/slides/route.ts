import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase'

interface SlideAnalytics {
  slides: Array<{
    id: string
    title: string
    image_url: string
    mobile_image_url: string
    active: boolean
    display_order: number
    analytics: {
      views: number
      clicks: number
      click_rate: number
      device_breakdown: {
        desktop: number
        mobile: number
        tablet: number
      }
    }
  }>
  totalStats: {
    total_slides: number
    total_views: number
    total_clicks: number
    avg_click_rate: number
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎠 [SLIDES ANALYTICS API] Iniciando busca de dados...')
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const supabase = createServerSupabaseClient()

    // Período para análise
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - days)
    const periodStartISO = periodStart.toISOString()

    // 1. Buscar todos os slides
    console.log('🎠 [SLIDES API] Buscando slides...')
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('*')
      .order('display_order', { ascending: true })

    if (slidesError) {
      console.error('❌ [SLIDES API] Erro ao buscar slides:', slidesError)
      throw slidesError
    }

    console.log(`🎠 [SLIDES API] Encontrados ${slides?.length || 0} slides`)

    // 2. Buscar analytics de visualizações de slides
    console.log('👁️ [SLIDES API] Buscando visualizações de slides...')
    const { data: slideViews, error: viewsError } = await supabase
      .from('analytics_events')
      .select('entity_id, user_agent')
      .eq('event_type', 'slide_view')
      .eq('entity_type', 'slide')
      .not('entity_id', 'is', null)
      .gte('timestamp', periodStartISO)

    if (viewsError) {
      console.error('❌ [SLIDES API] Erro ao buscar visualizações:', viewsError)
      throw viewsError
    }

    // 3. Buscar analytics de cliques em slides
    console.log('🖱️ [SLIDES API] Buscando cliques em slides...')
    const { data: slideClicks, error: clicksError } = await supabase
      .from('analytics_events')
      .select('entity_id, user_agent')
      .eq('event_type', 'slide_click')
      .eq('entity_type', 'slide')
      .not('entity_id', 'is', null)
      .gte('timestamp', periodStartISO)

    if (clicksError) {
      console.error('❌ [SLIDES API] Erro ao buscar cliques:', clicksError)
      throw clicksError
    }

    // 4. Processar dados de analytics para cada slide
    const slidesWithAnalytics = slides?.map(slide => {
      // Contar visualizações para este slide
      const slideViewsCount = slideViews?.filter(view => view.entity_id === slide.id) || []
      
      // Contar cliques para este slide
      const slideClicksCount = slideClicks?.filter(click => click.entity_id === slide.id) || []

      // Analisar dispositivos (baseado no user_agent)
      const deviceBreakdown = {
        desktop: 0,
        mobile: 0,
        tablet: 0
      }

      slideViewsCount.forEach(view => {
        if (view.user_agent?.includes('Mobile')) {
          deviceBreakdown.mobile++
        } else if (view.user_agent?.includes('Tablet')) {
          deviceBreakdown.tablet++
        } else {
          deviceBreakdown.desktop++
        }
      })

      const views = slideViewsCount.length
      const clicks = slideClicksCount.length
      const clickRate = views > 0 ? Math.round((clicks / views) * 100 * 100) / 100 : 0

      return {
        id: slide.id,
        title: slide.title,
        image_url: slide.image_url,
        mobile_image_url: slide.mobile_image_url,
        active: slide.active,
        display_order: slide.display_order,
        analytics: {
          views,
          clicks,
          click_rate: clickRate,
          device_breakdown: deviceBreakdown
        }
      }
    }) || []

    // 5. Calcular estatísticas totais
    const totalSlides = slides?.length || 0
    const totalViews = slideViews?.length || 0
    const totalClicks = slideClicks?.length || 0
    const avgClickRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100 * 100) / 100 : 0

    const result: SlideAnalytics = {
      slides: slidesWithAnalytics,
      totalStats: {
        total_slides: totalSlides,
        total_views: totalViews,
        total_clicks: totalClicks,
        avg_click_rate: avgClickRate
      }
    }

    console.log('✅ [SLIDES API] Dados processados com sucesso')
    console.log(`🎠 [SLIDES API] Resumo: ${totalSlides} slides, ${totalViews} visualizações, ${totalClicks} cliques`)

    return NextResponse.json({
      success: true,
      data: result,
      period_days: days,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [SLIDES ANALYTICS API] Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao buscar dados de analytics de slides',
      details: error.details,
      code: error.code,
    }, { status: 500 })
  }
}
