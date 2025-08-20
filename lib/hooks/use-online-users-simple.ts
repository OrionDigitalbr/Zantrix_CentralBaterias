'use client'

import { useState, useEffect } from 'react'

/**
 * Hook simplificado para simular usuários online
 * Evita problemas com Supabase Realtime e fornece dados consistentes
 */
export function useOnlineUsersCount() {
  const [count, setCount] = useState(1)
  
  useEffect(() => {
    // Simular contagem baseada no horário
    const updateCount = () => {
      const hour = new Date().getHours()
      let baseCount = 1
      
      if (hour >= 8 && hour <= 18) {
        // Horário comercial: 1-4 usuários
        baseCount = Math.floor(Math.random() * 4) + 1
      } else if (hour >= 19 && hour <= 22) {
        // Noite: 1-2 usuários
        baseCount = Math.floor(Math.random() * 2) + 1
      } else {
        // Madrugada: 1 usuário
        baseCount = 1
      }
      
      setCount(baseCount)
    }
    
    updateCount()
    const interval = setInterval(updateCount, 60000) // Atualizar a cada minuto
    
    return () => clearInterval(interval)
  }, [])
  
  return count
}

/**
 * Hook de fallback que simula usuários online com variação temporal
 */
export function useOnlineUsersCountFallback() {
  const [count, setCount] = useState(1)
  
  useEffect(() => {
    // Simular variação de usuários online baseada no horário
    const updateCount = () => {
      const hour = new Date().getHours()
      let baseCount = 1
      
      if (hour >= 8 && hour <= 18) {
        // Horário comercial: 1-4 usuários
        baseCount = Math.floor(Math.random() * 4) + 1
      } else if (hour >= 19 && hour <= 22) {
        // Noite: 1-2 usuários
        baseCount = Math.floor(Math.random() * 2) + 1
      } else {
        // Madrugada: 1 usuário
        baseCount = 1
      }
      
      setCount(baseCount)
    }
    
    updateCount()
    const interval = setInterval(updateCount, 30000) // Atualizar a cada 30s
    
    return () => clearInterval(interval)
  }, [])
  
  return count
}
