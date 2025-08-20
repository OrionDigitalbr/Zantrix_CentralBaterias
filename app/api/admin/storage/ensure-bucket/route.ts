import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export const runtime = "nodejs" // importante p/ service role

export const POST = async () => {
  try {
    const supabase = createAdminSupabaseClient()

    console.log('🔍 [ENSURE BUCKET] Verificando bucket product-images...')

    // Tenta obter bucket
    const { data: list, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('❌ [ENSURE BUCKET] Erro ao listar buckets:', listError)
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const exists = list?.some(b => b.name === "product-images")
    console.log('🔍 [ENSURE BUCKET] Bucket existe?', exists)

    if (!exists) {
      console.log('🔧 [ENSURE BUCKET] Criando bucket product-images...')
      
      const { error: createErr } = await supabase.storage.createBucket("product-images", {
        public: true,           // ou false se preferir Signed URL
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
      })
      
      if (createErr) {
        console.error('❌ [ENSURE BUCKET] Erro ao criar bucket:', createErr)
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }
      
      console.log('✅ [ENSURE BUCKET] Bucket product-images criado com sucesso')
    } else {
      console.log('✅ [ENSURE BUCKET] Bucket product-images já existe')
    }

    return NextResponse.json({ 
      ok: true, 
      bucket: "product-images",
      exists: exists,
      message: exists ? "Bucket já existe" : "Bucket criado com sucesso"
    })
  } catch (error: any) {
    console.error('❌ [ENSURE BUCKET] Erro inesperado:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
