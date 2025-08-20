'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAnalytics } from '@/lib/hooks/use-analytics'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    // ❌ NÃO rastrear páginas do admin
    if (pathname.startsWith('/admin')) {
      console.log('🚫 [ANALYTICS TRACKER] Pulando analytics para página admin:', pathname)
      return
    }

    console.log('📊 [ANALYTICS TRACKER] Rastreando página pública:', pathname)

    // Determinar tipo de entidade baseado na rota (apenas páginas públicas)
    let entityType: string | undefined
    let entityId: string | undefined = undefined // Sempre undefined por padrão

    if (pathname.startsWith('/produto/')) {
      entityType = 'product'
      // Não definir entityId aqui para evitar erros de UUID inválido
    } else if (pathname.startsWith('/loja')) {
      entityType = 'shop'
    } else if (pathname.startsWith('/unidades')) {
      entityType = 'units_page'
      // Garantir que não há entityId para a página de unidades
      entityId = undefined
    } else if (pathname === '/') {
      entityType = 'homepage'
    } else if (pathname === '/contato') {
      entityType = 'contact'
    } else if (pathname === '/sobre') {
      entityType = 'about'
    } else if (pathname === '/baterias') {
      entityType = 'batteries'
    } else if (pathname === '/programa-pontos') {
      entityType = 'points_program'
    } else {
      entityType = 'page'
    }
    
    // Garantir que entityId seja undefined se não for um UUID válido
    if (entityId && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(entityId)) {
      console.log(`⚠️ [ANALYTICS TRACKER] entity_id inválido (não é um UUID):`, entityId)
      entityId = undefined
    }

    console.log('📋 [ANALYTICS TRACKER] Dados:', { entityType, entityId })

    // Rastrear visualização da página (apenas páginas públicas)
    trackPageView(entityType, entityId)

  }, [pathname, trackPageView])

  return null // Este componente não renderiza nada
}
