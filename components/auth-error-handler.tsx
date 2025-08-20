'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient, handleAuthError } from '@/lib/supabase'

interface AuthErrorHandlerProps {
  children: React.ReactNode
}

export function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 [AUTH STATE]', event, session ? 'Session exists' : 'No session')

      if (event === 'SIGNED_OUT') {
        console.log('👋 [AUTH] User signed out, clearing data...')

        // Limpar dados locais
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
          sessionStorage.clear()
        }

        // Redirecionar para login se estivermos no admin
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          router.push('/admin')
        }
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 [AUTH] Token refreshed successfully')
      }
    })

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  // Verificar se há uma sessão válida ao montar o componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.warn('🚨 [AUTH CHECK] Session error:', error.message)
          handleAuthError(error)
          return
        }

        if (!session && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          // NÃO redirecionar se já estamos na página de login (/admin)
          if (window.location.pathname !== '/admin') {
            console.log('🔒 [AUTH CHECK] No session found, redirecting to login...')
            router.push('/admin')
          }
        }
      } catch (error) {
        console.error('🚨 [AUTH CHECK] Unexpected error:', error)
      }
    }

    checkSession()
  }, [router, supabase])

  return <>{children}</>
}

// Hook para usar o tratamento de erros de auth em componentes
export function useAuthErrorHandler() {
  const handleError = (error: any) => {
    if (handleAuthError(error)) {
      return true // Erro foi tratado
    }
    return false // Erro não foi tratado
  }

  return { handleError }
}
