"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthStatus() {
      const supabase = createClientComponentClient()
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 relative w-full h-64">
          <Image
            src="/placeholder.svg?height=300&width=400&text=Página não encontrada"
            alt="Página não encontrada"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">A página que você está procurando não existe ou foi movida.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full sm:w-auto"
          >
            <Home size={18} />
            Voltar para Home
          </Link>

          {!loading && isLoggedIn && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
              <ArrowLeft size={18} />
              Voltar para o Painel
            </Link>
          )}
        </div>
      </div>

      <div className="mt-12 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Grupo Central. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
