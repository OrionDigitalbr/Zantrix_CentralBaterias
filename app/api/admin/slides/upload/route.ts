import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export const runtime = "nodejs" // importante p/ service role

export const POST = async (req: Request) => {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const variant = (form.get("variant") as string) || "desktop"
    
    if (!file) {
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 })
    }

    console.log('🔍 [SLIDES UPLOAD] Iniciando upload:', { variant, filename: file.name, size: file.size })

    const supabase = createAdminSupabaseClient()

    // Garante bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.error('❌ [SLIDES UPLOAD] Erro ao listar buckets:', bucketError)
      return NextResponse.json({ error: bucketError.message }, { status: 500 })
    }

    const has = buckets?.some(b => b.name === "slide-images")
    if (!has) {
      console.log('🔧 [SLIDES UPLOAD] Criando bucket slide-images...')
      
      const { error: cbErr } = await supabase.storage.createBucket("slide-images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      })
      
      if (cbErr) {
        console.error('❌ [SLIDES UPLOAD] Erro ao criar bucket:', cbErr)
        return NextResponse.json({ error: cbErr.message }, { status: 500 })
      }
      
      console.log('✅ [SLIDES UPLOAD] Bucket slide-images criado')
    } else {
      console.log('✅ [SLIDES UPLOAD] Bucket slide-images já existe')
    }

    // Normalizar nome do arquivo
    const clean = file.name.replace(/[^\w.-]/g, "_")
    const key = `slides/${variant}-${Date.now()}-${clean}`

    console.log('🔍 [SLIDES UPLOAD] Fazendo upload para:', key)

    const buf = new Uint8Array(await file.arrayBuffer())
    const { error: upErr } = await supabase.storage
      .from("slide-images")
      .upload(key, buf, { contentType: file.type, upsert: false })

    if (upErr) {
      console.error('❌ [SLIDES UPLOAD] Erro no upload:', upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    console.log('✅ [SLIDES UPLOAD] Upload realizado com sucesso')

    const { data: urlData } = supabase.storage.from("slide-images").getPublicUrl(key)
    console.log('🔍 [SLIDES UPLOAD] URL pública gerada:', urlData.publicUrl)

    return NextResponse.json({ 
      url: urlData.publicUrl, 
      path: key,
      variant: variant,
      size: file.size
    })
  } catch (e: any) {
    console.error('❌ [SLIDES UPLOAD] Erro inesperado:', e)
    return NextResponse.json({ 
      error: e?.message ?? "Falha no upload",
      stack: e?.stack,
      type: e?.constructor?.name
    }, { status: 500 })
  }
}
