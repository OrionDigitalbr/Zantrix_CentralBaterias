import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

// devolve: produto, todas as categorias, ids selecionados, todas unidades e ids selecionados
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminSupabaseClient()
    const productId = Number(id)

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 })
    }

    console.log('🔍 [EDITOR DATA] Carregando dados para produto:', productId)

    // produto
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()
    
    if (pErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar produto:', pErr.message)
      return NextResponse.json({ error: pErr.message }, { status: 404 })
    }

    // categorias (todas)
    const { data: categories, error: cErr } = await supabase
      .from("categories")
      .select("id,name,parent_id")
      .eq("active", true)
      .order("name", { ascending: true })
    
    if (cErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar categorias:', cErr.message)
      return NextResponse.json({ error: cErr.message }, { status: 400 })
    }

    // categorias já vinculadas ao produto
    const { data: pc, error: pcErr } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", productId)
    
    if (pcErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar categorias do produto:', pcErr.message)
      return NextResponse.json({ error: pcErr.message }, { status: 400 })
    }
    
    const selectedCategoryIds = pc.map((r) => r.category_id)

    // unidades (todas)
    const { data: units, error: uErr } = await supabase
      .from("units")
      .select("id,name")
      .eq("active", true)
      .order("name", { ascending: true })
    
    if (uErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar unidades:', uErr.message)
      return NextResponse.json({ error: uErr.message }, { status: 400 })
    }

    // unidades já vinculadas
    const { data: pu, error: puErr } = await supabase
      .from("product_units")
      .select("unit_id")
      .eq("product_id", productId)
    
    if (puErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar unidades do produto:', puErr.message)
      return NextResponse.json({ error: puErr.message }, { status: 400 })
    }
    
    const selectedUnitIds = pu.map((r) => r.unit_id)

    // imagens do produto
    const { data: images, error: iErr } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order")
    
    if (iErr) {
      console.error('❌ [EDITOR DATA] Erro ao buscar imagens:', iErr.message)
      // não falha se não conseguir carregar imagens
    }

    const result = {
      product,
      categories,
      selectedCategoryIds,
      units,
      selectedUnitIds,
      images: images || []
    }

    console.log('✅ [EDITOR DATA] Dados carregados com sucesso:', {
      productId,
      categoriesCount: categories.length,
      selectedCategoriesCount: selectedCategoryIds.length,
      unitsCount: units.length,
      selectedUnitsCount: selectedUnitIds.length,
      imagesCount: images?.length || 0
    })

    return NextResponse.json(result)

  } catch (e: any) {
    console.error('❌ [EDITOR DATA] Erro inesperado:', e)
    return NextResponse.json({ error: e?.message ?? "Erro ao carregar dados do editor" }, { status: 500 })
  }
}
