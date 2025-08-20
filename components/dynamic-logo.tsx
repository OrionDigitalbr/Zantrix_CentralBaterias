'use client'

import { useEffect, useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/hooks/use-settings'

interface DynamicLogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
  light?: string
  dark?: string
}

export function DynamicLogo({
  className,
  width = 180,
  height = 60,
  alt = 'Logo',
  light: lightLogoProp,
  dark: darkLogoProp,
}: DynamicLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { getSetting } = useSettings()

  // Evitar hidratação até que o componente seja montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Obter URLs das logos
  const lightLogoUrl = lightLogoProp || getSetting('logo') || ''
  const darkLogoUrl = darkLogoProp || getSetting('logo_dark') || lightLogoUrl // Fallback para a logo clara se a escura não existir
  
  // Determinar qual URL de logo usar com base no tema
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'
  const logoToUse = isDarkMode && darkLogoUrl ? darkLogoUrl : lightLogoUrl
  
  // Se ainda está carregando ou não tem logo configurado, usar placeholder
  const finalLogoUrl = (!mounted || loading) 
    ? "/placeholder-logo.svg" 
    : logoToUse || "/placeholder-logo.svg"

  // Log para debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ [DYNAMIC LOGO]', {
      theme,
      resolvedTheme,
      isDarkMode,
      lightLogoUrl,
      darkLogoUrl,
      finalLogoUrl,
      mounted,
      loading
    })
  }

  return (
    <div className={cn('relative', className)} style={{ width: width || 'auto', height: height || 'auto' }}>
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          minWidth: width || 180, 
          minHeight: height || 60,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <Image
          src={finalLogoUrl}
          alt={alt || 'Logo'}
          width={width || 180}
          height={height || 60}
          className={cn(
            'object-contain transition-opacity duration-300',
            {
              'opacity-0': loading || !mounted,
              'opacity-100': !loading && mounted,
            }
          )}
          priority
          onLoad={() => setLoading(false)}
          onError={() => {
            console.error(`Erro ao carregar a logo: ${finalLogoUrl}`)
            setLoading(false)
          }}
        />
      </div>
    </div>
  )
}
