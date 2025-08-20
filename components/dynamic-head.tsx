'use client'

import { useEffect } from 'react'
import { useSettings } from '@/lib/hooks/use-settings'

export function DynamicHead() {
  const { getSetting, loading, settings } = useSettings()

  useEffect(() => {
    console.log('🎨 [DYNAMIC HEAD] useEffect executado')
    console.log('📊 [DYNAMIC HEAD] Loading:', loading)
    console.log('📋 [DYNAMIC HEAD] Settings:', settings)

    if (loading) {
      console.log('⏳ [DYNAMIC HEAD] Ainda carregando, aguardando...')
      return
    }

    console.log('🎨 [DYNAMIC HEAD] Aplicando configurações dinâmicas...')

    // Aplicar título do site
    const siteTitle = getSetting('site_title', 'Grupo Central')
    if (siteTitle && siteTitle !== 'Grupo Central') {
      console.log('📝 [DYNAMIC HEAD] Atualizando título:', siteTitle)
      document.title = siteTitle
    }

    // Aplicar favicon
    const faviconUrl = getSetting('favicon')
    if (faviconUrl) {
      console.log('🔗 [DYNAMIC HEAD] Atualizando favicon:', faviconUrl)

      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (existingFavicon) {
        existingFavicon.remove()
      }

      // Adicionar novo favicon
      const newFavicon = document.createElement('link')
      newFavicon.rel = 'icon'
      newFavicon.type = 'image/x-icon'
      newFavicon.href = faviconUrl
      document.head.appendChild(newFavicon)
    }

    // Aplicar meta description se disponível
    const siteDescription = getSetting('site_description')
    if (siteDescription) {
      console.log('📄 [DYNAMIC HEAD] Atualizando description:', siteDescription)

      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.name = 'description'
        document.head.appendChild(metaDescription)
      }
      metaDescription.content = siteDescription
    }

    // Aplicar cor do tema
    const themeColor = getSetting('theme_color', '#f97316')
    if (themeColor) {
      console.log('🎨 [DYNAMIC HEAD] Atualizando theme-color:', themeColor)

      let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.name = 'theme-color'
        document.head.appendChild(metaThemeColor)
      }
      metaThemeColor.content = themeColor
    }

    console.log('✅ [DYNAMIC HEAD] Configurações aplicadas com sucesso!')
  }, [getSetting, loading, settings])

  return null // Este componente não renderiza nada visualmente
}
