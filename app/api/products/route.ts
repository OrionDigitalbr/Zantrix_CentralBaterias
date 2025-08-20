import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { z } from "zod"

// Schema de validação para parâmetros de query
const QuerySchema = z.object({
  categoria: z.string().optional(),
  marca: z.string().optional(),
  preco_min: z.string().transform(val => {
    const num = parseFloat(val)
    return isNaN(num) ? undefined : num
  }).optional(),
  preco_max: z.string().transform(val => {
    const num = parseFloat(val)
    return isNaN(num) ? undefined : num
  }).optional(),
  page: z.string().transform(val => {
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 ? 1 : num
  }).default("1"),
  limit: z.string().transform(val => {
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 || num > 100 ? 12 : num
  }).default("12")
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validar parâmetros de entrada
    const queryResult = QuerySchema.safeParse(Object.fromEntries(searchParams))
    
    if (!queryResult.success) {
      return NextResponse.json(
        { 
          error: "Parâmetros de consulta inválidos",
          details: queryResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const { categoria, marca, preco_min, preco_max, page, limit } = queryResult.data

    const supabase = createServerSupabaseClient()

    // Construir a query base com validação
    let query = supabase
      .from("products")
      .select(
        `
        id, 
        name, 
        slug, 
        price, 
        sale_price, 
        category_id,
        brand,
        product_images!inner(url, is_main)
      `,
        { count: "exact" },
      )
      .eq("active", true)
      .eq("product_images.is_main", true)

    // Aplicar filtros com validação
    if (categoria) {
      try {
        // Primeiro, buscar o ID da categoria pelo slug
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categoria)
          .eq("active", true)
          .single()

        if (categoryError || !categoryData) {
          return NextResponse.json(
            { error: "Categoria não encontrada ou inativa" }, 
            { status: 404 }
          )
        }

        query = query.eq("category_id", categoryData.id)
      } catch (error) {
        console.error("Erro ao buscar categoria:", error)
        return NextResponse.json(
          { error: "Erro interno ao buscar categoria" }, 
          { status: 500 }
        )
      }
    }

    if (marca && marca.trim()) {
      // Sanitizar marca para prevenir SQL injection
      const sanitizedBrand = marca.trim().toLowerCase()
      query = query.ilike("brand", `%${sanitizedBrand}%`)
    }

    if (preco_min !== undefined && preco_min >= 0) {
      query = query.gte("price", preco_min)
    }

    if (preco_max !== undefined && preco_max > 0) {
      if (preco_min !== undefined && preco_max < preco_min) {
        return NextResponse.json(
          { error: "Preço máximo deve ser maior que o preço mínimo" }, 
          { status: 400 }
        )
      }
      query = query.lte("price", preco_max)
    }

    // Aplicar paginação com validação
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Executar a query
    const { data, error, count } = await query.range(from, to).order("name")

    if (error) {
      console.error("Erro na query do banco:", error)
      return NextResponse.json(
        { error: "Erro interno do servidor" }, 
        { status: 500 }
      )
    }

    // Formatar os dados com validação
    const products = (data || []).map((product) => {
      // Validar que o produto tem dados válidos
      if (!product.id || !product.name || !product.slug) {
        console.warn("Produto com dados inválidos:", product)
        return null
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price || 0,
        sale_price: product.sale_price,
        image_url:
          product.product_images?.[0]?.url ||
          "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(product.name),
        category_id: product.category_id,
        brand: product.brand || "",
      }
    }).filter(Boolean) // Remover produtos nulos

    // Calcular informações de paginação
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
    })

  } catch (error) {
    console.error("Erro inesperado na API de produtos:", error)
    
    // Não expor detalhes internos em produção
    const isProduction = process.env.NODE_ENV === 'production'
    
    return NextResponse.json(
      { 
        error: isProduction ? "Erro interno do servidor" : "Erro ao buscar produtos",
        ...(isProduction ? {} : { details: error instanceof Error ? error.message : 'Erro desconhecido' })
      }, 
      { status: 500 }
    )
  }
}
