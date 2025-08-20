"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function ProductsAnalytics() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("views")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Buscar dados de analytics de produtos da nova API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        console.log('📊 [PRODUCTS ANALYTICS] Buscando dados de produtos...')

        // Buscar dados da nova API de analytics de produtos
        const response = await fetch('/api/admin/analytics/products?days=30')

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        console.log('📊 [PRODUCTS ANALYTICS] Dados recebidos:', result)

        if (result.success && result.data) {
          // Processar dados reais da API
          const { totalProducts, mostViewedProducts, categoryAnalytics } = result.data

          // Mapear produtos mais visualizados
          const productsWithAnalytics = mostViewedProducts.map((product: any) => ({
            id: product.product_info.id,
            name: product.product_info.name,
            category: categoryAnalytics.find((cat: any) => cat.category_id === product.product_info.category_id)?.category_name || 'Sem categoria',
            views: product.views,
            clicks: product.clicks,
            ctr: product.views > 0 ? Math.round((product.clicks / product.views) * 100 * 100) / 100 : 0,
            topUnit: product.top_unit?.name || "N/A",
          }))

          // Mapear dados de categorias para o gráfico
          const categoryAnalyticsArray = categoryAnalytics.map((category: any) => ({
            name: category.category_name,
            views: category.total_views,
            clicks: category.total_clicks,
          }))

          console.log('📊 [PRODUCTS ANALYTICS] Produtos processados:', productsWithAnalytics.length)
          console.log('📊 [PRODUCTS ANALYTICS] Categorias processadas:', categoryAnalyticsArray.length)

          setProducts(productsWithAnalytics)
          setCategories(categoryAnalyticsArray)
        } else {
          throw new Error('Dados inválidos recebidos da API')
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setProducts([])
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar produtos com base no termo de busca
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.topUnit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const fieldA = a[sortField as keyof typeof a]
    const fieldB = b[sortField as keyof typeof b]

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    } else {
      return sortDirection === "asc" ? Number(fieldA) - Number(fieldB) : Number(fieldB) - Number(fieldA)
    }
  })

  // Função para alternar a ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Análise por Categoria</CardTitle>
          <CardDescription>Visualizações e cliques por categoria de produto</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="views" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="clicks" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <p className="text-gray-500 mb-2">Nenhuma categoria com dados de visualização.</p>
              <p className="text-sm text-gray-400">
                Os dados de visualizações e cliques por categoria aparecerão aqui quando houver informações suficientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Produtos</CardTitle>
          <CardDescription>Análise detalhada de visualizações e cliques por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSort("name")} className="p-0 h-auto font-medium">
                        Produto
                        {sortField === "name" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSort("category")} className="p-0 h-auto font-medium">
                        Categoria
                        {sortField === "category" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("views")}
                        className="p-0 h-auto font-medium ml-auto"
                      >
                        Visualizações
                        {sortField === "views" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("clicks")}
                        className="p-0 h-auto font-medium ml-auto"
                      >
                        Cliques
                        {sortField === "clicks" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("ctr")}
                        className="p-0 h-auto font-medium ml-auto"
                      >
                        CTR
                        {sortField === "ctr" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSort("topUnit")} className="p-0 h-auto font-medium">
                        Unidade + Cliques
                        {sortField === "topUnit" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.views}</TableCell>
                        <TableCell className="text-right">{product.clicks}</TableCell>
                        <TableCell className="text-right">{product.ctr}%</TableCell>
                        <TableCell>{product.topUnit}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/products/analytics/${product.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Detalhes
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <p className="text-gray-500 mb-2">Nenhum produto encontrado.</p>
                        <p className="text-sm text-gray-400">
                          Cadastre produtos e aguarde dados de visualização para ver estatísticas aqui.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
