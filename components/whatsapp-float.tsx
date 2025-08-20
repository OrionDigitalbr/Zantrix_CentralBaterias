"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

export default function WhatsappFloat() {
  const [units, setUnits] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Não mostrar em páginas admin
  const isAdminPage = pathname?.startsWith("/admin")

  // Verificar se há unidades
  const hasUnits = units.length > 0

  useEffect(() => {
    async function fetchUnits() {
      try {
        setIsLoading(true)
        const supabase = createClientComponentClient()
        const { data, error } = await supabase.from("units").select("*").eq("active", true)

        if (!error) {
          setUnits(data || [])
        } else {
          console.error("Erro ao buscar unidades:", error)
        }
      } catch (error) {
        console.error("Erro ao buscar unidades:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAdminPage) {
      fetchUnits()
    }
  }, [isAdminPage])

  if (isAdminPage) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-pulse hover:animate-none transition-all"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 dark:text-white">{hasUnits ? "Encontre a loja mais próxima" : "Fale Conosco"}</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ✕
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">Carregando unidades...</p>
            ) : hasUnits ? (
              <ul className="space-y-3">
                {units.map((unit) => (
                  <li key={unit.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <p className="font-medium text-gray-800 dark:text-white">{unit.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{unit.address}</p>
                    {unit.phone ? (
                      <a
                        href={`https://wa.me/55${unit.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 text-sm font-medium"
                      >
                        Falar via WhatsApp
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">WhatsApp não disponível</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                Nenhuma unidade cadastrada no momento.
                <br />
                <Link href="/contato" className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-medium">
                  Entre em contato
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
