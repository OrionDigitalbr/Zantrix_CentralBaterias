"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, BarChart3, LineChart, TrendingUp, Calendar, Download, Eye, MousePointer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DashboardCharts() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewsData, setViewsData] = useState<any[]>([])
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30")
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; data: any }>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Buscar dados de visualizações baseado no timeRange selecionado
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))

        const { data, error } = await supabase
          .from("analytics")
          .select("created_at, event_type, entity_type")
          .gte("created_at", daysAgo.toISOString())
          .order("created_at")

        if (error) throw error

        // Processar dados para o gráfico
        const processedData = processAnalyticsData(data || [])
        setViewsData(processedData)
      } catch (err) {
        console.error("Erro ao buscar dados de análise:", err)
        setError("Falha ao carregar dados de análise. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, timeRange])

  // Função para processar dados de análise
  const processAnalyticsData = (data: any[]) => {
    // Agrupar dados por dia
    const groupedByDay: Record<string, { views: number; clicks: number }> = {}

    data.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0]

      if (!groupedByDay[date]) {
        groupedByDay[date] = { views: 0, clicks: 0 }
      }

      if (item.event_type === "page_view" || item.event_type === "product_view") {
        groupedByDay[date].views++
      } else if (item.event_type === "product_click" || item.event_type === "click") {
        groupedByDay[date].clicks++
      }
    })

    // Converter para array para o gráfico
    return Object.entries(groupedByDay).map(([date, counts]) => ({
      date,
      formattedDate: new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }),
      views: counts.views,
      clicks: counts.clicks,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Função para lidar com mouse over nos pontos do gráfico
  const handleMouseOver = (event: React.MouseEvent, data: any, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      data: { ...data, index }
    })
  }

  const handleMouseOut = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null })
  }

  // Função para exportar dados
  const exportData = () => {
    const csvContent = [
      ['Data', 'Visualizações', 'Cliques'],
      ...viewsData.map(d => [d.formattedDate, d.views, d.clicks])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}dias.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-80 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-500">Carregando dados...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Se não houver dados, mostrar mensagem
  if (viewsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visitas e Cliques (Últimos {timeRange} dias)
          </CardTitle>
          <CardDescription>
            Acompanhe o desempenho de visualizações e cliques do seu site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Nenhum dado de análise disponível ainda.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Visitas e Cliques (Últimos {timeRange} dias)
          </h2>
          <p className="text-sm text-gray-600">
            Acompanhe o desempenho de visualizações e cliques do seu site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "7" | "30" | "90")}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
          <button
            onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Alternar tipo de gráfico"
          >
            {chartType === "line" ? <BarChart3 className="h-4 w-4" /> : <LineChart className="h-4 w-4" />}
          </button>
          <button
            onClick={exportData}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Exportar dados"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-64 relative">
        {/* Renderizar gráfico SVG com os dados reais */}
        <svg className="w-full h-full" viewBox="0 0 1000 300">
          {/* Eixos */}
          <line x1="50" y1="250" x2="950" y2="250" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="2" />

          {/* Linhas do gráfico */}
          {viewsData.length > 0 && (
            <>
              {/* Linha de visualizações */}
              <polyline
                points={viewsData
                  .map((d, i) => {
                    const x = 50 + i * (900 / (viewsData.length - 1 || 1))
                    const y = 250 - (d.views * 200) / Math.max(...viewsData.map((d) => d.views || 1))
                    return `${x},${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Linha de cliques */}
              <polyline
                points={viewsData
                  .map((d, i) => {
                    const x = 50 + i * (900 / (viewsData.length - 1 || 1))
                    const y = 250 - (d.clicks * 200) / Math.max(...viewsData.map((d) => d.clicks || 1))
                    return `${x},${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />

              {/* Pontos de dados */}
              {viewsData.map((d, i) => {
                const x = 50 + i * (900 / (viewsData.length - 1 || 1))
                const yViews = 250 - (d.views * 200) / Math.max(...viewsData.map((d) => d.views || 1))
                const yClicks = 250 - (d.clicks * 200) / Math.max(...viewsData.map((d) => d.clicks || 1))

                return (
                  <g key={i}>
                    <circle cx={x} cy={yViews} r="4" fill="#3b82f6" />
                    <circle cx={x} cy={yClicks} r="4" fill="#ef4444" />
                  </g>
                )
              })}
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex items-center mr-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Visualizações</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Cliques</span>
        </div>
      </div>
    </div>
  )
}
