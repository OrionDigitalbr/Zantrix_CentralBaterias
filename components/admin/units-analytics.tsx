"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"
import { MapPin, Phone, MessageCircle, Eye, MousePointer, TrendingUp, Building2, Users } from "lucide-react"
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
  LineChart,
  Line,
} from "recharts"

interface Unit {
  id: string
  name: string
  address: string
  phone?: string
  whatsapp?: string
  active: boolean
}

interface UnitAnalytics {
  unit_id: string
  unit_name: string
  total_views: number
  total_clicks: number
  whatsapp_clicks: number
  conversion_rate: number
  trend: number
}

export function UnitsAnalytics() {
  const [units, setUnits] = useState<Unit[]>([])
  const [analytics, setAnalytics] = useState<UnitAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUnitsAnalytics()
  }, [timeRange])

  const fetchUnitsAnalytics = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Buscando dados reais das unidades...')

      // Buscar unidades reais do banco de dados
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .order('name')

      if (unitsError) {
        console.error('❌ Erro ao buscar unidades:', unitsError)
        throw unitsError
      }

      console.log('✅ Unidades encontradas:', unitsData?.length || 0)

      // Calcular período de análise
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))

      console.log('📅 Período de análise:', daysAgo.toISOString(), 'até', new Date().toISOString())

      // Buscar analytics reais por unidade
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', daysAgo.toISOString())

      if (analyticsError) {
        console.error('❌ Erro ao buscar analytics:', analyticsError)
        // Não falhar completamente, apenas logar o erro
      }

      console.log('📊 Eventos de analytics encontrados:', analyticsData?.length || 0)

      // Processar dados reais por unidade
      const unitAnalytics: UnitAnalytics[] = (unitsData || []).map(unit => {
        const unitEvents = analyticsData?.filter(event =>
          event.unit_id === unit.id ||
          (event.entity_type === 'unit' && event.entity_id === unit.id)
        ) || []

        const views = unitEvents.filter(e => e.event_type === 'page_view' || e.event_type === 'unit_view').length
        const clicks = unitEvents.filter(e =>
          e.event_type === 'unit_click' ||
          (e.event_type === 'unit_action_click' && e.metadata && e.metadata.action_type === 'whatsapp')
        ).length
        const whatsappClicks = unitEvents.filter(e =>
          e.event_type === 'unit_action_click' && e.metadata && e.metadata.action_type === 'whatsapp'
        ).length

        const conversionRate = views > 0 ? ((clicks / views) * 100) : 0

        // Calcular tendência comparando com período anterior
        const previousPeriod = new Date(daysAgo)
        previousPeriod.setDate(previousPeriod.getDate() - parseInt(timeRange))

        const previousEvents = analyticsData?.filter(event =>
          (event.unit_id === unit.id || (event.entity_type === 'unit' && event.entity_id === unit.id)) &&
          new Date(event.timestamp || event.created_at) >= previousPeriod &&
          new Date(event.timestamp || event.created_at) < daysAgo
        ) || []

        const previousViews = previousEvents.filter(e => e.event_type === 'page_view' || e.event_type === 'unit_view').length
        const trend = previousViews > 0 ? (((views - previousViews) / previousViews) * 100) : 0

        return {
          unit_id: unit.id,
          unit_name: unit.name,
          total_views: views,
          total_clicks: clicks,
          whatsapp_clicks: whatsappClicks,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          trend: Math.round(trend * 100) / 100
        }
      })

      setUnits(unitsData || [])
      setAnalytics(unitAnalytics)

      console.log('✅ Dados reais processados:', {
        unidades: unitsData?.length || 0,
        analytics: unitAnalytics.length,
        totalEventos: analyticsData?.length || 0
      })

    } catch (error) {
      console.error('❌ Erro ao buscar dados das unidades:', error)

      // Em caso de erro, mostrar mensagem informativa em vez de dados mockados
      setUnits([])
      setAnalytics([])

      // Mostrar toast de erro se disponível
      if (typeof window !== 'undefined') {
        console.log('⚠️ Exibindo dados vazios devido ao erro. Verifique a conexão com o banco de dados.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Dados para gráficos
  const chartData = analytics.map(unit => ({
    name: unit.unit_name.length > 10 ? unit.unit_name.substring(0, 10) + '...' : unit.unit_name,
    views: unit.total_views,
    clicks: unit.total_clicks,
    whatsapp: unit.whatsapp_clicks,
    conversion: parseFloat(unit.conversion_rate.toFixed(1))
  }))

  const pieData = analytics.map((unit, index) => ({
    name: unit.unit_name,
    value: unit.total_views,
    color: ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#95E1D3'][index % 5]
  }))

  const totalViews = analytics.reduce((sum, unit) => sum + unit.total_views, 0)
  const totalClicks = analytics.reduce((sum, unit) => sum + unit.total_clicks, 0)
  const totalWhatsApp = analytics.reduce((sum, unit) => sum + unit.whatsapp_clicks, 0)
  const avgConversion = analytics.length > 0
    ? analytics.reduce((sum, unit) => sum + unit.conversion_rate, 0) / analytics.length
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics das unidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Análise por Unidades</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Todas as unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Interações gerais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWhatsApp.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Contatos diretos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Taxa de conversão</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Performance por Unidade */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Unidade</CardTitle>
            <CardDescription>Visualizações, cliques e WhatsApp por unidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Carregando dados das unidades...</p>
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Visualizações" fill="#4ECDC4" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="clicks" name="Cliques" fill="#FF6B6B" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="whatsapp" name="WhatsApp" fill="#95E1D3" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-gray-500 font-medium">Dados insuficientes para este período</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Nenhum evento de analytics registrado para as unidades nos últimos {timeRange} dias
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Visualizações */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Visualizações</CardTitle>
            <CardDescription>Participação de cada unidade no total de visualizações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Carregando distribuição...</p>
                  </div>
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} visualizações`, "Quantidade"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">🥧</div>
                    <p className="text-gray-500 font-medium">Dados insuficientes para distribuição</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Nenhuma visualização registrada para calcular a distribuição por unidade
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Unidade</CardTitle>
          <CardDescription>Métricas detalhadas de cada unidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Unidade</th>
                  <th className="text-right p-2">Visualizações</th>
                  <th className="text-right p-2">Cliques</th>
                  <th className="text-right p-2">WhatsApp</th>
                  <th className="text-right p-2">Conversão</th>
                  <th className="text-right p-2">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((unit) => (
                  <tr key={unit.unit_id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{unit.unit_name}</div>
                          <div className="text-xs text-gray-500">
                            {units.find(u => u.id === unit.unit_id)?.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-2 font-medium">{unit.total_views.toLocaleString()}</td>
                    <td className="text-right p-2">{unit.total_clicks.toLocaleString()}</td>
                    <td className="text-right p-2 text-green-600">{unit.whatsapp_clicks.toLocaleString()}</td>
                    <td className="text-right p-2">{unit.conversion_rate.toFixed(1)}%</td>
                    <td className="text-right p-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        unit.trend >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unit.trend >= 0 ? '+' : ''}{unit.trend.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
