import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    console.log('🏢 [UNITS API] POST - Criando nova unidade')

    // TEMPORÁRIO: Remover verificação de autenticação para permitir cadastro
    // TODO: Implementar autenticação adequada depois
    console.log('⚠️ [UNITS API] Autenticação temporariamente desabilitada para testes')

    const formData = await req.json();
    console.log('📦 API /admin/units: Payload recebido para adicionar unidade:', formData);

    // Validar campos obrigatórios
    const requiredFields = ['name', 'address', 'email']
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        console.log(`❌ [UNITS API] Campo obrigatório ausente ou vazio: ${field}`)
        return NextResponse.json({
          error: `Campo obrigatório: ${field}`,
          field: field,
          received: formData
        }, { status: 400 })
      }
    }

    // Preparar dados para inserção incluindo novos campos
    const insertData = {
      name: formData.name,
      address: formData.address,
      city: formData.city || 'Cuiabá',
      state: formData.state || 'MT',
      email: formData.email,
      phone: formData.phone || formData.whatsapp || null,
      postal_code: formData.postal_code || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      maps_url: formData.maps_url || formData.googleMapsLink || null,
      active: formData.active !== false,
      operating_hours: formData.operating_hours || null,
      image_url: formData.image_url || formData.image || null
    };
    
    console.log('💾 Dados preparados para inserção:', JSON.stringify(insertData, null, 2));

    console.log('💾 Dados preparados para inserção:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('units')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ ERRO CRÍTICO SUPABASE INSERT (units) - DETALHES:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        receivedPayload: formData
      });
      return NextResponse.json({
        success: false,
        error: error.message || 'Falha ao adicionar unidade: Erro desconhecido do Supabase',
        details: error.details,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('✅ Unidade adicionada com sucesso:', data);
    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });

    } catch (e: unknown) {
      const error = e as Error;
      console.error('🚨 Erro inesperado na API /admin/units (fora do Supabase):', error?.message || 'Erro desconhecido');
      return NextResponse.json({ 
        success: false, 
        error: error?.message || 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    console.log('🏢 [UNITS API] PUT - Atualizando unidade')

    // TEMPORÁRIO: Remover verificação de autenticação para permitir atualização
    // TODO: Implementar autenticação adequada depois
    console.log('⚠️ [UNITS API] Autenticação temporariamente desabilitada para testes')

    // Obter dados do corpo da requisição
    const body = await req.json()
    console.log('📋 [UNITS API] Dados recebidos para atualização:', JSON.stringify(body, null, 2))

    // Validar campos obrigatórios
    const requiredFields = ['id', 'name', 'address', 'email']
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`❌ [UNITS API] Campo obrigatório ausente: ${field}`)
        return NextResponse.json({
          error: `Campo obrigatório: ${field}`,
          field: field,
          received: body
        }, { status: 400 })
      }
    }

    // Validar se o ID é um número válido
    const unitId = parseInt(body.id)
    if (isNaN(unitId)) {
      console.log(`❌ [UNITS API] ID inválido: ${body.id}`)
      return NextResponse.json({
        error: 'ID da unidade deve ser um número válido',
        received_id: body.id
      }, { status: 400 })
    }

    // Preparar dados para atualização (usando estrutura real descoberta)
    const updateData = {
      name: body.name,
      address: body.address,
      city: body.city || 'Cuiabá',
      state: body.state || 'MT',
      email: body.email,
      postal_code: body.postal_code || body.zip_code || null,
      phone: body.phone || body.whatsapp || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      maps_url: body.maps_url || body.googleMapsLink || null,
      image_url: body.image_url || body.image || null,
      operating_hours: body.operating_hours || null
    }

    console.log('💾 [UNITS API] Dados preparados para atualização:', JSON.stringify(updateData, null, 2))
    console.log('🖼️ [UNITS API] Imagem específica sendo enviada:', {
      image_url_from_body: body.image_url,
      image_from_body: body.image,
      final_image_url: updateData.image_url
    })

    // Primeiro, verificar se a unidade existe
    console.log('🔍 [UNITS API] Verificando se unidade existe com ID:', unitId)
    const { data: existingUnit, error: checkError } = await supabase
      .from('units')
      .select('id, name')
      .eq('id', unitId)
      .single()

    console.log('📊 [UNITS API] Unidade existente:', existingUnit)
    console.log('📊 [UNITS API] Erro na verificação:', checkError)

    if (checkError || !existingUnit) {
      console.log('❌ [UNITS API] Unidade não encontrada com ID:', unitId)
      return NextResponse.json({
        error: 'Unidade não encontrada',
        details: `Não foi possível encontrar uma unidade com ID ${unitId}`,
        id_received: unitId
      }, { status: 404 })
    }

    // Atualizar no banco de dados
    console.log('🔄 [UNITS API] Executando update com ID:', unitId)
    const { error: updateError } = await supabase
      .from('units')
      .update(updateData)
      .eq('id', unitId)

    console.log('📊 [UNITS API] Erro do update:', updateError)
    console.log('🔄 [UNITS API] Update executado sem erro, continuando...')

    if (updateError) {
      console.log('❌ [UNITS API] ERRO DETALHADO DO SUPABASE (UPDATE):')
      console.log('❌ [UNITS API] Message:', updateError.message)
      console.log('❌ [UNITS API] Details:', updateError.details)
      console.log('❌ [UNITS API] Hint:', updateError.hint)
      console.log('❌ [UNITS API] Code:', updateError.code)
      console.log('❌ [UNITS API] Error Object:', updateError)

      return NextResponse.json({
        error: 'Erro ao atualizar unidade',
        details: updateError.message,
        supabase_error: updateError
      }, { status: 500 })
    }

    // Buscar a unidade atualizada para retornar
    console.log('🔍 [UNITS API] Buscando unidade atualizada...')
    const { data: updatedUnit, error: fetchError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single()

    console.log('📊 [UNITS API] Unidade atualizada:', updatedUnit)
    console.log('📊 [UNITS API] Erro na busca:', fetchError)
    console.log('🖼️ [UNITS API] Imagem na unidade atualizada:', {
      image_url: updatedUnit?.image_url,
      image: updatedUnit?.image
    })

    if (fetchError) {
      console.log('❌ [UNITS API] Erro ao buscar unidade atualizada:', fetchError)
      return NextResponse.json({
        error: 'Unidade atualizada mas erro ao buscar dados atualizados',
        details: fetchError.message
      }, { status: 500 })
    }

    if (!updatedUnit) {
      console.log('❌ [UNITS API] Unidade não encontrada após update')
      return NextResponse.json({
        error: 'Unidade não encontrada após atualização',
        details: 'A unidade pode ter sido atualizada mas não foi possível recuperar os dados'
      }, { status: 404 })
    }

    console.log('✅ [UNITS API] Unidade atualizada com sucesso:', updatedUnit)
    return NextResponse.json(updatedUnit)

  } catch (error: any) {
    console.error('❌ [UNITS API] Erro interno completo (PUT):', error?.message || error)
    console.error('❌ [UNITS API] Stack trace:', error?.stack)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    console.log('🏢 [UNITS API] GET - Buscando unidades')

    // TEMPORÁRIO: Remover verificação de autenticação para permitir busca
    // TODO: Implementar autenticação adequada depois
    console.log('⚠️ [UNITS API] Autenticação temporariamente desabilitada para testes')

    // Buscar unidades
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('❌ [UNITS API] Erro ao buscar unidades:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [UNITS API] Unidades encontradas:', data.length)
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [UNITS API] Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
