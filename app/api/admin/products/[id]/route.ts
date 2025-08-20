import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export const runtime = "nodejs" // importante p/ service role

export const PUT = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await ctx.params // ✅ aguarde o params
    const supabase = createAdminSupabaseClient()
    const numId = Number(id)
    
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await req.json()
    
    // Validar categorias
    const categoryIds: number[] = Array.isArray(body.category_ids)
      ? body.category_ids.map((x: any) => Number(x)).filter(Number.isInteger)
      : []
    
    if (categoryIds.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos uma categoria" }, { status: 400 })
    }

    // Validar unidades
    const unitIds: number[] = Array.isArray(body.unit_ids)
      ? body.unit_ids.map((x: any) => Number(x)).filter(Number.isInteger)
      : []

    console.log('🔍 [API] Atualizando produto:', { id: numId, categoryIds, unitIds })

    // Atualiza produto
    const { error: upErr } = await supabase
      .from("products")
      .update({
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        description: body.description,
        short_description: body.short_description,
        price: Number(body.price) || 0,
        sale_price: body.sale_price ? Number(body.sale_price) : null,
        stock: Number(body.stock) || 0,
        brand: body.brand,
        featured: body.featured || false,
        active: body.active !== false,
        video_url: body.video_url,
        technical_specifications: body.technical_specifications || [],
        category_id: categoryIds[0], // primeira categoria como principal
        updated_at: new Date().toISOString(),
      })
      .eq("id", numId)

    if (upErr) {
      console.error('❌ [API] Erro ao atualizar produto:', upErr)
      return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    console.log('✅ [API] Produto atualizado')

    // Recria vínculos de categorias (ignora RLS pois é service role)
    const { error: deleteErr } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", numId)

    if (deleteErr) {
      console.error('❌ [API] Erro ao deletar categorias antigas:', deleteErr)
      return NextResponse.json({ error: `Erro ao limpar categorias: ${deleteErr.message}` }, { status: 400 })
    }

    // Inserir todas as categorias selecionadas
    const categoryRows = categoryIds.map((cid) => ({ product_id: numId, category_id: cid }))
    console.log('🔍 [API] Inserindo categorias:', categoryRows)
    
    const { error: pcErr } = await supabase
      .from("product_categories")
      .insert(categoryRows)
    
    if (pcErr) {
      console.error('❌ [API] Erro ao inserir categorias:', pcErr)
      return NextResponse.json({ error: `Erro ao inserir categorias: ${pcErr.message}` }, { status: 400 })
    }

    // Recria vínculos de unidades
    const { error: deleteUnitsErr } = await supabase
      .from("product_units")
      .delete()
      .eq("product_id", numId)

    if (deleteUnitsErr) {
      console.error('❌ [API] Erro ao deletar unidades antigas:', deleteUnitsErr)
      return NextResponse.json({ error: `Erro ao limpar unidades: ${deleteUnitsErr.message}` }, { status: 400 })
    }

    // Inserir todas as unidades selecionadas
    if (unitIds.length > 0) {
      const unitRows = unitIds.map((unitId: number) => ({ 
        product_id: numId, 
        unit_id: unitId 
      }))
      
      console.log('🔍 [API] Inserindo unidades:', unitRows)
      
      const { error: unitsErr } = await supabase
        .from("product_units")
        .insert(unitRows)
      
      if (unitsErr) {
        console.error('❌ [API] Erro ao inserir unidades:', unitsErr)
        return NextResponse.json({ error: `Erro ao inserir unidades: ${unitsErr.message}` }, { status: 400 })
      }
    }

    console.log('✅ [API] Produto e relacionamentos atualizados com sucesso')
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('❌ [API] Erro interno:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 })
  }
}
