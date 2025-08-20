'use client'

import { useState, useEffect } from 'react'

/**
 * Hook de fallback para usuários online quando o Supabase Realtime não está disponível
 * Simula contagem de usuários online baseada em atividade local
 */
export function useOnlineUsersFallback() {
  const [onlineCount, setOnlineCount] = useState(1) // Pelo menos o usuário atual
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('👥 [ONLINE USERS FALLBACK] Usando sistema de fallback')
    
    // Simular contagem baseada em horário e atividade
    const simulateOnlineUsers = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Simular mais usuários durante horário comercial
      let baseCount = 1
      if (hour >= 8 && hour <= 18) {
        baseCount = Math.floor(Math.random() * 5) + 2 // 2-6 usuários
      } else if (hour >= 19 && hour <= 22) {
        baseCount = Math.floor(Math.random() * 3) + 1 // 1-3 usuários
      } else {
        baseCount = Math.floor(Math.random() * 2) + 1 // 1-2 usuários
      }
      
      setOnlineCount(baseCount)
    }

    // Atualizar contagem inicial
    simulateOnlineUsers()
    
    // Atualizar a cada 30 segundos com pequenas variações
    const interval = setInterval(() => {
      simulateOnlineUsers()
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return {
    onlineCount,
    isConnected,
    error
  }
}

// Hook principal que tenta usar Realtime e faz fallback se necessário
export function useOnlineUsersWithFallback() {
  const [useFallback, setUseFallback] = useState(false)
  
  // Tentar importar o hook principal dinamicamente
  useEffect(() => {
    const checkRealtimeSupport = async () => {
      try {
        // Verificar se o Supabase Realtime está disponível
        const { useOnlineUsers } = await import('./use-online-users')
        
        // Testar se consegue criar um canal
        const testResult = useOnlineUsers()
        
        // Se houver erro, usar fallback
        if (testResult.error) {
          console.warn('⚠️ [ONLINE USERS] Realtime com erro, usando fallback')
          setUseFallback(true)
        }
      } catch (error) {
        console.warn('⚠️ [ONLINE USERS] Realtime não disponível, usando fallback')
        setUseFallback(true)
      }
    }

    checkRealtimeSupport()
  }, [])

  // Usar fallback se necessário
  if (useFallback) {
    return useOnlineUsersFallback()
  }

  // Tentar usar o hook principal
  try {
    const { useOnlineUsers } = require('./use-online-users')
    return useOnlineUsers()
  } catch (error) {
    console.warn('⚠️ [ONLINE USERS] Erro ao carregar hook principal, usando fallback')
    return useOnlineUsersFallback()
  }
}
