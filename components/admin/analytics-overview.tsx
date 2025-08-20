"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Users, ShoppingCart, Eye, MousePointerClick, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function AnalyticsOverview() {
  const [period, setPeriod] = useState("month")
  const [analyticsData, setAnalyticsData] = useState({
    visitors: 0,
    pageViews: 0,
    productClicks: 0,
    conversionRate: 0,
    totalProducts: 0,
    visitorsChange: "0%",
    pageViewsChange: "0%",
    productClicksChange: "0%",
    conversionRateChange: "0%",
    visitorsIncreasing: false,
    pageViewsIncreasing: false,
    productClicksIncreasing: false,
    conversionRateIncreasing: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true)
      try {
        // Calcular datas baseadas no período
        const now = new Date()
        let startDate = new Date()
        let previousStartDate = new Date()

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            previousStartDate.setDate(now.getDate() - 14)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            previousStartDate.setMonth(now.getMonth() - 2)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            previousStartDate.setFullYear(now.getFullYear() - 2)
            break
        }

        // Buscar dados do período atual
        const { data: currentData, error: currentError } = await supabase
          .from('analytics_events')
          .select('event_type, entity_type, entity_id, ip_address, session_id, metadata')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', now.toISOString())

        if (currentError) {
          console.warn('⚠️ [ANALYTICS OVERVIEW] Tabela analytics_events não encontrada, usando dados de exemplo')
          throw currentError
        }

        // Buscar dados do período anterior para comparação
        const { data: previousData, error: previousError } = await supabase
          .from('analytics_events')
          .select('event_type, entity_type, entity_id, ip_address, session_id, metadata')
          .gte('timestamp', previousStartDate.toISOString())
          .lt('timestamp', startDate.toISOString())

        if (previousError) {
          console.warn('⚠️ [ANALYTICS OVERVIEW] Erro ao buscar dados anteriores')
        }

        // Processar dados atuais (usar session_id como proxy para visitantes únicos)
        const currentVisitors = new Set(currentData?.map(d => d.session_id) || []).size
        const currentPageViews = currentData?.filter(d => d.event_type === 'page_view').length || 0
        const currentUnitClicks = currentData?.filter(d =>
          d.event_type === 'unit_click' ||
          (d.event_type === 'unit_action_click' && d.metadata && d.metadata.action_type === 'whatsapp')
        ).length || 0
        const currentProductViews = currentData?.filter(d => d.event_type === 'page_view' && d.entity_type === 'product').length || 0
        const currentConversionRate = currentProductViews > 0 ? (currentUnitClicks / currentProductViews) * 100 : 0

        // Processar dados anteriores
        const previousVisitors = new Set(previousData?.map(d => d.session_id) || []).size
        const previousPageViews = previousData?.filter(d => d.event_type === 'page_view').length || 0
        const previousUnitClicks = previousData?.filter(d =>
          d.event_type === 'unit_click' ||
          (d.event_type === 'unit_action_click' && d.metadata && d.metadata.action_type === 'whatsapp')
        ).length || 0
        const previousProductViews = previousData?.filter(d => d.event_type === 'page_view' && d.entity_type === 'product').length || 0
        const previousConversionRate = previousProductViews > 0 ? (previousUnitClicks / previousProductViews) * 100 : 0

        // Calcular mudanças percentuais
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? "+100%" : "0%"
          const change = ((current - previous) / previous) * 100
          return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
        }

        console.log('📊 [ANALYTICS OVERVIEW] Dados processados:', {
          currentVisitors,
          currentPageViews,
          currentUnitClicks,
          currentProductViews,
          currentConversionRate: currentConversionRate.toFixed(2)
        })

        // Buscar contagem de produtos
        let totalProducts = 0
        try {
          const productsResponse = await fetch('/api/products/count')
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            totalProducts = productsData.total_products || 0
            console.log('📦 [ANALYTICS OVERVIEW] Total de produtos:', totalProducts)
          }
        } catch (productsError) {
          console.error('❌ [ANALYTICS OVERVIEW] Erro ao buscar produtos:', productsError)
        }

        setAnalyticsData({
          visitors: currentVisitors,
          pageViews: currentPageViews,
          productClicks: currentUnitClicks,
          conversionRate: parseFloat(currentConversionRate.toFixed(1)),
          totalProducts: totalProducts,
          visitorsChange: calculateChange(currentVisitors, previousVisitors),
          pageViewsChange: calculateChange(currentPageViews, previousPageViews),
          productClicksChange: calculateChange(currentUnitClicks, previousUnitClicks),
          conversionRateChange: calculateChange(currentConversionRate, previousConversionRate),
          visitorsIncreasing: currentVisitors >= previousVisitors,
          pageViewsIncreasing: currentPageViews >= previousPageViews,
          productClicksIncreasing: currentUnitClicks >= previousUnitClicks,
          conversionRateIncreasing: currentConversionRate >= previousConversionRate,
        })
      } catch (error) {
        console.error("Erro ao buscar dados de analytics:", error)
        // Em caso de erro, zerar os dados para não mostrar informações falsas
        setAnalyticsData({
          visitors: 0,
          pageViews: 0,
          productClicks: 0,
          conversionRate: 0,
          totalProducts: 0,
          visitorsChange: "0%",
          pageViewsChange: "0%",
          productClicksChange: "0%",
          conversionRateChange: "0%",
          visitorsIncreasing: false,
          pageViewsIncreasing: false,
          productClicksIncreasing: false,
          conversionRateIncreasing: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [period, supabase])

  const stats = [
    {
      title: "Total de Produtos",
      value: analyticsData.totalProducts.toString(),
      change: "—", // Produtos não têm comparação temporal
      increasing: true,
      icon: Package,
      description: "Total de produtos cadastrados no sistema",
    },
    {
      title: "Visitantes Únicos",
      value: analyticsData.visitors.toString(),
      change: analyticsData.visitorsChange,
      increasing: analyticsData.visitorsIncreasing,
      icon: Users,
      description: `Comparado ao ${period === "week" ? "semana" : period === "month" ? "mês" : "ano"} anterior`,
    },
    {
      title: "Visualizações de Página",
      value: analyticsData.pageViews.toString(),
      change: analyticsData.pageViewsChange,
      increasing: analyticsData.pageViewsIncreasing,
      icon: Eye,
      description: `Comparado ao ${period === "week" ? "semana" : period === "month" ? "mês" : "ano"} anterior`,
    },
    {
      title: "Cliques em Unidades",
      value: analyticsData.productClicks.toString(),
      change: analyticsData.productClicksChange,
      increasing: analyticsData.productClicksIncreasing,
      icon: MousePointerClick,
      description: `Comparado ao ${period === "week" ? "semana" : period === "month" ? "mês" : "ano"} anterior`,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visão Geral</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="year">Último Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.change !== "—" ? (
                <div className={`flex items-center text-xs mt-1 ${stat.increasing ? "text-green-500" : "text-gray-400"}`}>
                  {stat.increasing ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              ) : (
                <div className="flex items-center text-xs mt-1 text-gray-400">
                  <span>Valor absoluto</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
