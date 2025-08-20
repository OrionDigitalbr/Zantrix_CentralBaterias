import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { headers } from 'next/headers'

interface RecordEventRequest {
  event_type: 'page_view' | 'unit_click' | 'unit_action_click'
  entity_type?: string
  entity_id?: string
  page_url?: string
  session_id?: string
  user_id?: string | null
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 [ANALYTICS API] Iniciando registro de evento...')

    // Log detalhado do payload recebido
    const body: RecordEventRequest = await request.json()
    console.log('📦 [ANALYTICS API] Payload recebido:', JSON.stringify(body, null, 2))

    const { event_type, entity_type, entity_id, page_url, session_id, user_id, metadata } = body

    // Validação básica dos dados recebidos
    if (!event_type) {
      console.error('❌ [ANALYTICS API] event_type ausente no payload')
      return NextResponse.json(
        { success: false, error: 'Event type is required' },
        { status: 400 }
      )
    }

    if (!['page_view', 'unit_click', 'unit_action_click', 'product_view', 'slide_view', 'slide_click'].includes(event_type)) {
      console.error(`❌ [ANALYTICS API] event_type inválido: ${event_type}`)
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      )
    }

    console.log(`✅ [ANALYTICS API] Validação passou - event_type: ${event_type}`)

    // Obter informações da requisição
    const headersList = await headers()
    const ip_address = headersList.get('x-forwarded-for') ||
                      headersList.get('x-real-ip') ||
                      request.ip ||
                      'unknown'
    const user_agent = headersList.get('user-agent') || 'unknown'

    // Gerar session_id se não fornecido
    const final_session_id = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log('📋 [ANALYTICS API] Dados processados:', {
      event_type,
      entity_type,
      entity_id,
      page_url,
      session_id: final_session_id.substring(0, 20) + '...',
      user_id: user_id?.substring(0, 20) + '...' || 'null',
      ip_address: ip_address?.substring(0, 10) + '...'
    })

    // Inicializar cliente Supabase
    console.log('🔗 [ANALYTICS API] Inicializando cliente Supabase...')
    const supabase = createServerSupabaseClient()

    // Testar conexão com Supabase primeiro
    console.log('🧪 [ANALYTICS API] Testando conexão com Supabase...')
    try {
      const { data: testData, error: testError } = await supabase
        .from('analytics_events')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('❌ [ANALYTICS API] Erro de conexão/tabela Supabase:', testError.message)
        console.error('❌ [ANALYTICS API] Detalhes do erro:', testError)
        return NextResponse.json(
          { success: false, error: `Supabase error: ${testError.message}` },
          { status: 500 }
        )
      }

      console.log('✅ [ANALYTICS API] Conexão com Supabase OK')
    } catch (connectionError: any) {
      console.error('❌ [ANALYTICS API] Erro de conexão geral:', connectionError.message)
      return NextResponse.json(
        { success: false, error: `Connection error: ${connectionError.message}` },
        { status: 500 }
      )
    }

    // Para page_views, evitar duplicação na mesma sessão e página nos últimos 30 segundos
    if (event_type === 'page_view' && page_url) {
      console.log('🔍 [ANALYTICS API] Verificando duplicação...')
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()

      const { data: recentEvents, error: checkError } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'page_view')
        .eq('session_id', final_session_id)
        .eq('page_url', page_url)
        .gte('timestamp', thirtySecondsAgo)
        .limit(1)

      if (checkError) {
        console.warn('⚠️ [ANALYTICS API] Erro ao verificar duplicação:', checkError.message)
      } else if (recentEvents && recentEvents.length > 0) {
        console.log('🔄 [ANALYTICS API] Evento duplicado ignorado (mesma sessão/página nos últimos 30s)')
        return NextResponse.json({
          success: true,
          message: 'Evento duplicado ignorado',
          duplicate: true
        })
      }

      console.log('✅ [ANALYTICS API] Verificação de duplicação passou')
    }

    // Preparar dados para inserção (sem metadata temporariamente)
    const eventData = {
      event_type,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      user_id: user_id || null, // Será UUID válido ou NULL para anônimos
      session_id: final_session_id,
      ip_address: ip_address?.substring(0, 45), // Limitar tamanho
      user_agent: user_agent?.substring(0, 255), // Limitar tamanho
      page_url: page_url || null,
      timestamp: new Date().toISOString()
    }

    // Adicionar metadata apenas se a coluna existir
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('📊 [ANALYTICS API] Metadata fornecida:', metadata)
      // Tentaremos adicionar metadata, mas se falhar, continuaremos sem ela
    }

    console.log('💾 [ANALYTICS API] Dados para inserção:', JSON.stringify(eventData, null, 2))

    // Inserir evento na tabela
    console.log('📝 [ANALYTICS API] Executando INSERT...')

    let insertResult = null
    let insertError = null

    // Primeiro, tentar inserir com metadata se fornecida
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('🔄 [ANALYTICS API] Tentando inserir COM metadata...')
      const eventDataWithMetadata = { ...eventData, metadata }

      const { data: dataWithMeta, error: errorWithMeta } = await supabase
        .from('analytics_events')
        .insert(eventDataWithMetadata)
        .select()

      if (!errorWithMeta) {
        insertResult = dataWithMeta
        console.log('✅ [ANALYTICS API] Inserção COM metadata bem-sucedida!')
      } else if (errorWithMeta.message?.includes('metadata')) {
        console.warn('⚠️ [ANALYTICS API] Coluna metadata não existe, tentando sem metadata...')
        // Continuar para inserção sem metadata
      } else {
        insertError = errorWithMeta
      }
    }

    // Se não conseguiu inserir com metadata ou não tinha metadata, inserir sem
    if (!insertResult && !insertError) {
      console.log('🔄 [ANALYTICS API] Inserindo SEM metadata...')
      const { data, error } = await supabase
        .from('analytics_events')
        .insert(eventData)
        .select()

      insertResult = data
      insertError = error
    }

    if (insertError) {
      console.error('❌ [ANALYTICS API] Erro Supabase INSERT:', insertError.message)
      console.error('❌ [ANALYTICS API] Detalhes completos do erro:', insertError)
      console.error('❌ [ANALYTICS API] Código do erro:', insertError.code)
      console.error('❌ [ANALYTICS API] Hint do erro:', insertError.hint)

      return NextResponse.json(
        {
          success: false,
          error: insertError.message || 'Failed to record event',
          details: insertError.details,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    console.log('✅ [ANALYTICS API] Evento registrado com sucesso!')
    console.log('📊 [ANALYTICS API] Dados inseridos:', insertResult?.[0])

    return NextResponse.json({
      success: true,
      event_id: insertResult?.[0]?.id,
      message: 'Evento registrado com sucesso'
    })

  } catch (error: any) {
    console.error('🚨 [ANALYTICS API] Erro inesperado:', error.message || error)
    console.error('🚨 [ANALYTICS API] Stack trace:', error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        type: 'unexpected_error'
      },
      { status: 500 }
    )
  }
}

// Método GET para verificar se a API está funcionando
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar se a tabela existe e retornar estatísticas básicas
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Tabela analytics_events não encontrada',
        error: error.message
      }, { status: 500 })
    }

    // Contar eventos por tipo
    const { data: stats, error: statsError } = await supabase
      .from('analytics_events')
      .select('event_type')

    if (statsError) {
      return NextResponse.json({
        status: 'error',
        message: 'Erro ao obter estatísticas',
        error: statsError.message
      }, { status: 500 })
    }

    const pageViews = stats?.filter(e => e.event_type === 'page_view').length || 0
    const unitClicks = stats?.filter(e => e.event_type === 'unit_click').length || 0

    return NextResponse.json({
      status: 'ok',
      message: 'API de analytics funcionando',
      stats: {
        total_events: stats?.length || 0,
        page_views: pageViews,
        unit_clicks: unitClicks
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
