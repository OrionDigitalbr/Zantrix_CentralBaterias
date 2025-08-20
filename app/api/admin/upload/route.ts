import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export const runtime = "nodejs" // importante p/ service role

export const POST = async (req: NextRequest) => {
  try {
    console.log('�� [UPLOAD API] Iniciando upload...')
    
    const form = await req.formData()
    const file = form.get("file") as File | null
    
    if (!file) {
      console.error('❌ [UPLOAD API] Arquivo não fornecido')
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 })
    }

    // Validação de tipo e tamanho
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({ 
        error: "Arquivo muito grande. Tamanho máximo: 10MB" 
      }, { status: 400 })
    }

    console.log('🔍 [UPLOAD API] Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    const supabase = createAdminSupabaseClient()
    
    // Normalizar nome do arquivo (evita bugs futuros)
    const cleanName = file.name.replace(/[^\w.-]/g, "_")
    const filename = `products/${Date.now()}-${cleanName}`
    
    console.log('🔍 [UPLOAD API] Fazendo upload para:', filename)

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase
      .storage
      .from("product-images")
      .upload(filename, bytes, { 
        contentType: file.type, 
        upsert: false 
      })

    if (error) {
      console.error('❌ [UPLOAD API] Erro no upload:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error,
        bucket: 'product-images',
        filename: filename
      }, { status: 500 })
    }

    console.log('✅ [UPLOAD API] Upload realizado com sucesso:', data)

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename)
    console.log('🔍 [UPLOAD API] URL pública gerada:', urlData.publicUrl)

    return NextResponse.json({ 
      url: urlData.publicUrl,
      filename: filename,
      size: file.size,
      bucket: 'product-images'
    })
  } catch (e: any) {
    console.error('❌ [UPLOAD API] Erro inesperado:', e)
    return NextResponse.json({ 
      error: e?.message ?? "Falha no upload",
      stack: e?.stack,
      type: e?.constructor?.name
    }, { status: 500 })
  }
}
