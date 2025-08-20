"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Trash2 } from "lucide-react"
import type { JSX } from "react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  date: string
  read: boolean
}

interface NotificationsContentProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  formatDate: (date: string) => string
  getNotificationIcon: (type: string) => JSX.Element
}

export function NotificationsContent({
  notifications,
  onMarkAsRead,
  onDelete,
  formatDate,
  getNotificationIcon,
}: NotificationsContentProps) {
  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-gray-400"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma notificação</h3>
          <p className="text-gray-500">Não há notificações para exibir neste momento.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 transition-colors ${
            notification.read ? "bg-white" : "bg-orange-50 border-l-4 border-l-orange-500"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${notification.read ? "text-gray-800" : "text-gray-900"}`}>
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
              </div>
              <p className={`text-sm mt-1 ${notification.read ? "text-gray-600" : "text-gray-700"}`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex space-x-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                  title="Marcar como lida"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(notification.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
