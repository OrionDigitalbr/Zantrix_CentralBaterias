'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientSupabaseClient } from '@/lib/supabase'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Users,
  Package,
  Image,
  Settings,
  BarChart3,
  Bell
} from 'lucide-react'

interface TestResult {
  table: string
  status: 'success' | 'error' | 'warning'
  message: string
  count?: number
  error?: string
  icon: any
}

export default function DatabaseTestTab() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [lastTest, setLastTest] = useState<Date | null>(null)

  const supabase = createClientSupabaseClient()

  const tables = [
    { name: 'products', label: 'Produtos', icon: Package },
    { name: 'categories', label: 'Categorias', icon: Package },
    { name: 'slides', label: 'Slides', icon: Image },
    { name: 'users', label: 'Usuários', icon: Users },
    { name: 'roles', label: 'Roles', icon: Users },
    { name: 'units', label: 'Unidades', icon: Settings },
    { name: 'settings', label: 'Configurações', icon: Settings },
    { name: 'analytics', label: 'Analytics', icon: BarChart3 },
    { name: 'notifications', label: 'Notificações', icon: Bell }
  ]

  const testTable = async (tableName: string, label: string, icon: any): Promise<TestResult> => {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        return {
          table: label,
          status: 'error',
          message: `Erro ao conectar: ${error.message}`,
          error: error.code || 'UNKNOWN',
          icon
        }
      }

      const recordCount = count || 0
      
      if (recordCount === 0) {
        return {
          table: label,
          status: 'warning',
          message: 'Tabela vazia - sem registros',
          count: recordCount,
          icon
        }
      }

      return {
        table: label,
        status: 'success',
        message: `Conexão OK - ${recordCount} registro(s)`,
        count: recordCount,
        icon
      }
    } catch (error: any) {
      return {
        table: label,
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        error: 'EXCEPTION',
        icon
      }
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    
    try {
      const testPromises = tables.map(table => 
        testTable(table.name, table.label, table.icon)
      )
      
      const testResults = await Promise.all(testPromises)
      setResults(testResults)
      setLastTest(new Date())
    } catch (error) {
      console.error('Erro ao executar testes:', error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">OK</Badge>
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">AVISO</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <div className="space-y-6">
      {/* Resumo dos Testes */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avisos</p>
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste de Conectividade
          </CardTitle>
          <CardDescription>
            Execute testes em todas as tabelas do sistema para verificar conectividade e integridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {lastTest && (
                <p className="text-sm text-muted-foreground">
                  Último teste: {lastTest.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <Button onClick={runAllTests} disabled={testing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testando...' : 'Executar Testes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>
              Status de conectividade para cada tabela do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => {
                const IconComponent = result.icon
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{result.table}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        {result.error && (
                          <p className="text-xs text-red-500">Código: {result.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.count !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          {result.count} registros
                        </span>
                      )}
                      {getStatusIcon(result.status)}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas e Recomendações */}
      {results.length > 0 && errorCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {errorCount} tabela(s) com erro de conectividade. 
            Verifique as configurações do Supabase e as políticas RLS (Row Level Security).
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && warningCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Aviso:</strong> {warningCount} tabela(s) vazia(s). 
            Considere inserir dados de exemplo ou verificar se os dados foram carregados corretamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
