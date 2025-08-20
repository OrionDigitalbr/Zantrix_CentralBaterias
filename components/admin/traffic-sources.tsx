"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function TrafficSources() {
  const [period, setPeriod] = useState("month")
  const [chartType, setChartType] = useState("pie")
  const [hasData, setHasData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dataCollectionStarted, setDataCollectionStarted] = useState<Date | null>(null)
  const supabase = createClientComponentClient()

  // Dados vazios para quando não há dados suficientes
  const emptyData = {
    sources: [{ name: "Sem dados", value: 100, color: "#e5e7eb" }],
    referrers: [{ name: "Sem dados", value: 100, color: "#e5e7eb" }],
    devices: [{ name: "Sem dados", value: 100, color: "#e5e7eb" }],
  }

  const [sourcesData, setSourcesData] = useState(emptyData)

  useEffect(() => {
    async function fetchTrafficData() {
      setIsLoading(true)
      try {
        // Calcular período baseado na seleção
        const now = new Date()
        let startDate = new Date()

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }

        // Buscar dados de analytics
        const { data: analyticsData, error } = await supabase
          .from('analytics')
          .select('referrer, user_agent, device_type, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', now.toISOString())

        if (error) throw error

        if (!analyticsData || analyticsData.length === 0) {
          setHasData(false)
        } else {
          // Processar dados reais
          const processedData = processAnalyticsData(analyticsData)
          setSourcesData(processedData)
          setHasData(true)
          setDataCollectionStarted(new Date(analyticsData[0]?.created_at || Date.now()))
        }

      } catch (error) {
        console.error("Erro ao buscar dados de tráfego:", error)
        setHasData(false)
        setSourcesData(emptyData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrafficData()
  }, [period, supabase])

  // Função para processar dados reais de analytics
  const processAnalyticsData = (data: any[]) => {
    // Processar referrers
    const referrerCounts = data.reduce((acc, item) => {
      let source = 'Direto'
      if (item.referrer && item.referrer !== 'unknown') {
        if (item.referrer.includes('google')) source = 'Google'
        else if (item.referrer.includes('facebook')) source = 'Facebook'
        else if (item.referrer.includes('instagram')) source = 'Instagram'
        else if (item.referrer.includes('whatsapp')) source = 'WhatsApp'
        else source = 'Outros'
      }
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    // Processar dispositivos
    const deviceCounts = data.reduce((acc, item) => {
      const device = item.device_type || 'desktop'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    const total = data.length

    // Converter para formato de porcentagem
    const referrers = Object.entries(referrerCounts).map(([name, count]: [string, any]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: getColorForSource(name)
    }))

    const devices = Object.entries(deviceCounts).map(([name, count]: [string, any]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / total) * 100),
      color: getColorForDevice(name)
    }))

    // Fontes baseadas nos referrers
    const sources = [
      { name: "Busca Orgânica", value: referrers.find(r => r.name === 'Google')?.value || 0, color: "#3B82F6" },
      { name: "Redes Sociais", value: (referrers.find(r => r.name === 'Facebook')?.value || 0) + (referrers.find(r => r.name === 'Instagram')?.value || 0), color: "#F59E0B" },
      { name: "Direto", value: referrers.find(r => r.name === 'Direto')?.value || 0, color: "#10B981" },
      { name: "Outros", value: referrers.find(r => r.name === 'Outros')?.value || 0, color: "#6B7280" }
    ].filter(s => s.value > 0)

    return { sources, referrers, devices }
  }

  const getColorForSource = (source: string) => {
    const colors: { [key: string]: string } = {
      'Google': '#3B82F6',
      'Facebook': '#1877F2',
      'Instagram': '#E4405F',
      'WhatsApp': '#25D366',
      'Direto': '#10B981',
      'Outros': '#6B7280'
    }
    return colors[source] || '#6B7280'
  }

  const getColorForDevice = (device: string) => {
    const colors: { [key: string]: string } = {
      'mobile': '#10B981',
      'desktop': '#3B82F6',
      'tablet': '#F59E0B'
    }
    return colors[device] || '#6B7280'
  }

  // Função para renderizar o gráfico de pizza SVG
  const renderPieChart = (data: any[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercent = 0

    return (
      <div className="relative h-64 w-64 mx-auto">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {data.map((item, i) => {
            // Converter para porcentagem
            const percent = (item.value / total) * 100

            // Calcular ângulos para o arco
            const startAngle = (cumulativePercent / 100) * 360
            cumulativePercent += percent
            const endAngle = (cumulativePercent / 100) * 360

            // Converter para radianos
            const startRad = ((startAngle - 90) * Math.PI) / 180
            const endRad = ((endAngle - 90) * Math.PI) / 180

            // Calcular pontos do arco
            const x1 = 50 + 40 * Math.cos(startRad)
            const y1 = 50 + 40 * Math.sin(startRad)
            const x2 = 50 + 40 * Math.cos(endRad)
            const y2 = 50 + 40 * Math.sin(endRad)

            // Determinar se o arco é maior que 180 graus
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

            // Criar o caminho do arco
            const d = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

            return <path key={i} d={d} fill={item.color} stroke="#fff" strokeWidth="0.5" />
          })}
        </svg>
      </div>
    )
  }

  // Função para renderizar o gráfico de barras
  const renderBarChart = (data: any[]) => {
    const maxValue = Math.max(...data.map((item) => item.value))
    const barHeight = 24
    const gap = 12
    const totalHeight = data.length * (barHeight + gap)

    return (
      <div className="relative h-64 w-full mx-auto">
        <svg viewBox={`0 0 100 ${totalHeight}`} className="h-full w-full">
          {data.map((item, i) => {
            const width = (item.value / maxValue) * 80
            const y = i * (barHeight + gap)

            return (
              <g key={i}>
                <rect x="0" y={y} width={width} height={barHeight} fill={item.color} rx="2" />
                <text x={width + 2} y={y + barHeight / 2} dominantBaseline="middle" fontSize="3" fill="#333">
                  {item.name} ({item.value}%)
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Função para renderizar a legenda
  const renderLegend = (data: any[]) => {
    return (
      <div className="mt-4 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: item.color }} />
            <span className="text-sm">{item.name}</span>
            <span className="ml-auto text-sm font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    )
  }

  const handleExportData = () => {
    toast({
      title: "Exportando dados",
      description: "Os dados serão exportados em formato CSV.",
    })
  }

  // Renderizar mensagem quando não há dados suficientes
  const renderNoDataMessage = () => {
    const hoursLeft = dataCollectionStarted
      ? Math.max(0, 48 - (new Date().getTime() - dataCollectionStarted.getTime()) / (1000 * 60 * 60))
      : 48

    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Dados insuficientes</h3>
        <p className="text-gray-500 max-w-md mb-2">
          É necessário pelo menos 48 horas de coleta de dados para gerar estatísticas precisas de tráfego.
        </p>
        {dataCollectionStarted && (
          <p className="text-sm text-gray-400">
            Aproximadamente {Math.ceil(hoursLeft)} horas restantes para ter dados suficientes.
          </p>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Fontes de Tráfego</CardTitle>
            <CardDescription>Análise das principais fontes de tráfego do site</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tipo de Gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pizza</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleExportData} disabled={!hasData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : !hasData ? (
          renderNoDataMessage()
        ) : (
          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sources">Fontes</TabsTrigger>
              <TabsTrigger value="referrers">Referências</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {chartType === "pie" ? renderPieChart(sourcesData.sources) : renderBarChart(sourcesData.sources)}
                </div>
                <div>{renderLegend(sourcesData.sources)}</div>
              </div>
            </TabsContent>

            <TabsContent value="referrers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {chartType === "pie" ? renderPieChart(sourcesData.referrers) : renderBarChart(sourcesData.referrers)}
                </div>
                <div>{renderLegend(sourcesData.referrers)}</div>
              </div>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {chartType === "pie" ? renderPieChart(sourcesData.devices) : renderBarChart(sourcesData.devices)}
                </div>
                <div>{renderLegend(sourcesData.devices)}</div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
