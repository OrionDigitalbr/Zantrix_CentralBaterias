'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useOnlineUsersCount } from '@/lib/hooks/use-online-users-simple'

export function OnlinePresenceTracker() {
  const pathname = usePathname()
  const onlineCount = useOnlineUsersCount()
  const isConnected = true // Sempre conectado com hook simplificado

  useEffect(() => {
    // ❌ NÃO rastrear presença em páginas do admin
    if (pathname.startsWith('/admin')) {
      console.log('🚫 [PRESENCE TRACKER] Pulando presença para página admin:', pathname)
      return
    }

    console.log('👥 [PRESENCE TRACKER] Rastreando presença na página pública:', pathname)
    console.log(`📊 [PRESENCE TRACKER] Usuários online: ${onlineCount}`)
    console.log(`📡 [PRESENCE TRACKER] Conectado: ${isConnected}`)

  }, [pathname, onlineCount, isConnected])

  // Log de debug no console (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`👥 [DEBUG] Usuários online: ${onlineCount} | Conectado: ${isConnected}`)
    }
  }, [onlineCount, isConnected])

  return null // Este componente não renderiza nada visualmente
}
