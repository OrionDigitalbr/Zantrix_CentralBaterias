"use client"

import { useState, useEffect } from "react"
import { Users, ShoppingBag, Eye, MousePointer2, UserCheck } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useOnlineUsersCount } from "@/lib/hooks/use-online-users-simple"
import "@/styles/dashboard.css"

export interface DashboardAnalytics {
  daily_views: number
  daily_unit_clicks: number
  chart_data: Array<{
    date: string
    day: string
    views: number
    clicks: number
  }>
  total_views_30d: number
  total_clicks_30d: number
  total_views_period: number
  total_clicks_period: number
  period_days: number
  period_label: string
}

interface DashboardStatsProps {
  selectedPeriod?: string
  dashboardData?: DashboardAnalytics | null
  loading?: boolean
}

export function DashboardStats({ selectedPeriod, dashboardData, loading: externalLoading }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    daily_views: 0,
    daily_unit_clicks: 0,
  })
  const [loading, setLoading] = useState(true)

  // Usar hook de usuários online simplificado
  const onlineUsersCount = useOnlineUsersCount()

  // Determinar rótulo do período
  const getPeriodLabel = () => {
    if (dashboardData?.period_days) {
      return `${dashboardData.period_days} dias`
    }
    switch (selectedPeriod) {
      case 'last_7_days': return '7 dias'
      case 'last_30_days': return '30 dias'
      case 'last_90_days': return '90 dias'
      default: return '30 dias'
    }
  }

  // Usar loading externo se fornecido
  const isLoading = externalLoading !== undefined ? externalLoading : loading

  useEffect(() => {
    async function fetchStats() {
      try {
        // Se dados externos foram fornecidos, usar eles
        if (dashboardData) {
          console.log('📊 [DASHBOARD STATS] Usando dados externos fornecidos')

          const supabase = createClientSupabaseClient()

          // Buscar apenas contagem de produtos e usuários (dados estáticos)
          const { count: productsCount, error: productsError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })

          if (productsError) {
            console.error('❌ [DASHBOARD STATS] Erro ao buscar produtos:', productsError.message)
          }

          const { count: usersCount, error: usersError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })

          if (usersError) {
            console.error('❌ [DASHBOARD STATS] Erro ao buscar usuários:', usersError.message)
          }

          // Usar dados de analytics fornecidos externamente
          setStats({
            products: productsCount || 0,
            users: usersCount || 0,
            daily_views: dashboardData.total_views_period || 0, // USAR DADOS DO PERÍODO SELECIONADO
            daily_unit_clicks: dashboardData.total_clicks_period || 0, // USAR DADOS DO PERÍODO SELECIONADO
          })

          console.log(`📈 [DASHBOARD STATS] Estatísticas atualizadas (${selectedPeriod}):`, {
            products: productsCount || 0,
            users: usersCount || 0,
            views_period: dashboardData.total_views_period || 0,
            clicks_period: dashboardData.total_clicks_period || 0,
            period_days: dashboardData.period_days || 0,
          })

          return
        }

        // Fallback: buscar dados internamente (modo legado)
        setLoading(true)
        const supabase = createClientSupabaseClient()

        console.log('📊 [DASHBOARD STATS] Buscando estatísticas (modo legado)...')

        // Buscar contagem de produtos
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })

        if (productsError) {
          console.error('❌ [DASHBOARD STATS] Erro ao buscar produtos:', productsError.message)
        }

        // Buscar contagem de usuários (profiles)
        const { count: usersCount, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        if (usersError) {
          console.error('❌ [DASHBOARD STATS] Erro ao buscar usuários:', usersError.message)
        }

        // Buscar dados de analytics do dashboard
        let analyticsData: DashboardAnalytics | null = null
        try {
          const analyticsResponse = await fetch('/api/admin/dashboard/analytics')
          if (analyticsResponse.ok) {
            analyticsData = await analyticsResponse.json()
            console.log('✅ [DASHBOARD STATS] Dados de analytics carregados:', analyticsData)
          } else {
            console.error('❌ [DASHBOARD STATS] Erro na API de analytics:', analyticsResponse.status)
          }
        } catch (analyticsError) {
          console.error('❌ [DASHBOARD STATS] Erro ao buscar analytics:', analyticsError)
        }

        // Atualizar estatísticas - USAR DADOS DOS ÚLTIMOS 30 DIAS PARA CONSISTÊNCIA
        setStats({
          products: productsCount || 0,
          users: usersCount || 0,
          daily_views: analyticsData?.total_views_30d || 0,
          daily_unit_clicks: analyticsData?.total_clicks_30d || 0,
        })

        console.log('📈 [DASHBOARD STATS] Estatísticas atualizadas (modo legado):', {
          products: productsCount || 0,
          users: usersCount || 0,
          views_30d: analyticsData?.total_views_30d || 0,
          clicks_30d: analyticsData?.total_clicks_30d || 0,
        })

      } catch (error) {
        console.error("❌ [DASHBOARD STATS] Erro geral:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dashboardData, selectedPeriod])

  return (
    <div className="flex flex-wrap gap-4 mb-6 dashboard-cards-container">
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 flex-1 min-w-0 dashboard-card">
        <div className="flex items-center">
          <div className="p-3 bg-blue-500/10 rounded-full mr-4">
            <ShoppingBag className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats.products}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 flex-1 min-w-0 dashboard-card">
        <div className="flex items-center">
          <div className="p-3 bg-green-500/10 rounded-full mr-4">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats.users}</p>
            )}
          </div>
        </div>
      </div>

      {/* Usuários Online */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 flex-1 min-w-0 dashboard-card">
        <div className="flex items-center">
          <div className="p-3 bg-sky-500/10 rounded-full mr-4">
            <UserCheck className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Usuários Online</p>
            <p className="text-2xl font-bold text-foreground">{onlineUsersCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 flex-1 min-w-0 dashboard-card">
        <div className="flex items-center">
          <div className="p-3 bg-purple-500/10 rounded-full mr-4">
            <Eye className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Visualizações ({getPeriodLabel()})</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats.daily_views}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 flex-1 min-w-0 dashboard-card">
        <div className="flex items-center">
          <div className="p-3 bg-orange-500/10 rounded-full mr-4">
            <MousePointer2 className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cliques Unidades ({getPeriodLabel()})</p>
            {isLoading ? (
              <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{stats.daily_unit_clicks}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
