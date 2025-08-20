'use client'

import { useSettings } from '@/lib/hooks/use-settings'
import { cn } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface PriceDisplayProps {
  price: number
  salePrice?: number | null
  className?: string
  showInstallments?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  contactMessage?: string
}

export function PriceDisplay({
  price,
  salePrice,
  className,
  showInstallments = false,
  size = 'md',
  contactMessage = "Consulte com a unidade"
}: PriceDisplayProps) {
  const { getSettingBoolean, loading, settings, getSetting } = useSettings()

  // Verificar se deve mostrar preços - padrão é true se não houver configuração
  const showPrices = getSettingBoolean('show_prices', true)
  
  // Obter cor do tema - padrão laranja se não configurada
  const themeColor = getSetting('theme_color', '#f97316')

  // Debug log para verificar o estado
  console.log('🔍 PriceDisplay Debug:', {
    loading,
    showPrices,
    settingsCount: Object.keys(settings).length,
    showPricesSetting: settings['show_prices'],
    themeColor,
    allSettings: settings,
    price,
    salePrice,
    component: 'PriceDisplay'
  })

  const finalPrice = salePrice || price
  const hasDiscount = salePrice && salePrice < price

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  }

  const largeSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  // Se ainda está carregando, mostrar placeholder
  if (loading) {
    return (
      <div className={cn("", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  // Se não deve mostrar preços, exibir mensagem de contato
  if (!showPrices) {
    return (
      <div className={cn("text-gray-600", className)}>
        <div className={cn(
          "flex items-center gap-2 font-medium",
          sizeClasses[size]
        )}>
          <MessageCircle className={cn(
            "clientecor flex-shrink-0",
            size === 'sm' ? 'h-3 w-3' :
            size === 'md' ? 'h-3 w-3' :
            size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'
          )} />
          <span className="text-foreground">{contactMessage}</span>
        </div>
        {showInstallments && (
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Condições especiais disponíveis
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {hasDiscount && (
          <span className={cn(
            "text-gray-500 line-through",
            sizeClasses[size]
          )}>
            R$ {price.toFixed(2).replace(".", ",")}
          </span>
        )}

        <span 
          className={cn(
            "font-bold",
            largeSizeClasses[size]
          )}
          style={{ color: themeColor }}
        >
          R$ {finalPrice.toFixed(2).replace(".", ",")}
        </span>

        {hasDiscount && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
            {Math.round(((price - finalPrice) / price) * 100)}% OFF
          </span>
        )}
      </div>

      {showInstallments && (
        <p className={cn(
          "text-gray-600 mt-1",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          Em até 12x de R$ {(finalPrice / 12).toFixed(2).replace(".", ",")} sem juros
        </p>
      )}
    </div>
  )
}

// Componente específico para cards de produto
export function ProductCardPrice({
  price,
  salePrice,
  className
}: {
  price: number
  salePrice?: number | null
  className?: string
}) {
  return (
    <PriceDisplay
      price={price}
      salePrice={salePrice}
      size="lg"
      className={className}
    />
  )
}

// Componente específico para página de detalhes
export function ProductDetailPrice({
  price,
  salePrice,
  className
}: {
  price: number
  salePrice?: number | null
  className?: string
}) {
  return (
    <PriceDisplay
      price={price}
      salePrice={salePrice}
      size="xl"
      showInstallments={true}
      className={className}
    />
  )
}

// Componente específico para lista de produtos
export function ProductListPrice({
  price,
  salePrice,
  className
}: {
  price: number
  salePrice?: number | null
  className?: string
}) {
  return (
    <PriceDisplay
      price={price}
      salePrice={salePrice}
      size="md"
      className={className}
    />
  )
}
