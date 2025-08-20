'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import Cookies from 'js-cookie'

interface AnalyticsEvent {
  event_type: 'page_view' | 'unit_click' | 'unit_action_click'
  entity_type?: string
  entity_id?: string
  page_url?: string
  metadata?: Record<string, any>
}

const ANALYTICS_SESSION_COOKIE_NAME = 'analytics_session_id'

// Obter session_id único (UUID válido persistente em cookie)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return uuidv4()

  let sessionId = Cookies.get(ANALYTICS_SESSION_COOKIE_NAME)
  if (!sessionId) {
    sessionId = uuidv4() // Gera UUID válido
    Cookies.set(ANALYTICS_SESSION_COOKIE_NAME, sessionId, { expires: 365 }) // Persiste por 1 ano
    console.log('📋 [ANALYTICS] Novo session_id (UUID) gerado:', sessionId)
  }
  return sessionId
}

// Obter user_id do Supabase Auth (UUID válido ou NULL para anônimos)
const getUserId = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  try {
    const supabase = createClientComponentClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.warn('⚠️ [ANALYTICS] Erro ao obter usuário do Supabase Auth:', error.message)
      return null
    }

    if (user && user.id) {
      console.log('👤 [ANALYTICS] Usuário autenticado encontrado:', user.id)
      return user.id // UUID válido do Supabase
    } else {
      console.log('👤 [ANALYTICS] Usuário anônimo (user_id será NULL)')
      return null // Para usuários anônimos
    }
  } catch (error) {
    console.warn('⚠️ [ANALYTICS] Erro inesperado ao obter user_id:', error)
    return null
  }
}

// Função para registrar evento
const recordEvent = async (event: AnalyticsEvent): Promise<boolean> => {
  try {
    console.log('📊 [ANALYTICS HOOK] Iniciando registro de evento:', event)

    const sessionId = getSessionId()
    const userId = await getUserId() // Agora é async
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''

    const payload = {
      ...event,
      page_url: event.page_url || currentUrl,
      session_id: sessionId,
      user_id: userId // Será UUID válido ou null
    }

    console.log('📦 [ANALYTICS HOOK] Payload preparado:', {
      ...payload,
      user_id: payload.user_id ? `${payload.user_id.substring(0, 8)}...` : 'NULL (anônimo)'
    })

    const response = await fetch('/api/analytics/record-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 [ANALYTICS HOOK] Response status:', response.status)

    const result = await response.json()
    console.log('📋 [ANALYTICS HOOK] Response data:', result)

    if (!response.ok) {
      console.error('❌ [ANALYTICS HOOK] Erro da API:', result.error)
      console.error('❌ [ANALYTICS HOOK] Detalhes:', result.details)
      console.error('❌ [ANALYTICS HOOK] Código:', result.code)

      // Propagar erro mais específico
      throw new Error(result.error || `API error: ${response.status}`)
    }

    if (result.duplicate) {
      console.log('🔄 [ANALYTICS HOOK] Evento duplicado ignorado')
    } else {
      console.log('✅ [ANALYTICS HOOK] Evento registrado com sucesso:', result.event_id)
    }

    return true
  } catch (error: any) {
    console.error('❌ [ANALYTICS HOOK] Erro na requisição:', error.message || error)

    // Re-throw para que o AuthErrorHandler possa capturar com detalhes
    throw new Error(`Analytics error: ${error.message || 'Unknown error'}`)
  }
}

// Hook para rastrear visualizações de página
export function usePageView(entityType?: string, entityId?: string) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Evitar múltiplos registros na mesma montagem
    if (hasTracked.current) return

    const trackPageView = async () => {
      await recordEvent({
        event_type: 'page_view',
        entity_type: entityType,
        entity_id: entityId
      })
      hasTracked.current = true
    }

    // Delay pequeno para garantir que a página carregou
    const timer = setTimeout(trackPageView, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [entityType, entityId])
}

// Função para validar se um ID é um UUID válido
const isValidUuid = (id?: string): boolean => {
  if (!id) return false
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(id)
}

// Hook para rastrear cliques em unidades (legacy)
export function useUnitClick() {
  const trackUnitClick = useCallback(async (unitId?: string) => {
    // Validar se o unitId é um UUID válido
    const validUnitId = unitId && isValidUuid(unitId) ? unitId : undefined
    
    await recordEvent({
      event_type: 'unit_click',
      entity_type: 'unit',
      entity_id: validUnitId,
      metadata: validUnitId ? undefined : { original_id: unitId?.toString() || 'undefined' }
    })
  }, [])

  return { trackUnitClick }
}

// Hook genérico para analytics
export function useAnalytics() {
  const trackPageView = useCallback(async (entityType?: string, entityId?: string) => {
    await recordEvent({
      event_type: 'page_view',
      entity_type: entityType,
      entity_id: entityId
    })
  }, [])

  const trackUnitClick = useCallback(async (unitId?: string) => {
    // Validar se o unitId é um UUID válido
    const validUnitId = unitId && isValidUuid(unitId) ? unitId : undefined
    
    await recordEvent({
      event_type: 'unit_click',
      entity_type: 'unit',
      entity_id: validUnitId,
      metadata: validUnitId ? undefined : { original_id: unitId?.toString() || 'undefined' }
    })
  }, [])

  const trackUnitActionClick = useCallback(async (unitId: string, actionType: 'whatsapp' | 'buy_button' | 'email' | 'maps', metadata?: Record<string, any>) => {
    // Validar se o unitId é um UUID válido
    const validUnitId = unitId && isValidUuid(unitId) ? unitId : undefined
    await recordEvent({
      event_type: 'unit_action_click',
      entity_type: 'unit',
      entity_id: validUnitId,
      metadata: {
        action_type: actionType,
        ...(validUnitId ? {} : { original_id: unitId?.toString() || 'undefined' }),
        ...metadata
      }
    })
  }, [])

  const trackCustomEvent = useCallback(async (event: AnalyticsEvent) => {
    await recordEvent(event)
  }, [])

  return {
    trackPageView,
    trackUnitClick,
    trackUnitActionClick,
    trackCustomEvent
  }
}

// Componente para rastreamento automático de página
export function AnalyticsPageTracker({
  entityType,
  entityId
}: {
  entityType?: string
  entityId?: string
}) {
  usePageView(entityType, entityId)
  return null
}
