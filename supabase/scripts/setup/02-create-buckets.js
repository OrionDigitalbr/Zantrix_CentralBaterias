// Script para criar buckets de storage via JavaScript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  console.error('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas em .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const buckets = [
  {
    id: 'product-images',
    name: 'product-images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  {
    id: 'slide-images',
    name: 'slide-images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  {
    id: 'user-avatars',
    name: 'user-avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  {
    id: 'unit-images',
    name: 'unit-images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
]

async function createBuckets() {
  console.log('🗄️ Criando buckets de storage...\n')

  for (const bucket of buckets) {
    try {
      console.log(`📦 Criando bucket: ${bucket.id}`)
      
      // Tentar criar o bucket
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Bucket ${bucket.id} já existe`)
        } else {
          console.error(`   ❌ Erro ao criar bucket ${bucket.id}:`, error.message)
        }
      } else {
        console.log(`   ✅ Bucket ${bucket.id} criado com sucesso`)
      }
    } catch (err) {
      console.error(`   ❌ Erro inesperado ao criar bucket ${bucket.id}:`, err.message)
    }
  }

  console.log('\n📋 Verificando buckets criados...')
  
  try {
    const { data: existingBuckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Erro ao listar buckets:', error.message)
      return
    }

    console.log('\n📊 Buckets encontrados:')
    existingBuckets.forEach(bucket => {
      const isOurs = buckets.find(b => b.id === bucket.id)
      if (isOurs) {
        console.log(`   ✅ ${bucket.id} (público: ${bucket.public})`)
      }
    })

    const missingBuckets = buckets.filter(bucket => 
      !existingBuckets.find(existing => existing.id === bucket.id)
    )

    if (missingBuckets.length > 0) {
      console.log('\n⚠️  Buckets não encontrados:')
      missingBuckets.forEach(bucket => {
        console.log(`   ❌ ${bucket.id}`)
      })
    } else {
      console.log('\n🎉 Todos os buckets foram criados com sucesso!')
    }

  } catch (err) {
    console.error('❌ Erro ao verificar buckets:', err.message)
  }
}

console.log('🚀 Iniciando criação de buckets de storage...\n')
createBuckets().catch(console.error)
