"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, BarChart3, MousePointer, ShoppingCart, Store, Loader2, Download } from "lucide-react"
import { Chart } from "@/components/ui/chart"
import { createClientSupabaseClient } from "@/lib/supabase"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ProductAnalyticsProps {
  productId: string
}

interface ProductData {
  id: string
  name: string
  sku: string
  category: string
  price: number
  totalViews: number
  totalClicks: number
  conversionRate: number
  viewsChange: number
  clicksChange: number
  conversionChange: number
}

interface AnalyticsEvent {
  id: string
  event_type: string
  entity_type: string
  entity_id: string
  created_at: string
}

export function ProductAnalytics({ productId }: ProductAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [viewsData, setViewsData] = useState<any[]>([])
  const [unitClicksData, setUnitClicksData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    async function fetchProductAnalytics() {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientSupabaseClient()

        // Buscar dados do produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            price,
            category:categories(name)
          `)
          .eq('id', productId)
          .single()

        if (productError) {
          throw new Error(`Produto não encontrado: ${productError.message}`)
        }

        // Calcular período baseado no timeRange
        const currentDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case 'week':
            startDate.setDate(currentDate.getDate() - 7)
            break
          case 'month':
            startDate.setDate(currentDate.getDate() - 30)
            break
          case 'quarter':
            startDate.setDate(currentDate.getDate() - 90)
            break
          default:
            startDate.setDate(currentDate.getDate() - 30)
        }

        // Buscar analytics do produto
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics')
          .select('*')
          .eq('entity_type', 'product')
          .eq('entity_id', productId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (analyticsError) {
          console.error('Erro ao buscar analytics:', analyticsError)
        }

        // Processar dados de analytics
        const views = analytics?.filter(a => a.event_type === 'product_view') || []
        const clicks = analytics?.filter(a => a.event_type === 'product_click') || []

        const totalViews = views.length
        const totalClicks = clicks.length
        const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

        // Calcular mudanças (comparar com período anterior)
        const previousStartDate = new Date(startDate)
        const timeDiff = currentDate.getTime() - startDate.getTime()
        previousStartDate.setTime(previousStartDate.getTime() - timeDiff)

        const { data: previousAnalytics } = await supabase
          .from('analytics')
          .select('*')
          .eq('entity_type', 'product')
          .eq('entity_id', productId)
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString())

        const previousViews = previousAnalytics?.filter(a => a.event_type === 'product_view').length || 0
        const previousClicks = previousAnalytics?.filter(a => a.event_type === 'product_click').length || 0
        const previousConversionRate = previousViews > 0 ? (previousClicks / previousViews) * 100 : 0

        const viewsChange = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : (totalViews > 0 ? 100 : 0)
        const clicksChange = previousClicks > 0 ? ((totalClicks - previousClicks) / previousClicks) * 100 : (totalClicks > 0 ? 100 : 0)
        const conversionChange = previousConversionRate > 0 ? conversionRate - previousConversionRate : (conversionRate > 0 ? 100 : 0)

        setProductData({
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id}`,
          category: (product.category as any)?.name || 'Sem categoria',
          price: product.price || 0,
          totalViews,
          totalClicks,
          conversionRate: Math.min(100, parseFloat(conversionRate.toFixed(1))),
          viewsChange: Math.min(999, parseFloat(viewsChange.toFixed(1))),
          clicksChange: Math.min(999, parseFloat(clicksChange.toFixed(1))),
          conversionChange: Math.min(100, parseFloat(conversionChange.toFixed(1)))
        })

        // Processar dados por dia para o gráfico
        const dailyData = new Map()
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          })
          dailyData.set(dateStr, {
            name: dateStr,
            views: 0,
            clicks: 0
          })
        }

        analytics?.forEach(event => {
          const date = new Date(event.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          })

          if (dailyData.has(date)) {
            const dayData = dailyData.get(date)
            if (event.event_type === 'product_view') dayData.views++
            if (event.event_type === 'product_click') dayData.clicks++
          }
        })

        setViewsData(Array.from(dailyData.values()))

        // Processar cliques por unidade
        const unitClicks: { [key: string]: number } = {}
        clicks.forEach((click: any) => {
          const unitName = click.metadata?.unit_name || 'Desconhecida'
          unitClicks[unitName] = (unitClicks[unitName] || 0) + 1
        })

        const unitData = Object.entries(unitClicks).map(([name, value], index) => ({
          name,
          value,
          fill: `hsl(var(--chart-${(index % 5) + 1}))`
        }))

        setUnitClicksData(unitData)

      } catch (err) {
        console.error('Erro ao buscar analytics:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductAnalytics()
  }, [productId, timeRange])

  const exportToPDF = async () => {
    if (!productData) {
      console.error('❌ Dados do produto não disponíveis para PDF')
      return
    }

    setIsExporting(true)
    console.log('🚀 Iniciando geração de PDF do produto:', productData.name)

    try {
      console.log('📄 Criando instância do jsPDF...')
      const pdf = new jsPDF('p', 'mm', 'a4')
      console.log('✅ jsPDF criado com sucesso')

      // Configurações de cores executivas
      const colors = {
        primary: '#1E40AF',
        secondary: '#1F2937',
        accent: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        light: '#F8FAFC',
        lighter: '#F1F5F9',
        text: '#1F2937',
        muted: '#6B7280',
        border: '#E2E8F0'
      }

      // CAPA EXECUTIVA DO PRODUTO
      pdf.setFillColor(colors.primary)
      pdf.rect(0, 0, 210, 80, 'F')

      // Gradiente simulado
      pdf.setFillColor('#2563EB')
      pdf.rect(0, 0, 210, 40, 'F')
      pdf.setFillColor(colors.primary)
      pdf.rect(0, 40, 210, 40, 'F')

      // Logo executivo central
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(85, 20, 40, 30, 5, 5, 'F')
      pdf.setTextColor(colors.primary)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('GRUPO', 105, 32, { align: 'center' })
      pdf.text('CENTRAL', 105, 40, { align: 'center' })
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text('PRODUCT ANALYTICS', 105, 46, { align: 'center' })

      // Título principal da capa
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ANÁLISE DE PRODUTO', 105, 100, { align: 'center' })

      // Nome do produto
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(productData.name, 105, 115, { align: 'center' })

      // Data da capa
      const reportDate = new Date()
      const dateStr = reportDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      pdf.setFontSize(12)
      pdf.text(dateStr, 105, 130, { align: 'center' })

      // Linha decorativa
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(2)
      pdf.line(60, 140, 150, 140)

      // Informações adicionais na capa
      pdf.setFontSize(10)
      pdf.text('Confidencial - Uso Interno', 105, 250, { align: 'center' })
      pdf.text('www.grupocentral.com.br', 105, 260, { align: 'center' })

      // PÁGINA 2 - DETALHES DO PRODUTO
      pdf.addPage()

      // Cabeçalho da página
      pdf.setFillColor(colors.primary)
      pdf.rect(0, 0, 210, 30, 'F')

      // Logo menor
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(15, 6, 25, 18, 3, 3, 'F')
      pdf.setTextColor(colors.primary)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('GRUPO', 27.5, 13, { align: 'center' })
      pdf.text('CENTRAL', 27.5, 18, { align: 'center' })

      // Título da página
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Detalhes do Produto', 45, 17)

      // Data no canto direito
      const headerDate = new Date()
      const headerDateStr = headerDate.toLocaleDateString('pt-BR')
      const headerTimeStr = headerDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      pdf.setFontSize(9)
      pdf.text(`${headerDateStr} ${headerTimeStr}`, 195, 17, { align: 'right' })

      // Linha decorativa
      pdf.setDrawColor(255, 255, 255)
      pdf.setLineWidth(1)
      pdf.line(15, 32, 195, 32)

      // Informações do produto com design executivo
      pdf.setFillColor(colors.lighter)
      pdf.roundedRect(20, 45, 170, 60, 4, 4, 'F')

      pdf.setTextColor(colors.text)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Informações do Produto', 25, 60)

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Produto: ${productData.name}`, 25, 75)
      pdf.text(`SKU: ${productData.sku}`, 25, 85)
      pdf.text(`Categoria: ${productData.category}`, 25, 95)
      pdf.text(`Preço: R$ ${productData.price.toFixed(2).replace(".", ",")}`, 25, 105)

      // Cards de estatísticas executivos
      const statsY = 120
      const cardWidth = 50
      const cardHeight = 40

      // Card 1 - Visualizações
      pdf.setFillColor(colors.accent)
      pdf.roundedRect(20, statsY, cardWidth, cardHeight, 4, 4, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('VISUALIZAÇÕES', 25, statsY + 12)
      pdf.setFontSize(20)
      pdf.text(`${productData.totalViews}`, 25, statsY + 25)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${productData.viewsChange >= 0 ? '+' : ''}${productData.viewsChange}%`, 25, statsY + 32)

      // Card 2 - Cliques
      pdf.setFillColor(colors.success)
      pdf.roundedRect(80, statsY, cardWidth, cardHeight, 4, 4, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CLIQUES', 85, statsY + 12)
      pdf.setFontSize(20)
      pdf.text(`${productData.totalClicks}`, 85, statsY + 25)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${productData.clicksChange >= 0 ? '+' : ''}${productData.clicksChange}%`, 85, statsY + 32)

      // Card 3 - Conversão
      pdf.setFillColor(colors.warning)
      pdf.roundedRect(140, statsY, cardWidth, cardHeight, 4, 4, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('CONVERSÃO', 145, statsY + 12)
      pdf.setFontSize(20)
      pdf.text(`${productData.conversionRate}%`, 145, statsY + 25)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${productData.conversionChange >= 0 ? '+' : ''}${productData.conversionChange}%`, 145, statsY + 32)

      // Insights executivos
      pdf.setFillColor(colors.lighter)
      pdf.roundedRect(20, 180, 170, 60, 4, 4, 'F')
      pdf.setTextColor(colors.text)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Insights Executivos:', 25, 195)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)

      const conversionRate = productData.conversionRate
      let insight1 = '• Performance dentro da média esperada'
      let insight2 = '• Oportunidade de otimização identificada'
      let insight3 = '• Recomenda-se monitoramento contínuo'

      if (conversionRate > 15) {
        insight1 = '• Excelente performance de conversão'
        insight2 = '• Produto de alto engajamento'
        insight3 = '• Modelo de sucesso para replicação'
      } else if (conversionRate > 8) {
        insight1 = '• Boa performance de conversão'
        insight2 = '• Potencial para crescimento'
        insight3 = '• Considerar estratégias de otimização'
      }

      pdf.text(insight1, 25, 210)
      pdf.text(insight2, 25, 220)
      pdf.text(insight3, 25, 230)

      // Rodapé executivo
      pdf.setDrawColor(colors.border)
      pdf.setLineWidth(0.8)
      pdf.line(15, 275, 195, 275)

      pdf.setFillColor(colors.lighter)
      pdf.rect(15, 277, 180, 20, 'F')

      pdf.setTextColor(colors.muted)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')

      const footerDate = new Date()
      const footerDateStr = footerDate.toLocaleDateString('pt-BR')
      const footerTimeStr = footerDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      pdf.text(`Relatório gerado em ${footerDateStr} às ${footerTimeStr}`, 20, 285)
      pdf.text('Grupo Central Product Analytics', 20, 290)
      pdf.text('www.grupocentral.com.br', 195, 285, { align: 'right' })
      pdf.text('Confidencial - Uso Interno', 195, 290, { align: 'right' })

      console.log('💾 Finalizando PDF do produto...')

      // Salvar PDF executivo
      const fileName = `Grupo-Central-Produto-${productData.sku}-${footerDate.toISOString().split('T')[0]}.pdf`

      console.log('📁 Salvando arquivo do produto:', fileName)
      pdf.save(fileName)

      console.log('✅ PDF do produto gerado com sucesso!')

    } catch (error) {
      console.error('❌ Erro detalhado ao gerar PDF do produto:', error)
      if (error instanceof Error) {
        console.error('❌ Stack trace:', error.stack)
      }

      let errorMessage = 'Erro desconhecido ao gerar relatório do produto'
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`
        console.error('❌ Stack trace:', error.stack)
      }

      alert(`Falha na geração do PDF: ${errorMessage}. Verifique o console para mais detalhes.`)
    } finally {
      console.log('🔄 Finalizando processo de exportação do produto...')
      setIsExporting(false)
    }
  }

  const [deviceData, setDeviceData] = useState<any[]>([])
  const [trafficSourceData, setTrafficSourceData] = useState<any[]>([])

  useEffect(() => {
    // Processar dados de dispositivo e tráfego quando productData for carregado
    if (productData) {
      const processDeviceAndTrafficData = async () => {
        const supabase = createClientSupabaseClient()
        const { data: analytics } = await supabase
          .from('analytics')
          .select('device_type, referrer')
          .eq('entity_type', 'product')
          .eq('entity_id', productId)

        // Processar dispositivos
        const deviceCounts: { [key: string]: number } = {}
        analytics?.forEach((event: any) => {
          const device = event.device_type || 'Desconhecido'
          deviceCounts[device] = (deviceCounts[device] || 0) + 1
        })
        const deviceChartData = Object.entries(deviceCounts).map(([name, value], index) => ({
          name,
          value,
          fill: `hsl(var(--chart-${(index % 3) + 1}))`
        }))
        setDeviceData(deviceChartData)

        // Processar fontes de tráfego
        const trafficCounts: { [key: string]: number } = {}
        analytics?.forEach((event: any) => {
          let source = 'Direto'
          if (event.referrer && event.referrer !== 'unknown') {
            if (event.referrer.includes('google')) source = 'Busca Orgânica'
            else if (event.referrer.includes('facebook') || event.referrer.includes('instagram')) source = 'Redes Sociais'
            else source = 'Referência'
          }
          trafficCounts[source] = (trafficCounts[source] || 0) + 1
        })
        const trafficChartData = Object.entries(trafficCounts).map(([name, value], index) => ({
          name,
          value,
          fill: `hsl(var(--chart-${(index % 4) + 1}))`
        }))
        setTrafficSourceData(trafficChartData)
      }
      processDeviceAndTrafficData()
    }
  }, [productData, productId])

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando analytics do produto...</p>
        </div>
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar analytics</h3>
        <p className="text-destructive/80">{error}</p>
      </div>
    )
  }

  // Se não há dados do produto
  if (!productData) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Produto não encontrado</h3>
        <p className="text-yellow-700 dark:text-yellow-500">Não foi possível encontrar dados para este produto.</p>
      </div>
    )
  }

  // Filtrar dados com base no intervalo de tempo selecionado
  const filteredViewsData = timeRange === "week" ? viewsData.slice(-7) : viewsData

  return (
    <div className="space-y-6">
      {/* Informações do produto */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">{productData.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">SKU: {productData.sku}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Categoria: {productData.category}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Preço: R$ {productData.price.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="bg-background border border-input rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="quarter">Último trimestre</option>
            </select>

            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {isExporting ? 'Gerando Relatório...' : 'Exportar Relatório Executivo'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-border">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Visão Geral
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "units"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("units")}
          >
            Unidades
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "devices"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("devices")}
          >
            Dispositivos
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "sources"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("sources")}
          >
            Fontes de Tráfego
          </button>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <h3 className="text-2xl font-bold mt-1">{productData.totalViews}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <MousePointer className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${productData.viewsChange >= 0 ? "text-green-500" : "text-destructive"}`}
              >
                {productData.viewsChange >= 0 ? (
                  <ArrowUpRight className="inline h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="inline h-4 w-4 mr-1" />
                )}
                {Math.abs(productData.viewsChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs. período anterior</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cliques</p>
                <h3 className="text-2xl font-bold mt-1">{productData.totalClicks}</h3>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${productData.clicksChange >= 0 ? "text-green-500" : "text-destructive"}`}
              >
                {productData.clicksChange >= 0 ? (
                  <ArrowUpRight className="inline h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="inline h-4 w-4 mr-1" />
                )}
                {Math.abs(productData.clicksChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs. período anterior</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <h3 className="text-2xl font-bold mt-1">{productData.conversionRate}%</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  productData.conversionChange >= 0 ? "text-green-500" : "text-destructive"
                }`}
              >
                {productData.conversionChange >= 0 ? (
                  <ArrowUpRight className="inline h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="inline h-4 w-4 mr-1" />
                )}
                {Math.abs(productData.conversionChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs. período anterior</span>
            </div>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === "overview" && (
          <div className="h-80">
            <h3 className="text-lg font-semibold mb-4">Visualizações e Cliques</h3>
            <Chart>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredViewsData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" name="Visualizações" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="Cliques" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Chart>
          </div>
        )}

        {activeTab === "units" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cliques por Unidade</h3>
              <div className="h-64">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={unitClicksData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {unitClicksData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} cliques`, "Quantidade"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </Chart>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes por Unidade</h3>
              <div className="space-y-4">
                {unitClicksData.map((unit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: unit.fill }}></div>
                      <span className="text-sm font-medium">{unit.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-semibold">{unit.value} cliques</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cliques por Dispositivo</h3>
              <div className="h-64">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Porcentagem"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </Chart>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes por Dispositivo</h3>
              <div className="space-y-4">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: device.fill }}></div>
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">{device.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Fontes de Tráfego</h3>
              <div className="h-64">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Porcentagem"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </Chart>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhes por Fonte</h3>
              <div className="space-y-4">
                {trafficSourceData.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: source.fill }}></div>
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">{source.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
