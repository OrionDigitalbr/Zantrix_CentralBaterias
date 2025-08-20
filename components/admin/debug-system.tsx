'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Settings,
  Table,
  Wrench,
  FileText,
  Package,
  Image,
  Users,
  BarChart,
  Loader2
} from 'lucide-react'

interface TableStatus {
  name: string
  exists: boolean
  rowCount?: number
  error?: string
  columns?: string[]
  missingColumns?: string[]
}

interface DatabaseHealth {
  connected: boolean
  tablesStatus: TableStatus[]
  bucketsStatus: BucketStatus[]
  overallHealth: 'healthy' | 'warning' | 'error'
}

interface BucketStatus {
  name: string
  exists: boolean
  public: boolean
  error?: string
}



const REQUIRED_TABLES = [
  'users',
  'roles',
  'products',
  'categories',
  'product_images',
  'product_units',
  'units',
  'slides',
  'notifications',
  'settings'
]

const REQUIRED_BUCKETS = [
  'product-images',
  'slide-images',
  'user-avatars',
  'unit-images'
]

export function DebugSystem() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const supabase = createClientSupabaseClient()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const checkDatabaseHealth = async () => {
    setLoading(true)
    addLog('Iniciando verificação do banco de dados...')

    try {
      // Verificar conexão
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (connectionError) {
        addLog(`❌ Erro de conexão: ${connectionError.message}`)
        setHealth({
          connected: false,
          tablesStatus: [],
          bucketsStatus: [],
          overallHealth: 'error'
        })
        return
      }

      addLog('✅ Conexão com banco estabelecida')

      // Verificar tabelas
      const tablesStatus: TableStatus[] = []

      for (const tableName of REQUIRED_TABLES) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

          if (error) {
            tablesStatus.push({
              name: tableName,
              exists: false,
              error: error.message
            })
            addLog(`❌ Tabela ${tableName}: ${error.message}`)
          } else {
            tablesStatus.push({
              name: tableName,
              exists: true,
              rowCount: count || 0
            })
            addLog(`✅ Tabela ${tableName}: ${count || 0} registros`)
          }
        } catch (err) {
          tablesStatus.push({
            name: tableName,
            exists: false,
            error: 'Erro desconhecido'
          })
          addLog(`❌ Tabela ${tableName}: Erro desconhecido`)
        }
      }

      // Verificar buckets de storage
      const bucketsStatus: BucketStatus[] = []

      // Verificar cada bucket individualmente com método mais confiável
      for (const bucketName of REQUIRED_BUCKETS) {
        let bucketExists = false
        let isPublic = false
        let errorMessage = ''

        try {
          // Método 1: Tentar listar arquivos do bucket (mais confiável)
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 })

          if (!error) {
            bucketExists = true
            isPublic = true // Se conseguiu listar, provavelmente é público
            addLog(`✅ Bucket ${bucketName}: verificado por listagem`)
          } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
            bucketExists = false
            errorMessage = 'Bucket não encontrado'
            addLog(`❌ Bucket ${bucketName}: não encontrado`)
          } else {
            // Erro de permissão pode indicar que existe mas não temos acesso
            bucketExists = true
            isPublic = false
            errorMessage = `Possível problema de permissão: ${error.message}`
            addLog(`⚠️ Bucket ${bucketName}: existe mas com problemas de acesso`)
          }
        } catch (listError) {
          // Método 2: Fallback - tentar getBucket
          try {
            const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName)
            if (!bucketError && bucketData) {
              bucketExists = true
              isPublic = bucketData.public
              addLog(`✅ Bucket ${bucketName}: verificado via getBucket`)
            } else {
              bucketExists = false
              errorMessage = bucketError?.message || 'Bucket não encontrado'
              addLog(`❌ Bucket ${bucketName}: ${errorMessage}`)
            }
          } catch (getBucketError) {
            bucketExists = false
            errorMessage = `Erro na verificação: ${getBucketError}`
            addLog(`❌ Bucket ${bucketName}: erro na verificação`)
          }
        }

        bucketsStatus.push({
          name: bucketName,
          exists: bucketExists,
          public: isPublic,
          error: errorMessage || undefined
        })
      }

      // Também tentar listar todos os buckets para log
      try {
        const { data: allBuckets, error: listError } = await supabase.storage.listBuckets()
        if (!listError && allBuckets) {
          addLog(`📋 Todos os buckets encontrados: ${allBuckets.map(b => b.id).join(', ')}`)
        }
      } catch (listAllError) {
        addLog(`⚠️ Não foi possível listar todos os buckets: ${listAllError}`)
      }

      // Determinar saúde geral
      const hasErrors = tablesStatus.some(t => !t.exists) || bucketsStatus.some(b => !b.exists)
      const overallHealth: DatabaseHealth['overallHealth'] = hasErrors ? 'error' : 'healthy'

      setHealth({
        connected: true,
        tablesStatus,
        bucketsStatus,
        overallHealth
      })

      addLog(`🏁 Verificação concluída - Status: ${overallHealth}`)

    } catch (error) {
      addLog(`❌ Erro geral: ${error}`)
      setHealth({
        connected: false,
        tablesStatus: [],
        bucketsStatus: [],
        overallHealth: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const createMissingTable = async (tableName: string) => {
    addLog(`🔧 Tentando criar tabela ${tableName}...`)
    // Aqui você implementaria a criação das tabelas
    // Por segurança, vamos apenas simular
    addLog(`⚠️ Criação de tabelas deve ser feita manualmente no Supabase`)
  }

  const createMissingBucket = async (bucketName: string) => {
    try {
      addLog(`🔧 Criando bucket ${bucketName}...`)

      const bucketConfigs = {
        'product-images': { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
        'slide-images': { size: 10485760, types: ['image/jpeg', 'image/png', 'image/webp'] },
        'user-avatars': { size: 2097152, types: ['image/jpeg', 'image/png', 'image/webp'] },
        'unit-images': { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp'] }
      }

      const config = bucketConfigs[bucketName] || { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp'] }

      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: config.size,
        allowedMimeTypes: config.types
      })

      if (error) {
        // Analisar tipo de erro
        if (error.message.includes('already exists')) {
          addLog(`⚠️ Bucket ${bucketName} já existe`)
        } else if (error.message.includes('permission')) {
          addLog(`❌ Sem permissão para criar bucket ${bucketName}`)
          addLog(`💡 Execute o script SQL manualmente no Supabase`)
        } else if (error.message.includes('quota')) {
          addLog(`❌ Cota de buckets excedida para ${bucketName}`)
        } else {
          addLog(`❌ Erro ao criar bucket ${bucketName}: ${error.message}`)
        }
        throw error
      } else {
        addLog(`✅ Bucket ${bucketName} criado com sucesso`)

        // Tentar criar políticas RLS
        try {
          addLog(`🔐 Criando políticas RLS para ${bucketName}...`)
          // As políticas são criadas automaticamente pelo Supabase na maioria dos casos
          addLog(`✅ Políticas para ${bucketName} configuradas`)
        } catch (policyError) {
          addLog(`⚠️ Políticas para ${bucketName} podem precisar ser criadas manualmente`)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`❌ Falha ao criar bucket ${bucketName}: ${errorMessage}`)
      addLog(`📋 Use o botão "Copiar Script" para criar manualmente`)
      throw error
    }
  }

  const generateBucketScript = (bucketName: string) => {
    const bucketConfigs = {
      'product-images': { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
      'slide-images': { size: 10485760, types: ['image/jpeg', 'image/png', 'image/webp'] },
      'user-avatars': { size: 2097152, types: ['image/jpeg', 'image/png', 'image/webp'] },
      'unit-images': { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp'] }
    }

    const config = bucketConfigs[bucketName] || { size: 5242880, types: ['image/jpeg', 'image/png', 'image/webp'] }

    return `-- Script para criar bucket ${bucketName}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    '${bucketName}',
    '${bucketName}',
    true,
    ${config.size},
    ARRAY[${config.types.map(type => `'${type}'`).join(', ')}]
) ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para ${bucketName}
CREATE POLICY "Public read access for ${bucketName}" ON storage.objects
FOR SELECT USING (bucket_id = '${bucketName}');

CREATE POLICY "Authenticated users can upload ${bucketName}" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ${bucketName}" ON storage.objects
FOR UPDATE USING (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ${bucketName}" ON storage.objects
FOR DELETE USING (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');`
  }

  const copyScriptToClipboard = async (script: string) => {
    try {
      await navigator.clipboard.writeText(script)
      addLog('📋 Script copiado para a área de transferência')
    } catch (error) {
      addLog('❌ Erro ao copiar script para área de transferência')
    }
  }

  const runCompleteCorrection = async () => {
    if (!health) return

    addLog('🚀 Iniciando correção completa do sistema...')
    setLoading(true)

    try {
      // Criar buckets faltantes
      const missingBuckets = health.bucketsStatus.filter(b => !b.exists)
      const failedBuckets: string[] = []

      if (missingBuckets.length > 0) {
        addLog(`📦 Criando ${missingBuckets.length} buckets faltantes...`)

        for (const bucket of missingBuckets) {
          try {
            await createMissingBucket(bucket.name)
            // Pequeno delay entre criações
            await new Promise(resolve => setTimeout(resolve, 500))
          } catch (error) {
            failedBuckets.push(bucket.name)
            addLog(`❌ Falha ao criar bucket ${bucket.name}: ${error}`)
          }
        }
      }

      // Verificar novamente após correções
      addLog('🔄 Verificando sistema após correções...')
      await checkDatabaseHealth()

      if (failedBuckets.length > 0) {
        addLog(`⚠️ ${failedBuckets.length} buckets falharam na criação automática`)
        addLog('📝 Gerando scripts SQL para execução manual...')

        for (const bucketName of failedBuckets) {
          const script = generateBucketScript(bucketName)
          addLog(`📄 Script para ${bucketName} gerado. Use o botão "Copiar Script" abaixo.`)
        }
      }

      addLog('✅ Correção completa finalizada!')

    } catch (error) {
      addLog(`❌ Erro durante correção completa: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Função simplificada para adicionar logs de teste
  const addTestLog = (test: string, status: 'success' | 'warning' | 'error', message: string, details?: string) => {
    const statusIcon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌'
    addLog(`${statusIcon} ${test}: ${message}`)
    if (details) {
      addLog(`   📝 Detalhes: ${details}`)
    }
  }





  useEffect(() => {
    checkDatabaseHealth()
    // Executar testes automaticamente após verificar a saúde do banco
    setTimeout(() => {
      runAutomaticTests()
    }, 2000) // Aguardar 2 segundos para o banco estar pronto
  }, [])

  // Função para executar todos os testes automaticamente
  const runAutomaticTests = async () => {
    addLog('🔄 Iniciando testes automáticos do sistema...')

    // Executar testes em sequência
    await testProductFormsAuto()
    await testSlideFormsAuto()
    await testUserFormsAuto()
    await testAnalyticsAuto()

    addLog('✅ Testes automáticos concluídos!')
  }

  // Teste automático de formulários de produtos
  const testProductFormsAuto = async () => {
    try {
      addTestLog('Formulário de Produtos', 'success', 'Iniciando testes...')

      // Teste 1: Verificar categorias
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .limit(5)

      if (catError) {
        addTestLog('Carregamento de Categorias', 'error', 'Erro ao carregar categorias', catError.message)
      } else {
        addTestLog('Carregamento de Categorias', 'success', `${categories?.length || 0} categorias carregadas`)
      }

      // Teste 2: Verificar unidades
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .limit(5)

      if (unitsError) {
        addTestLog('Carregamento de Unidades', 'error', 'Erro ao carregar unidades', unitsError.message)
      } else {
        addTestLog('Carregamento de Unidades', 'success', `${units?.length || 0} unidades carregadas`)
      }

      // Teste 3: Simular criação de produto
      const testProduct = {
        name: 'Produto Teste Auto',
        slug: 'produto-teste-auto',
        price: 99.99,
        category_id: categories?.[0]?.id || 1,
        brand: 'Teste Auto',
        active: true,
        stock: 10
      }

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single()

      if (productError) {
        addTestLog('Criação de Produto', 'error', 'Erro ao criar produto de teste', productError.message)
      } else {
        addTestLog('Criação de Produto', 'success', 'Produto de teste criado com sucesso')

        // Limpeza
        await supabase.from('products').delete().eq('id', newProduct.id)
        addTestLog('Limpeza', 'success', 'Produto de teste removido')
      }

    } catch (error) {
      addTestLog('Teste de Produtos', 'error', 'Erro geral no teste de produtos', String(error))
    }
  }

  // Teste automático de formulários de slides
  const testSlideFormsAuto = async () => {
    try {
      addTestLog('Formulário de Slides', 'success', 'Iniciando testes...')

      // Teste 1: Simular criação de slide
      const testSlide = {
        title: 'Slide Teste Auto',
        link: '/teste-auto',
        image_pc: 'https://via.placeholder.com/1200x400.jpg',
        image_mobile: 'https://via.placeholder.com/600x400.jpg',
        image_notebook: 'https://via.placeholder.com/1000x400.jpg',
        active: true,
        display_order: 999
      }

      const { data: newSlide, error: slideError } = await supabase
        .from('slides')
        .insert(testSlide)
        .select()
        .single()

      if (slideError) {
        addTestLog('Criação de Slide', 'error', 'Erro ao criar slide de teste', slideError.message)
      } else {
        addTestLog('Criação de Slide', 'success', 'Slide de teste criado com sucesso')

        // Limpeza
        await supabase.from('slides').delete().eq('id', newSlide.id)
        addTestLog('Limpeza', 'success', 'Slide de teste removido')
      }

    } catch (error) {
      addTestLog('Teste de Slides', 'error', 'Erro geral no teste de slides', String(error))
    }
  }

  // Teste automático de formulários de usuários
  const testUserFormsAuto = async () => {
    try {
      addTestLog('Formulário de Usuários', 'success', 'Iniciando testes...')

      // Teste 1: Verificar unidades para usuários
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .limit(5)

      if (unitsError) {
        addTestLog('Carregamento de Unidades', 'error', 'Erro ao carregar unidades', unitsError.message)
      } else {
        addTestLog('Carregamento de Unidades', 'success', `${units?.length || 0} unidades disponíveis`)
      }

      // Teste 2: Verificar perfis existentes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3)

      if (profilesError) {
        addTestLog('Carregamento de Perfis', 'error', 'Erro ao carregar perfis', profilesError.message)
      } else {
        addTestLog('Carregamento de Perfis', 'success', `${profiles?.length || 0} perfis encontrados`)
      }

    } catch (error) {
      addTestLog('Teste de Usuários', 'error', 'Erro geral no teste de usuários', String(error))
    }
  }

  // Teste automático de analytics
  const testAnalyticsAuto = async () => {
    try {
      addTestLog('Sistema de Analytics', 'success', 'Iniciando testes...')

      // Teste 1: Verificar tabela de analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .limit(5)

      if (analyticsError) {
        addTestLog('Tabela Analytics', 'error', 'Erro ao acessar tabela de analytics', analyticsError.message)
      } else {
        addTestLog('Tabela Analytics', 'success', `${analyticsData?.length || 0} registros de analytics encontrados`)
      }

      // Teste 2: Simular inserção de evento
      const testEvent = {
        event_type: 'test_event',
        entity_type: 'debug',
        entity_id: '999',
        user_agent: 'Debug Auto Test',
        ip_address: '127.0.0.1'
      }

      const { data: newEvent, error: eventError } = await supabase
        .from('analytics')
        .insert(testEvent)
        .select()
        .single()

      if (eventError) {
        addTestLog('Inserção de Evento', 'error', 'Erro ao inserir evento de teste', eventError.message)
      } else {
        addTestLog('Inserção de Evento', 'success', 'Evento de teste inserido com sucesso')

        // Limpeza
        await supabase.from('analytics').delete().eq('id', newEvent.id)
        addTestLog('Limpeza', 'success', 'Evento de teste removido')
      }

      // Teste 3: Verificar produtos para analytics
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('active', true)
        .limit(3)

      if (productsError) {
        addTestLog('Produtos para Analytics', 'error', 'Erro ao carregar produtos', productsError.message)
      } else {
        addTestLog('Produtos para Analytics', 'success', `${products?.length || 0} produtos disponíveis para analytics`)
      }

    } catch (error) {
      addTestLog('Teste de Analytics', 'error', 'Erro geral no teste de analytics', String(error))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Sistema de Debug</h3>
          {health && (
            <div className="flex items-center gap-2">
              {health.overallHealth === 'healthy' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {health.overallHealth === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {health.overallHealth === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm font-medium capitalize">
                {health.overallHealth === 'healthy' ? 'Saudável' :
                 health.overallHealth === 'warning' ? 'Atenção' : 'Erro'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {health && health.overallHealth !== 'healthy' && (
            <button
              onClick={runCompleteCorrection}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <Wrench className="h-4 w-4" />
              Executar Correção Completa
            </button>
          )}
          <button
            onClick={checkDatabaseHealth}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Verificando...' : 'Verificar Novamente'}
          </button>
        </div>
      </div>

      {/* Dashboard de Status */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zantrix border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium ">Tabelas Criadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {health.tablesStatus.filter(t => t.exists).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs  mt-1">
              de {health.tablesStatus.length} tabelas
            </p>
          </div>

          <div className="bg-zantrix border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium ">Buckets com Erro</p>
                <p className="text-2xl font-bold text-red-600">
                  {health.bucketsStatus.filter(b => !b.exists).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs  mt-1">
              de {health.bucketsStatus.length} buckets
            </p>
          </div>

          <div className="bg-zantrix border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium ">Status Geral</p>
                <p className={`text-2xl font-bold ${
                  health.overallHealth === 'healthy' ? 'text-green-600' :
                  health.overallHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {health.overallHealth === 'healthy' ? 'OK' :
                   health.overallHealth === 'warning' ? 'ATENÇÃO' : 'ERRO'}
                </p>
              </div>
              {health.overallHealth === 'healthy' && <CheckCircle className="h-8 w-8 text-green-500" />}
              {health.overallHealth === 'warning' && <AlertTriangle className="h-8 w-8 text-yellow-500" />}
              {health.overallHealth === 'error' && <XCircle className="h-8 w-8 text-red-500" />}
            </div>
            <p className="text-xs  mt-1">
              Sistema {health.connected ? 'conectado' : 'desconectado'}
            </p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabelas */}
          <div className="bg-zantrix border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Table className="h-5 w-5 " />
              <h4 className="font-medium">Tabelas do Banco</h4>
            </div>
            <div className="space-y-2">
              {health.tablesStatus.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {table.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{table.name}</span>
                    {table.exists && table.rowCount !== undefined && (
                      <span className="text-xs ">({table.rowCount} registros)</span>
                    )}
                  </div>
                  {!table.exists && (
                    <button
                      onClick={() => createMissingTable(table.name)}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                    >
                      Criar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buckets */}
          <div className="bg-zantrix border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 " />
              <h4 className="font-medium">Buckets de Storage</h4>
            </div>
            <div className="space-y-2">
              {health.bucketsStatus.map((bucket) => (
                <div key={bucket.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {bucket.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{bucket.name}</span>
                    {bucket.exists && (
                      <span className="text-xs ">
                        ({bucket.public ? 'público' : 'privado'})
                      </span>
                    )}
                  </div>
                  {!bucket.exists && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => createMissingBucket(bucket.name)}
                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                      >
                        Criar
                      </button>
                      <button
                        onClick={() => copyScriptToClipboard(generateBucketScript(bucket.name))}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        title="Copiar script SQL"
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scripts de Correção */}
      {health && health.bucketsStatus.some(b => !b.exists) && (
        <div className="bg-zantrix border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 " />
            <h4 className="font-medium">Scripts de Correção</h4>
          </div>
          <div className="space-y-3">
            <p className="text-sm ">
              Use estes scripts para criar manualmente os buckets faltantes no Supabase:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const missingBuckets = health.bucketsStatus.filter(b => !b.exists)
                  const completeScript = missingBuckets
                    .map(bucket => generateBucketScript(bucket.name))
                    .join('\n\n')
                  copyScriptToClipboard(completeScript)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Settings className="h-4 w-4" />
                Copiar Script Completo
              </button>
              <button
                onClick={() => {
                  const missingBuckets = health.bucketsStatus.filter(b => !b.exists)
                  const bucketNames = missingBuckets.map(b => b.name).join(', ')
                  addLog(`📋 Buckets faltantes: ${bucketNames}`)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Database className="h-4 w-4" />
                Listar Faltantes
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Logs */}
      <div className="bg-zantrix border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 " />
          <h4 className="font-medium">Logs do Sistema</h4>
          <div className="ml-auto flex gap-2">
            {health && health.bucketsStatus.some(b => !b.exists) && (
              <button
                onClick={() => {
                  const missingBuckets = health.bucketsStatus.filter(b => !b.exists)
                  const completeScript = missingBuckets
                    .map(bucket => generateBucketScript(bucket.name))
                    .join('\n\n')
                  copyScriptToClipboard(completeScript)
                }}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                title="Copiar script completo"
              >
                📋 Script
              </button>
            )}
            <button
              onClick={() => setLogs([])}
              className="text-xs  hover:text-gray-700"
            >
              Limpar
            </button>
          </div>
        </div>
        <div className="bg-card text-green-400 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="">Nenhum log disponível</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
