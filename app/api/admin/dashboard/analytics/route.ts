import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase'

interface DashboardAnalytics {
  daily_views: number
  daily_unit_clicks: number
  chart_data: Array<{
    date: string
    day: string
    views: number
    clicks: number
  }>
  total_views_30d: number
  total_clicks_30d: number
  // NOVOS CAMPOS PARA PERÍODO DINÂMICO
  total_views_period: number
  total_clicks_period: number
  period_days: number
  period_label: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [DASHBOARD ANALYTICS] Buscando dados...')

    const supabase = createServerSupabaseClient()

    // EXTRAIR PARÂMETROS DE PERÍODO DA URL
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'last_7_days', 'last_30_days', 'last_90_days'
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')

    // LÓGICA PARA DETERMINAR AS DATAS COM BASE NO PERÍODO
    let days = 30 // Padrão se nada for fornecido
    if (!startDate || !endDate) {
      const now = new Date()
      if (period === 'last_7_days') days = 7
      else if (period === 'last_90_days') days = 90

      const calculatedStartDate = new Date()
      calculatedStartDate.setDate(now.getDate() - days)
      startDate = calculatedStartDate.toISOString()
      endDate = now.toISOString()
    } else {
      // Calcular days baseado nas datas fornecidas
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime())
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    console.log(`📅 [DASHBOARD] Período selecionado: ${period || 'padrão'} (${days} dias)`)
    console.log(`📅 [DASHBOARD] Data início: ${startDate}`)
    console.log(`📅 [DASHBOARD] Data fim: ${endDate}`)

    // 1. Dados do dia atual (mantido para compatibilidade)
    console.log('📅 [DASHBOARD] Buscando dados do dia atual...')

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    // Visualizações do dia
    const { data: todayViews, error: viewsError } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', 'page_view')
      .gte('timestamp', todayStart)
      .lt('timestamp', todayEnd)

    if (viewsError) {
      console.error('❌ [DASHBOARD] Erro ao buscar visualizações do dia:', viewsError.message)
    }

    // Cliques em unidades do dia (unit_click OU unit_action_click WhatsApp)
    const { data: todayClicks, error: clicksError } = await supabase
      .from('analytics_events')
      .select('id, event_type')
      .or('event_type.eq.unit_click,event_type.eq.unit_action_click')
      .gte('timestamp', todayStart)
      .lt('timestamp', todayEnd)

    if (clicksError) {
      console.error('❌ [DASHBOARD] Erro ao buscar cliques do dia:', clicksError.message)
    }

    // Contar cliques reais (unit_click + unit_action_click WhatsApp)
    const daily_unit_clicks = (todayClicks || []).filter(ev =>
      ev.event_type === 'unit_click' ||
      ev.event_type === 'unit_action_click'
    ).length

    const daily_views = todayViews?.length || 0

    console.log(`📈 [DASHBOARD] Hoje: ${daily_views} visualizações, ${daily_unit_clicks} cliques`)

    // 2. Dados do período selecionado para o gráfico
    console.log(`📊 [DASHBOARD] Buscando dados do período selecionado (${period || 'padrão'})...`)

    // *** APLICAÇÃO DO FILTRO DE DATA EM TODAS AS CONSULTAS SUPABASE ***
    // Buscar todos os eventos do período selecionado
    const { data: periodEvents, error: periodError } = await supabase
      .from('analytics_events')
      .select('event_type, timestamp')
      .or('event_type.eq.page_view,event_type.eq.unit_click,event_type.eq.unit_action_click')
      .gte('timestamp', startDate) // CRÍTICO: Filtrar a partir da data de início
      .lte('timestamp', endDate)   // CRÍTICO: Filtrar até a data de fim
      .order('timestamp', { ascending: true })

    if (periodError) {
      console.error(`❌ [DASHBOARD] Erro ao buscar dados do período: ${periodError.message}`)
      return NextResponse.json({
        error: 'Erro ao buscar dados do período selecionado'
      }, { status: 500 })
    }

    console.log(`📊 [DASHBOARD] Eventos encontrados no período: ${periodEvents?.length || 0}`)

    // Processar dados por dia baseado no período selecionado
    const dailyData = new Map<string, { views: number, clicks: number }>()

    // Calcular número de dias do período
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    console.log(`📅 [DASHBOARD] Inicializando ${diffDays} dias de dados...`)

    // Inicializar todos os dias do período selecionado com zero
    for (let i = diffDays - 1; i >= 0; i--) {
      const date = new Date(endDateObj)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      dailyData.set(dateKey, { views: 0, clicks: 0 })
    }

    // Contar eventos por dia
    periodEvents?.forEach(event => {
      const eventDate = new Date(event.timestamp).toISOString().split('T')[0]
      const dayData = dailyData.get(eventDate)
      
      if (dayData) {
        if (event.event_type === 'page_view') {
          dayData.views++
        } else if (
          event.event_type === 'unit_click' ||
          event.event_type === 'unit_action_click'
        ) {
          dayData.clicks++
        }
      }
    })

    // Converter para array para o gráfico
    const chart_data = Array.from(dailyData.entries()).map(([dateKey, data]) => {
      const date = new Date(dateKey)
      return {
        date: dateKey,
        day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        views: data.views,
        clicks: data.clicks
      }
    })

    // Calcular totais do período selecionado
    const total_views_period = chart_data.reduce((sum, day) => sum + day.views, 0)
    const total_clicks_period = chart_data.reduce((sum, day) => sum + day.clicks, 0)

    console.log(`📊 [DASHBOARD] Período selecionado (${diffDays} dias): ${total_views_period} visualizações, ${total_clicks_period} cliques`)

    // Manter compatibilidade com dados de 30 dias (para componentes que ainda usam)
    const total_views_30d = total_views_period
    const total_clicks_30d = total_clicks_period

    const result: DashboardAnalytics = {
      daily_views,
      daily_unit_clicks,
      chart_data,
      total_views_30d, // Compatibilidade
      total_clicks_30d, // Compatibilidade
      // NOVOS CAMPOS DINÂMICOS
      total_views_period,
      total_clicks_period,
      period_days: diffDays,
      period_label: period || `${diffDays} dias`
    }

    console.log('✅ [DASHBOARD] Dados processados com sucesso')

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [DASHBOARD ANALYTICS] Erro geral:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Endpoint para limpar dados antigos (opcional)
export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Deletar eventos com mais de 90 dias
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const { error } = await supabase
      .from('analytics_events')
      .delete()
      .lt('timestamp', ninetyDaysAgo.toISOString())

    if (error) {
      return NextResponse.json({
        error: 'Erro ao limpar dados antigos'
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Dados antigos removidos com sucesso'
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
