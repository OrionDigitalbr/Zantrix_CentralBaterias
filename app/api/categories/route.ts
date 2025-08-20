import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Organizar categorias em hierarquia
    const mainCategories = data.filter((category) => !category.parent_id)
    const subCategories = data.filter((category) => category.parent_id)

    const categoriesWithChildren = mainCategories.map((category) => {
      return {
        ...category,
        children: subCategories.filter((sub) => sub.parent_id === category.id),
      }
    })

    return NextResponse.json(categoriesWithChildren)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}
