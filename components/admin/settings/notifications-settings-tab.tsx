'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, ShoppingBag, MessageSquare, User, Trash2, Check, RefreshCw } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read_at?: string | null
  deleted_at?: string | null
  created_at: string
}

export default function NotificationsSettingsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [productNotifications, setProductNotifications] = useState(true)
  const [userNotifications, setUserNotifications] = useState(true)

  const supabase = createClientSupabaseClient()

  // Carregar notificações do banco
  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .is('deleted_at', null) // Não mostrar notificações excluídas
        .order('created_at', { ascending: false })
        .limit(10) // Mostrar apenas as 10 mais recentes

      if (error) {
        console.error('Erro ao carregar notificações:', error)
        // Usar dados de exemplo em caso de erro
        setNotifications([
          {
            id: 1,
            title: "Novo produto cadastrado",
            message: "Bateria Jupiter 80Ah foi adicionada ao catálogo",
            type: "product",
            read_at: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Estoque baixo",
            message: "Filtro de óleo para Scania está com estoque baixo (3 unidades)",
            type: "product",
            read_at: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
          }
        ])
      } else {
        setNotifications(data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  // Marcar como lida
  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Erro ao marcar como lida:', error)
        toast.error('Erro ao marcar notificação como lida')
        return
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      )
      
      toast.success('Notificação marcada como lida')
    } catch (err) {
      console.error('Erro ao marcar como lida:', err)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  // Excluir notificação (soft delete)
  const deleteNotification = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir notificação:', error)
        toast.error('Erro ao excluir notificação')
        return
      }

      // Remover do estado local
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      toast.success('Notificação excluída')
    } catch (err) {
      console.error('Erro ao excluir notificação:', err)
      toast.error('Erro ao excluir notificação')
    }
  }

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read_at
    return notification.type === filter
  })

  // Função para obter ícone por tipo
  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "user":
        return <User className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-orange-500" />
    }
  }

  // Função para formatar tempo
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`
  }

  return (
    <div className="space-y-6">
      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificações
          </CardTitle>
          <CardDescription>
            Configure como e quando receber notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações no navegador
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="product-notifications">Notificações de Produtos</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre estoque, novos produtos, etc.
                  </p>
                </div>
                <Switch
                  id="product-notifications"
                  checked={productNotifications}
                  onCheckedChange={setProductNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="user-notifications">Notificações de Usuários</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre novos usuários, atividades, etc.
                  </p>
                </div>
                <Switch
                  id="user-notifications"
                  checked={userNotifications}
                  onCheckedChange={setUserNotifications}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Lista de Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notificações Recentes</span>
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Últimas 10 notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Não lidas
              </Button>
              <Button
                variant={filter === "product" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("product")}
              >
                Produtos
              </Button>
              <Button
                variant={filter === "message" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("message")}
              >
                Mensagens
              </Button>
            </div>

            {/* Lista de Notificações */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      !notification.read_at ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read_at && (
                          <Badge variant="secondary" className="text-xs">Nova</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">Nenhuma notificação</h3>
                <p className="text-gray-500">Não há notificações para exibir neste momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
