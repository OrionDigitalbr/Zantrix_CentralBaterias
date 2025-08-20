'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'

interface CreateNotificationData {
  type: 'user' | 'product' | 'slide' | 'setting' | 'system'
  action: 'create' | 'update' | 'delete'
  title: string
  description: string
  entity_id?: string | null
  entity_name?: string | null
  user_id?: string | null
  user_name?: string | null
  user_role?: string | null
}

interface Notification {
  id: string
  type: string
  action: string
  title: string
  description: string
  entity_id: string | null
  entity_name: string | null
  user_id: string | null
  user_name: string | null
  user_role: string | null
  read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchNotifications()
    
    // Configurar real-time subscription
    const channel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('🔔 Nova notificação em tempo real:', payload)
          
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev])
            setUnreadCount(prev => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => 
                n.id === payload.new.id ? payload.new as Notification : n
              )
            )
            // Recalcular unread count
            fetchUnreadCount()
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => 
              prev.filter(n => n.id !== payload.old.id)
            )
            fetchUnreadCount()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      
      // Calcular não lidas
      const unread = (data || []).filter(n => !n.read).length
      setUnreadCount(unread)
      
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)

      if (error) throw error
      
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error)
    }
  }

  const createNotification = async (data: CreateNotificationData): Promise<boolean> => {
    try {
      console.log('📝 Criando notificação:', data)
      
      // Buscar informações do usuário atual se não fornecidas
      let userData = {
        user_id: data.user_id,
        user_name: data.user_name,
        user_role: data.user_role
      }

      if (!userData.user_id) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userData.user_id = user.id
          userData.user_name = user.email || 'Usuário'
          userData.user_role = 'admin' // Pode ser melhorado com sistema de roles
        }
      }

      const notificationData = {
        type: data.type,
        action: data.action,
        title: data.title,
        description: data.description,
        entity_id: data.entity_id || null,
        entity_name: data.entity_name || null,
        user_id: userData.user_id,
        user_name: userData.user_name,
        user_role: userData.user_role,
        read: false
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (error) {
        console.error('❌ Erro ao criar notificação:', error)
        throw error
      }

      console.log('✅ Notificação criada com sucesso')
      return true
      
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      return false
    }
  }

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      return true
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      return false
    }
  }

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      
      setUnreadCount(0)
      
      return true
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      return false
    }
  }

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      )
      
      // Recalcular unread count
      fetchUnreadCount()
      
      return true
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      return false
    }
  }

  // Funções de conveniência para tipos específicos
  const notifyUserAction = (action: 'create' | 'update' | 'delete', userName: string, userId?: string) => {
    const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
    return createNotification({
      type: 'user',
      action,
      title: `Usuário ${actionText}`,
      description: `O usuário "${userName}" foi ${actionText} no sistema.`,
      entity_id: userId,
      entity_name: userName
    })
  }

  const notifyProductAction = (action: 'create' | 'update' | 'delete', productName: string, productId?: string) => {
    const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
    return createNotification({
      type: 'product',
      action,
      title: `Produto ${actionText}`,
      description: `O produto "${productName}" foi ${actionText}.`,
      entity_id: productId,
      entity_name: productName
    })
  }

  const notifySlideAction = (action: 'create' | 'update' | 'delete', slideTitle: string, slideId?: string) => {
    const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
    return createNotification({
      type: 'slide',
      action,
      title: `Slide ${actionText}`,
      description: `O slide "${slideTitle}" foi ${actionText}.`,
      entity_id: slideId,
      entity_name: slideTitle
    })
  }

  const notifySettingAction = (action: 'update', settingName: string, newValue?: string) => {
    return createNotification({
      type: 'setting',
      action,
      title: 'Configuração alterada',
      description: `A configuração "${settingName}" foi alterada${newValue ? ` para "${newValue}"` : ''}.`,
      entity_name: settingName
    })
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Funções de conveniência
    notifyUserAction,
    notifyProductAction,
    notifySlideAction,
    notifySettingAction
  }
}
