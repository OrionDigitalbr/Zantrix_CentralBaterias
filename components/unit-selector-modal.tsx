"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { X, Loader2 } from "lucide-react"
import { useAnalytics } from "@/lib/hooks/use-analytics";

interface UnitSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUnit: (whatsappUrl: string) => void
  productName: string
  productSku: string
  quantity?: number
}

export function UnitSelectorModal({ isOpen, onClose, onSelectUnit, productName, productSku, quantity = 1 }: UnitSelectorModalProps) {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Hook useAnalytics deve estar no topo, antes de qualquer return
  const { trackUnitActionClick } = useAnalytics();

  useEffect(() => {
    if (isOpen) {
      fetchUnits()
      // Desabilitar scroll da página
      document.body.style.overflow = 'hidden'
      // Iniciar animação de entrada
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      // Reabilitar scroll da página
      document.body.style.overflow = 'unset'
      setIsAnimating(false)
    }

    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  async function fetchUnits() {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("units").select("*").eq("active", true).order("name")

      if (error) {
        console.error("Erro ao buscar unidades:", error)
        setUnits([])
      } else {
        setUnits(data || [])
      }
    } catch (error) {
      console.error("Erro ao buscar unidades:", error)
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatWhatsAppNumber = (phone?: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return cleaned.substring(1);
    if (cleaned.length <= 11) return `55${cleaned}`;
    return cleaned;
  }

  const generateWhatsAppMessage = (unit: any) => {
    const message = `Olá! Estou interessado no produto ${productName} (SKU: ${productSku}), quantidade: ${quantity}. Gostaria de mais informações.`
    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = formatWhatsAppNumber(unit.whatsapp || unit.phone)
    
    if (!whatsappNumber) {
      console.error('Número do WhatsApp não disponível para a unidade:', unit.name);
      return '';
    }
    
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) // Aguardar animação de saída
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
        isAnimating ? 'bg-opacity-80' : 'bg-opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Escolha uma unidade
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600 dark:text-gray-200">Carregando unidades...</span>
            </div>
          ) : units.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Escolha uma de nossas unidades para entrar em contato via WhatsApp e obter mais informações sobre{" "}
                <span className="font-semibold text-gray-800 dark:text-white">{productName}</span>.
              </p>

              {units.map((unit, index) => (
                <div
                  key={unit.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 ease-out transform bg-white dark:bg-gray-900 ${
                    isAnimating
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isAnimating ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{unit.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{unit.address}</p>
                  <button
                    onClick={async () => {
                      // Disparar evento de analytics para clique no WhatsApp
                      if (unit.id) {
                        await trackUnitActionClick(unit.id, 'whatsapp', {
                          productSku,
                          productName,
                          quantity
                        });
                      }
                      onSelectUnit(generateWhatsAppMessage(unit))
                      handleClose()
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md flex items-center justify-center transition-colors font-semibold shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Nenhuma unidade disponível</h4>
              <p className="text-gray-600 dark:text-gray-300">
                No momento não temos unidades cadastradas. Por favor, tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 py-2 rounded-md transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
