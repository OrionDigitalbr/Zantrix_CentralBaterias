"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, User, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThemeToggle } from "./theme-toggle" // Importar o componente

export function AdminHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const { notifications, markAsRead, deleteNotification } = useNotifications()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Pegar apenas as 5 notificações mais recentes para o dropdown
  const recentNotifications = notifications.slice(0, 5)

  return (
    <header className="bg-card text-card-foreground shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          <button
            className="lg:hidden mr-2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center min-w-0">
            <div className="flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=120"
                alt="Grupo Central Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <span className="ml-2 text-foreground font-semibold hidden sm:inline truncate">Admin</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="relative">
            <button
              className="text-muted-foreground hover:text-foreground focus:outline-none relative"
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (showUserMenu) setShowUserMenu(false)
              }}
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                  {notifications.some(n => !n.read) && (
                    <p className="text-xs text-muted-foreground">{notifications.filter(n => !n.read).length} não lida{notifications.filter(n => !n.read).length > 1 ? 's' : ''}</p>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-muted border-b border-border transition-colors cursor-pointer ${
                          !notification.read ? 'bg-orange-500/10' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        <p className={`text-sm break-words ${
                          !notification.read ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 text-center border-t border-border">
                  <Link
                    href="/admin/notifications"
                    className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                if (showNotifications) setShowNotifications(false)
              }}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="ml-2 text-sm font-medium hidden md:inline">
                {!mounted ? "Admin" : (user?.email?.split("@")[0] ?? "Admin")}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                <Link href="/admin/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    Meu Perfil
                  </div>
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <div className="flex items-center">
                    <Bell size={16} className="mr-2" />
                    Configurações
                  </div>
                </Link>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {showMobileMenu && (
        <div
          className={`fixed inset-0 bg-black backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ease-out ${
            showMobileMenu ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => setShowMobileMenu(false)}
        >
          {/* Menu Mobile Container */}
          <div
            className={`fixed top-0 left-0 h-full w-4/5 bg-white shadow-xl transform transition-transform duration-300 ease-out ${
              showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho do Menu */}
              <div className="flex justify-between items-center p-4 border-b">
                <Image
                  src="/placeholder.svg?height=40&width=120"
                  alt="Grupo Central Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <ul className="space-y-1">
                  {[
                    { href: '/admin/dashboard', label: 'Dashboard' },
                    { href: '/admin/products', label: 'Produtos' },
                    { href: '/admin/slides', label: 'Slides' },
                    { href: '/admin/users', label: 'Usuários' },
                    { href: '/admin/analytics', label: 'Analytics' },
                    { href: '/admin/notifications', label: 'Notificações' },
                    { href: '/admin/settings', label: 'Configurações' },
                    { href: '/admin/ajuda', label: 'Ajuda' }
                  ].map((item, index) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 transform ${
                          showMobileMenu
                            ? 'translate-x-0 opacity-100'
                            : 'translate-x-4 opacity-0'
                        }`}
                        style={{
                          transitionDelay: showMobileMenu ? `${index * 50}ms` : '0ms'
                        }}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer do Menu */}
              <div className={`border-t p-4 transform transition-all duration-300 ${
                showMobileMenu
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-4 opacity-0'
              }`}
              style={{
                transitionDelay: showMobileMenu ? '400ms' : '0ms'
              }}>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
