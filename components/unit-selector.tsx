"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react"

interface Unit {
  id: number
  name: string
  address: string
  phone?: string
  whatsapp?: string
  working_hours?: string
  maps_url?: string
}

interface UnitSelectorProps {
  trigger: React.ReactNode
  productName?: string
  productSku?: string
  quantity?: number
}

export function UnitSelector({ trigger, productName, productSku, quantity = 1 }: UnitSelectorProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUnits() {
      try {
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .eq('active', true)
          .order('name')

        if (error) {
          console.error('Erro ao buscar unidades:', error)
          return
        }

        setUnits(data || [])
      } catch (error) {
        console.error('Erro ao buscar unidades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [supabase])

  const formatWhatsAppNumber = (phone?: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return cleaned.substring(1);
    if (cleaned.length <= 11) return `55${cleaned}`;
    return cleaned;
  }

  const handleUnitSelect = (unit: Unit) => {
    const whatsappNumber = formatWhatsAppNumber(unit.whatsapp || unit.phone)
    
    if (!whatsappNumber) {
      console.error('Nenhum número de telefone disponível para a unidade:', unit.name);
      return;
    }

    // Mensagem personalizada com base no contexto
    let messageText = 'Olá! Gostaria de falar com um consultor sobre baterias.'
    
    if (productName && productSku) {
      messageText = `Olá! Estou interessado no produto ${productName} (SKU: ${productSku}), quantidade: ${quantity}. Gostaria de mais informações.`
    }
    
    const message = encodeURIComponent(messageText)

    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Escolha uma unidade
          </DialogTitle>
          <DialogDescription>
            Selecione a unidade mais próxima para falar com nosso consultor via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : units.length > 0 ? (
            units.map((unit, index) => (
              <div
                key={unit.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-out transform ${
                  open
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }`}
                style={{
                  transitionDelay: open ? `${index * 100}ms` : '0ms'
                }}
                onClick={() => handleUnitSelect(unit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{unit.name}</h3>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{unit.address}</span>
                      </div>

                      {unit.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{unit.phone}</span>
                        </div>
                      )}

                      {unit.working_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{unit.working_hours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-4">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma unidade disponível no momento.</p>
              <p className="text-sm">Tente novamente mais tarde.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
