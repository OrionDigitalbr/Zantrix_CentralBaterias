'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { createClientSupabaseClient } from '@/lib/supabase'
import { Building, Palette, Eye, EyeOff, Save, RefreshCw } from 'lucide-react'
import { TestPriceDisplay } from '@/components/test-price-display'

interface Setting {
  id: number
  key: string
  value: string
  type: string
}

export default function LayoutSettingsTab() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPrices, setShowPrices] = useState(true)
  const [themeColor, setThemeColor] = useState('#1f2937')
  const [enableAnalytics, setEnableAnalytics] = useState(true)

  // Novos campos de branding
  const [siteTitle, setSiteTitle] = useState('Grupo Central')
  const [favicon, setFavicon] = useState('')
  const [logo, setLogo] = useState('')
  const [icon, setIcon] = useState('')

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['show_prices', 'theme_color', 'enable_analytics', 'site_title', 'favicon', 'logo', 'icon'])

      if (error) throw error

      setSettings(data || [])

      // Aplicar valores carregados
      data?.forEach(setting => {
        switch (setting.key) {
          case 'show_prices':
            setShowPrices(setting.value === 'true')
            break
          case 'theme_color':
            setThemeColor(setting.value)
            break
          case 'enable_analytics':
            setEnableAnalytics(setting.value === 'true')
            break
          case 'site_title':
            setSiteTitle(setting.value)
            break
          case 'favicon':
            setFavicon(setting.value)
            break
          case 'logo':
            setLogo(setting.value)
            break
          case 'icon':
            setIcon(setting.value)
            break
        }
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveSetting = async (key: string, value: string) => {
    console.log(`🔧 [LAYOUT SETTINGS] Salvando: ${key} = ${value}`)
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()

      if (error) {
        console.error(`❌ [LAYOUT SETTINGS] Erro Supabase para ${key}:`, error)
        throw error
      }

      console.log(`✅ [LAYOUT SETTINGS] ${key} salvo com sucesso:`, data)
    } catch (error) {
      console.error(`❌ [LAYOUT SETTINGS] Erro geral ao salvar ${key}:`, error)
      throw error
    }
  }

  const handleSaveAll = async () => {
    console.log('🔗 [LAYOUT SETTINGS] handleSaveAll invocado')
    console.log('📋 [LAYOUT SETTINGS] Dados atuais:', {
      showPrices,
      themeColor,
      enableAnalytics,
      siteTitle,
      favicon,
      logo,
      icon
    })

    setSaving(true)
    try {
      console.log('💾 [LAYOUT SETTINGS] Iniciando salvamento...')

      await Promise.all([
        saveSetting('show_prices', showPrices.toString()),
        saveSetting('theme_color', themeColor),
        saveSetting('enable_analytics', enableAnalytics.toString()),
        saveSetting('site_title', siteTitle),
        saveSetting('favicon', favicon),
        saveSetting('logo', logo),
        saveSetting('icon', icon)
      ])

      console.log('✅ [LAYOUT SETTINGS] Todas as configurações salvas')
      toast.success('Configurações de layout salvas com sucesso!')
      await loadSettings() // Recarregar para confirmar
    } catch (error) {
      console.error('❌ [LAYOUT SETTINGS] Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configurações de Preços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showPrices ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Exibição de Preços
          </CardTitle>
          <CardDescription>
            Controle se os preços dos produtos são exibidos ou ocultados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-prices">Exibir preços dos produtos</Label>
              <p className="text-sm text-muted-foreground">
                {showPrices
                  ? 'Os preços serão exibidos normalmente'
                  : 'Será exibida a mensagem "Consulte com a unidade"'
                }
              </p>
            </div>
            <Switch
              id="show-prices"
              checked={showPrices}
              onCheckedChange={setShowPrices}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Prévia:</p>
            <div className="bg-background p-3 rounded border">
              <p className="font-medium">Bateria Jupiter 60Ah</p>
              {showPrices ? (
                <p className="text-lg font-bold text-green-600">R$ 299,90</p>
              ) : (
                <p className="text-sm text-muted-foreground">Consulte com a unidade</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Branding Global
          </CardTitle>
          <CardDescription>
            Configure elementos visuais da marca em todo o site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título do Site */}
          <div className="space-y-2">
            <Label htmlFor="site-title">Título do Site</Label>
            <Input
              id="site-title"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Grupo Central"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Aparece na aba do navegador e em mecanismos de busca
            </p>
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon (URL)</Label>
            <Input
              id="favicon"
              value={favicon}
              onChange={(e) => setFavicon(e.target.value)}
              placeholder="https://exemplo.com/favicon.ico"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Ícone pequeno que aparece na aba do navegador (16x16px ou 32x32px)
            </p>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo Principal (URL)</Label>
            <Input
              id="logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Logo principal usado no cabeçalho do site (recomendado: 200x60px)
            </p>
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label htmlFor="icon">Ícone da Marca (URL)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://exemplo.com/icon.png"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Ícone usado no menu mobile e outras áreas (recomendado: 40x40px)
            </p>
          </div>

          {/* Prévia do Branding */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Prévia do Branding:</p>
            <div className="bg-background p-4 rounded border space-y-3">
              <div className="flex items-center gap-3">
                {icon && (
                  <img src={icon} alt="Ícone" className="w-8 h-8 rounded" />
                )}
                <span className="font-semibold">{siteTitle}</span>
              </div>
              {logo && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Logo Principal:</p>
                  <img src={logo} alt="Logo" className="h-12 max-w-48 object-contain" />
                </div>
              )}
              {favicon && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Favicon:</p>
                  <img src={favicon} alt="Favicon" className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema e Cores
          </CardTitle>
          <CardDescription>
            Personalize as cores principais do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-color">Cor principal</Label>
            <div className="flex items-center gap-3">
              <Input
                id="theme-color"
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-20 h-10 p-1"
              />
              <Input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#1f2937"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Esta cor será usada em botões, links e elementos de destaque
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics e Rastreamento</CardTitle>
          <CardDescription>
            Configure ferramentas de análise e rastreamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-analytics">Habilitar Google Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Ativa o rastreamento de visitantes e comportamento no site
              </p>
            </div>
            <Switch
              id="enable-analytics"
              checked={enableAnalytics}
              onCheckedChange={setEnableAnalytics}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadSettings} disabled={saving}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
        <Button onClick={handleSaveAll} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <Separator />

      {/* Componente de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Configurações</CardTitle>
          <CardDescription>
            Use este componente para testar se as configurações estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestPriceDisplay />
        </CardContent>
      </Card>
    </div>
  )
}
