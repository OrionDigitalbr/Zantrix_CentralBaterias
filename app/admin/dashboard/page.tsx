'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { InteractiveChart } from "@/components/admin/interactive-chart"
import { RecentProducts } from "@/components/admin/recent-products"

import type { DashboardAnalytics } from '@/components/dashboard-stats'

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 [DASHBOARD PAGE] Buscando dados para período: ${selectedPeriod}`)

      // Determine startDate e endDate com base em selectedPeriod
      const now = new Date()
      let days = 30
      if (selectedPeriod === 'last_7_days') days = 7
      else if (selectedPeriod === 'last_90_days') days = 90

      const startDate = new Date()
      startDate.setDate(now.getDate() - days)

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        period: selectedPeriod,
      }).toString()

      // Fetch dados do dashboard com filtro de período
      const response = await fetch(`/api/admin/dashboard/analytics?${params}`)

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log(`✅ [DASHBOARD PAGE] Dados recebidos:`, data)
      setDashboardData(data)

    } catch (error: any) {
      console.error('❌ [DASHBOARD PAGE] Erro ao buscar dados:', error)
      setError(error.message || 'Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = event.target.value
    console.log(`🔄 [DASHBOARD PAGE] Mudando período de ${selectedPeriod} para ${newPeriod}`)
    setSelectedPeriod(newPeriod)
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'last_7_days': return 'Últimos 7 dias'
      case 'last_30_days': return 'Últimos 30 dias'
      case 'last_90_days': return 'Últimos 90 dias'
      default: return 'Últimos 30 dias'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Bem-vindo ao painel administrativo do Grupo Central</p>
            </div>

            {/* FILTRO DE PERÍODO */}
            <div className="flex items-center gap-2">
              <label htmlFor="period-filter" className="text-sm font-medium text-gray-700">
                Período:
              </label>
              <select
                id="period-filter"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="last_7_days">Últimos 7 dias</option>
                <option value="last_30_days">Últimos 30 dias</option>
                <option value="last_90_days">Últimos 90 dias</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          <DashboardStats
            selectedPeriod={selectedPeriod}
            dashboardData={dashboardData}
            loading={loading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <InteractiveChart
                title={`Visitas e Cliques (${getPeriodLabel()})`}
                data={dashboardData?.chart_data || []}
                loading={loading}
              />
            </div>

            <div>
              <RecentProducts />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
