"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useNotify } from "@/contexts/notification-context"
import { useAuth } from "@/contexts/auth-context"

export function AdminLogin() {
  const notify = useNotify()
  const router = useRouter()
  const { signIn, loading: authLoading, user, session } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Evitar erro de hidratação
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debug: verificar estado da sessão
  useEffect(() => {
    if (isMounted) {
      console.log('🔍 [DEBUG] Estado atual:', {
        user: user?.email,
        session: !!session,
        authLoading,
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A'
      })
    }
  }, [isMounted, user, session, authLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔐 Iniciando processo de login...')
    console.log('📧 Email:', formData.email)
    console.log('🔑 Senha length:', formData.password.length)

    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('🚀 Chamando função signIn...')
      const result = await signIn(formData.email, formData.password)

      console.log('📋 Resultado do signIn:', result)

      if (result.error) {
        console.error('❌ Erro retornado:', result.error)
        setError(result.error)
        notify.error("Erro no Login", result.error)
        return
      }

      console.log('✅ Login bem-sucedido!')
      notify.success("Login Realizado", "Bem-vindo de volta!")

      // Aguardar um pouco para a notificação aparecer
      setTimeout(() => {
        console.log('🔄 Redirecionando para dashboard...')
        // Usar router.push em vez de window.location para melhor integração com Next.js
        router.push("/admin/dashboard")
      }, 1000)
    } catch (err) {
      console.error('❌ Erro no login:', err)
      setError("Erro inesperado. Tente novamente.")
      notify.error("Erro no Login", "Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar um placeholder durante a hidratação para evitar diferenças
  if (!isMounted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Zantrix Digital
            </h1>
            <p className="text-gray-600">
              Faça login para acessar o sistema
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value=""
                onChange={() => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@grupocentral.com.br"
                disabled
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value=""
                onChange={() => {}}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                disabled
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 opacity-50 cursor-not-allowed"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Credenciais de teste:</p>
            <p className="font-mono text-xs mt-1">
              admin@grupocentral.com.br
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zantrix Digital
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@grupocentral.com.br"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || authLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Credenciais de teste:</p>
          <p className="font-mono text-xs mt-1">
            admin@grupocentral.com.br
          </p>
        </div>
      </div>
    </div>
  )
}
