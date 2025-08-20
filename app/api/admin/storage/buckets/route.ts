import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-admin"

export const GET = async () => {
  try {
    console.log('🔍 [BUCKETS API] Verificando buckets disponíveis...')
    
    const supabase = createAdminSupabaseClient()
    
    // Listar todos os buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ [BUCKETS API] Erro ao listar buckets:', bucketError)
      return NextResponse.json({ 
        error: bucketError.message,
        details: bucketError
      }, { status: 500 })
    }

    console.log('✅ [BUCKETS API] Buckets encontrados:', buckets?.map(b => b.name))

    // Verificar configurações de cada bucket
    const bucketDetails = buckets?.map(bucket => ({
      name: bucket.name,
      id: bucket.id,
      public: bucket.public,
      file_size_limit: bucket.file_size_limit,
      allowed_mime_types: bucket.allowed_mime_types,
      created_at: bucket.created_at
    }))

    return NextResponse.json({ 
      buckets: bucketDetails,
      total: buckets?.length || 0
    })
  } catch (error: any) {
    console.error('❌ [BUCKETS API] Erro inesperado:', error)
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor',
      stack: error.stack,
      type: error.constructor.name
    }, { status: 500 })
  }
}
