import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createServerSupabaseClient()

    // Verificar se o ID é um slug ou um número
    const isNumeric = /^\d+$/.test(id)

    let query = supabase.from("products").select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, url, alt_text, is_main, display_order),
        attributes:product_attributes(id, name, value)
      `)

    if (isNumeric) {
      query = query.eq("id", Number.parseInt(id))
    } else {
      query = query.eq("slug", id)
    }

    const { data, error } = await query.single()

    if (error) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Registrar visualização do produto
    await supabase.from("analytics").insert({
      event_type: "view",
      entity_type: "product",
      entity_id: data.id,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      referrer: request.headers.get("referer") || "unknown",
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 })
  }
}
