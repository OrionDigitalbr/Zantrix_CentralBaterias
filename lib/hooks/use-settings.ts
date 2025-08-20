'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient, handleAuthError } from '@/lib/supabase'

interface Setting {
  id: number
  key: string
  value: string
  type: string
  created_at: string
  updated_at: string
}

interface UseSettingsReturn {
  settings: Record<string, string>
  loading: boolean
  error: string | null
  getSetting: (key: string, defaultValue?: string) => string
  getSettingBoolean: (key: string, defaultValue?: boolean) => boolean
  updateSetting: (key: string, value: string) => Promise<void>
  refreshSettings: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientSupabaseClient()

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 [useSettings] Carregando configurações...')

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')

      if (fetchError) {
        console.error('❌ [useSettings] Erro ao buscar configurações:', fetchError)
        // Verificar se é erro de refresh token
        if (handleAuthError(fetchError)) {
          return // Erro foi tratado, não continuar
        }
        throw fetchError
      }

      console.log('📋 [useSettings] Configurações carregadas do banco:', data)

      // Converter array para objeto key-value
      const settingsMap = (data || []).reduce((acc: Record<string, string>, setting: Setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {})

      console.log('🗂️ [useSettings] Mapa de configurações:', settingsMap)
      console.log('🔍 [useSettings] show_prices específico:', settingsMap['show_prices'])

      setSettings(settingsMap)
    } catch (err: any) {
      // Verificar se é erro de refresh token antes de definir como erro
      if (!handleAuthError(err)) {
        setError(err.message || 'Erro ao carregar configurações')
        console.error('❌ [useSettings] Erro ao carregar configurações:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (key: string, defaultValue: string = ''): string => {
    return settings[key] || defaultValue
  }

  const getSettingBoolean = (key: string, defaultValue: boolean = true): boolean => {
    const value = settings[key]
    if (value === undefined) return defaultValue
    return value === 'true' || value === '1'
  }

  const updateSetting = async (key: string, value: string): Promise<void> => {
    try {
      console.log(`💾 [useSettings] Salvando configuração: ${key} = ${value}`)

      const { data, error: updateError } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()

      if (updateError) {
        console.error('❌ [useSettings] Erro ao salvar configuração:', updateError)
        // Verificar se é erro de refresh token
        if (handleAuthError(updateError)) {
          return // Erro foi tratado, não continuar
        }
        throw updateError
      }

      console.log('✅ [useSettings] Configuração salva no banco:', data)

      // Atualizar estado local
      setSettings(prev => {
        const newSettings = {
          ...prev,
          [key]: value
        }
        console.log('🔄 [useSettings] Estado local atualizado:', newSettings)
        return newSettings
      })

      // Verificar se foi realmente salvo
      const { data: verification } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single()

      console.log(`🔍 [useSettings] Verificação da configuração ${key}:`, verification)
    } catch (err: any) {
      console.error('❌ [useSettings] Erro completo ao atualizar configuração:', err)
      throw new Error(err.message || 'Erro ao atualizar configuração')
    }
  }

  const refreshSettings = async (): Promise<void> => {
    await loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    getSetting,
    getSettingBoolean,
    updateSetting,
    refreshSettings
  }
}
