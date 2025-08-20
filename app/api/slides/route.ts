import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("slides").select("*").eq("active", true).order("display_order")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar slides:", error)
    return NextResponse.json({ error: "Erro ao buscar slides" }, { status: 500 })
  }
}
