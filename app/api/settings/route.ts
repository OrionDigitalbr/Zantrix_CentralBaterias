import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  console.log('🔍 [SETTINGS API] GET - Buscando configurações...')
  
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .order("key")

    if (error) {
      console.error('❌ [SETTINGS API] Erro ao buscar configurações:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [SETTINGS API] Configurações carregadas:', data?.length || 0, 'itens')
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ [SETTINGS API] Erro geral ao buscar configurações:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('💾 [SETTINGS API] POST - Salvando configurações...')
  
  try {
    const body = await request.json()
    console.log('📥 [SETTINGS API] Dados recebidos:', body)

    const supabase = createServerSupabaseClient()

    // Validar se os dados necessários estão presentes
    if (!body.key || body.value === undefined) {
      console.error('❌ [SETTINGS API] Dados inválidos - key ou value ausente')
      return NextResponse.json(
        { error: "Key e value são obrigatórios" }, 
        { status: 400 }
      )
    }

    // Fazer upsert da configuração
    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          key: body.key,
          value: body.value,
          type: body.type || 'string',
          description: body.description || null
        },
        { onConflict: 'key' }
      )
      .select()

    if (error) {
      console.error('❌ [SETTINGS API] Erro no Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [SETTINGS API] Configuração salva:', body.key, '=', body.value)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ [SETTINGS API] Erro geral ao salvar:", error)
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  console.log('🔄 [SETTINGS API] PUT - Atualizando configurações em lote...')
  
  try {
    const body = await request.json()
    console.log('📥 [SETTINGS API] Configurações para atualizar:', body)

    const supabase = createServerSupabaseClient()

    // Validar se é um array de configurações
    if (!Array.isArray(body)) {
      console.error('❌ [SETTINGS API] Dados inválidos - esperado array de configurações')
      return NextResponse.json(
        { error: "Esperado array de configurações" }, 
        { status: 400 }
      )
    }

    // Processar cada configuração
    const results = []
    for (const setting of body) {
      if (!setting.key || setting.value === undefined) {
        console.error('❌ [SETTINGS API] Configuração inválida:', setting)
        continue
      }

      console.log(`🔧 [SETTINGS API] Salvando: ${setting.key} = ${setting.value}`)

      const { data, error } = await supabase
        .from("settings")
        .upsert(
          {
            key: setting.key,
            value: setting.value,
            type: setting.type || 'string',
            description: setting.description || null
          },
          { onConflict: 'key' }
        )
        .select()

      if (error) {
        console.error(`❌ [SETTINGS API] Erro ao salvar ${setting.key}:`, error)
        results.push({ key: setting.key, success: false, error: error.message })
      } else {
        console.log(`✅ [SETTINGS API] ${setting.key} salvo com sucesso`)
        results.push({ key: setting.key, success: true, data })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    console.log(`📊 [SETTINGS API] Resultado: ${successCount} sucessos, ${errorCount} erros`)

    return NextResponse.json({ 
      success: errorCount === 0,
      results,
      summary: { successCount, errorCount }
    })
  } catch (error) {
    console.error("❌ [SETTINGS API] Erro geral ao atualizar:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
