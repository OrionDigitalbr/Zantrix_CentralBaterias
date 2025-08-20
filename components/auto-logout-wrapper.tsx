"use client"

import { useAutoLogout } from '@/hooks/use-auto-logout'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface AutoLogoutWrapperProps {
  children: React.ReactNode
}

export function AutoLogoutWrapper({ children }: AutoLogoutWrapperProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Só aplicar auto-logout em páginas admin
  const isAdminPage = pathname?.startsWith('/admin')

  // Hook de auto-logout que verifica periodicamente se o usuário ainda está autenticado
  useAutoLogout({
    onLogout: () => {
      console.log('🔄 Usuário desconectado automaticamente devido a reinicialização do servidor')
    },
    checkInterval: 15000, // Verificar a cada 15 segundos
    enabled: isAdminPage && !!user // Só habilitar em páginas admin com usuário logado
  })

  // Verificação adicional quando o usuário está autenticado
  useEffect(() => {
    if (user && isAdminPage) {
      console.log('🔐 Usuário autenticado em página admin, sistema de auto-logout ativo')
    }
  }, [user, isAdminPage])

  return <>{children}</>
}

