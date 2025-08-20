'use client'

import { createContext, useContext, ReactNode } from 'react'
import { NotificationSystem, useNotifications } from '@/components/ui/notification-system'

interface NotificationContextType {
  success: (title: string, message: string) => void
  error: (title: string, message: string) => void
  warning: (title: string, message: string) => void
  info: (title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, removeNotification, success, error, warning, info } = useNotifications()

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context
}
