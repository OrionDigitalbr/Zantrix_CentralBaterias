import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface TrafficAnalytics {
  pageViewsByDay: Array<{
    date: string
    day: string
    views: number
    unique_sessions: number
  }>
  trafficSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  topPages: Array<{
    page_url: string
    views: number
    unique_sessions: number
  }>
  deviceTypes: Array<{
    device: string
    count: number
    percentage: number
  }>
  totalStats: {
    total_views: number
    unique_sessions: number
    avg_session_duration: number
    bounce_rate: number
  }
}

export async function GET(request: Request) {
  try {
    console.log('🚦 [TRAFFIC ANALYTICS API] Iniciando busca de dados...')

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

    console.log(`📅 [TRAFFIC API] Período selecionado: ${period || 'padrão'} (${days} dias)`)
    console.log(`📅 [TRAFFIC API] Data início: ${startDate}`)
    console.log(`📅 [TRAFFIC API] Data fim: ${endDate}`)

    const supabase = createServerSupabaseClient()

    // *** APLICAÇÃO DO FILTRO DE DATA EM TODAS AS CONSULTAS SUPABASE ***

    // 1. Visualizações por dia
    console.log('📅 [TRAFFIC API] Buscando visualizações por dia...')
    const { data: dailyViews, error: dailyError } = await supabase
      .from('analytics_events')
      .select('timestamp, session_id')
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate) // CRÍTICO: Filtrar a partir da data de início
      .lte('timestamp', endDate)   // CRÍTICO: Filtrar até a data de fim
      .order('timestamp', { ascending: true })

    if (dailyError) {
      console.error('❌ [TRAFFIC API] Erro ao buscar visualizações diárias:', dailyError)
      throw dailyError
    }

    // Processar dados por dia
    const dailyData = new Map<string, { views: number, sessions: Set<string> }>()
    
    // Inicializar todos os dias do período
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyData.set(dateKey, { views: 0, sessions: new Set() })
    }

    // Contar visualizações e sessões únicas por dia
    dailyViews?.forEach(view => {
      const dateKey = new Date(view.timestamp).toISOString().split('T')[0]
      const dayData = dailyData.get(dateKey)
      
      if (dayData) {
        dayData.views++
        if (view.session_id) {
          dayData.sessions.add(view.session_id)
        }
      }
    })

    const pageViewsByDay = Array.from(dailyData.entries())
      .map(([dateKey, data]) => {
        const date = new Date(dateKey)
        return {
          date: dateKey,
          day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          views: data.views,
          unique_sessions: data.sessions.size
        }
      })
      .reverse() // Ordem cronológica

    // 2. Fontes de Tráfego (baseado no user_agent e referrer simulado)
    console.log('🔗 [TRAFFIC API] Analisando fontes de tráfego...')
    const { data: allViews, error: allViewsError } = await supabase
      .from('analytics_events')
      .select('user_agent, page_url, session_id')
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate) // CRÍTICO: Filtrar por período
      .lte('timestamp', endDate)   // CRÍTICO: Filtrar por período

    if (allViewsError) {
      console.error('❌ [TRAFFIC API] Erro ao buscar todas as visualizações:', allViewsError)
      throw allViewsError
    }

    // Simular fontes de tráfego baseado em padrões
    const sourceCounts: { [key: string]: number } = {}
    const deviceCounts: { [key: string]: number } = {}
    const pageCounts: { [key: string]: Set<string> } = {}

    allViews?.forEach(view => {
      // Determinar fonte (simulada baseada em padrões)
      let source = 'Direto'
      if (view.user_agent?.includes('Google')) source = 'Google'
      else if (view.user_agent?.includes('Facebook')) source = 'Facebook'
      else if (view.user_agent?.includes('Instagram')) source = 'Instagram'
      else if (view.page_url?.includes('utm_source=email')) source = 'Email'
      else if (view.page_url?.includes('utm_source=social')) source = 'Redes Sociais'
      
      sourceCounts[source] = (sourceCounts[source] || 0) + 1

      // Determinar tipo de dispositivo (simulado baseado no user_agent)
      let device = 'Desktop'
      if (view.user_agent?.includes('Mobile')) device = 'Mobile'
      else if (view.user_agent?.includes('Tablet')) device = 'Tablet'
      
      deviceCounts[device] = (deviceCounts[device] || 0) + 1

      // Contar páginas
      const page = view.page_url || '/'
      if (!pageCounts[page]) {
        pageCounts[page] = new Set()
      }
      if (view.session_id) {
        pageCounts[page].add(view.session_id)
      }
    })

    // Converter para arrays com percentuais
    const totalViews = allViews?.length || 0
    
    const trafficSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalViews) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)

    const deviceTypes = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / totalViews) * 100 * 100) / 100
      }))
      .sort((a, b) => b.count - a.count)

    // 3. Páginas mais visitadas
    const topPages = Object.entries(pageCounts)
      .map(([page_url, sessions]) => ({
        page_url,
        views: sourceCounts[page_url] || 0,
        unique_sessions: sessions.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // 4. Estatísticas totais
    const uniqueSessions = new Set(allViews?.map(v => v.session_id).filter(Boolean)).size
    const avgSessionDuration = 0 // Seria necessário rastrear tempo de sessão
    const bounceRate = 0 // Seria necessário rastrear múltiplas páginas por sessão

    const result: TrafficAnalytics = {
      pageViewsByDay,
      trafficSources,
      topPages,
      deviceTypes,
      totalStats: {
        total_views: totalViews,
        unique_sessions: uniqueSessions,
        avg_session_duration: avgSessionDuration,
        bounce_rate: bounceRate
      }
    }

    console.log('✅ [TRAFFIC API] Dados processados com sucesso')
    console.log(`🚦 [TRAFFIC API] Resumo: ${totalViews} visualizações, ${uniqueSessions} sessões únicas`)

    return NextResponse.json({
      success: true,
      data: result,
      period_days: days,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [TRAFFIC ANALYTICS API] Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao buscar dados de tráfego',
      details: error.details,
      code: error.code,
    }, { status: 500 })
  }
}
