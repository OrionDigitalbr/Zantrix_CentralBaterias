'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Erro ao obter sessão:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Não fazer refresh da página para evitar problemas de desconexão
        // if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        //   router.refresh()
        // }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erro ao fazer logout:', error)
        throw error
      }

      // Redirecionar para login
      router.push('/admin')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando signIn...')
      console.log('📧 AuthContext: Email:', email)

      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📋 AuthContext: Resposta do Supabase:', { data: !!data, error: error?.message })

      if (error) {
        console.error('❌ AuthContext: Erro de autenticação:', error.message)
        return { error: error.message }
      }

      if (data.user) {
        console.log('✅ AuthContext: Usuário autenticado:', data.user.email)
        return {}
      }

      console.error('❌ AuthContext: Nenhum usuário retornado')
      return { error: 'Erro desconhecido' }
    } catch (error) {
      console.error('❌ AuthContext: Erro inesperado:', error)
      return { error: 'Erro inesperado' }
    } finally {
      setLoading(false)
    }
  }

  // Retornar valores estáticos durante a hidratação para evitar diferenças
  const value = {
    user: isMounted ? user : null,
    session: isMounted ? session : null,
    loading: isMounted ? loading : false,
    signOut,
    signIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
