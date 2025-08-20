import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UseAutoLogoutOptions {
  onLogout?: () => void
  checkInterval?: number // em milissegundos
  enabled?: boolean // se deve estar habilitado
}

export function useAutoLogout(options: UseAutoLogoutOptions = {}) {
  const router = useRouter()
  const { onLogout, checkInterval = 30000, enabled = true } = options // 30 segundos por padrão
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<number>(Date.now())

  useEffect(() => {
    // Se não estiver habilitado, não fazer nada
    if (!enabled) {
      return
    }

    const supabase = createClient()

    // Função para verificar se o usuário ainda está autenticado
    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ [AUTO-LOGOUT] Erro ao verificar sessão:', error)
          return
        }

        // Se não há sessão, fazer logout
        if (!session) {
          console.log('🔒 [AUTO-LOGOUT] Sessão expirada, fazendo logout automático...')
          await handleLogout()
          return
        }

        // Verificar se o token ainda é válido
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.log('👤 [AUTO-LOGOUT] Usuário não encontrado, fazendo logout automático...')
          await handleLogout()
          return
        }

        // Verificar se o token não está próximo de expirar (mais de 5 minutos restantes)
        const expiresAt = session.expires_at
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = expiresAt - now
          
          if (timeUntilExpiry < 300) { // Menos de 5 minutos
            console.log('⏰ [AUTO-LOGOUT] Token expirando em breve, fazendo refresh...')
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
              if (refreshError) {
                console.warn('⚠️ [AUTO-LOGOUT] Erro ao fazer refresh do token:', refreshError)
              } else {
                console.log('✅ [AUTO-LOGOUT] Token renovado com sucesso')
              }
            } catch (refreshError) {
              console.warn('⚠️ [AUTO-LOGOUT] Erro ao fazer refresh:', refreshError)
            }
          }
        }

        // Atualizar timestamp da última verificação
        lastCheckRef.current = Date.now()
        
      } catch (error) {
        console.error('❌ [AUTO-LOGOUT] Erro ao verificar status de autenticação:', error)
      }
    }

    // Função para fazer logout
    const handleLogout = async () => {
      try {
        // Limpar intervalo
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Fazer logout no Supabase
        await supabase.auth.signOut()
        
        // Executar callback personalizado se fornecido
        if (onLogout) {
          onLogout()
        }

        // Redirecionar para login
        router.push('/admin')
        
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
        // Mesmo com erro, redirecionar para login
        router.push('/admin')
      }
    }

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log(`Evento de autenticação: ${event}`)
          
          if (event === 'SIGNED_OUT') {
            await handleLogout()
          }
        }
      }
    )

    // Iniciar verificação periódica
    intervalRef.current = setInterval(checkAuthStatus, checkInterval)

    // Verificação inicial
    checkAuthStatus()

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      subscription.unsubscribe()
    }
  }, [router, onLogout, checkInterval, enabled])

  // Retornar função para logout manual
  const manualLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    
    if (onLogout) {
      onLogout()
    }
    
    router.push('/admin')
  }

  return {
    manualLogout
  }
}

