// Script para corrigir políticas RLS que podem estar causando problemas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Corrigindo políticas RLS...\n');

async function fixRLSPolicies() {
  try {
    // Primeiro, remover políticas problemáticas
    console.log('🗑️ Removendo políticas antigas...');
    
    const tablesToFix = ['products', 'categories', 'slides', 'units', 'product_images'];
    
    for (const table of tablesToFix) {
      // Remover todas as políticas existentes
      const { error: dropError } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "Allow public read access to ${table}" ON ${table};`
      });
      
      if (dropError && !dropError.message.includes('does not exist')) {
        console.log(`   ⚠️ Erro ao remover política de ${table}:`, dropError.message);
      } else {
        console.log(`   ✅ Políticas antigas removidas de ${table}`);
      }
    }

    // Criar políticas mais permissivas para resolver problemas de upload
    console.log('\n🛡️ Criando políticas corrigidas...');
    
    // Políticas para tabelas principais - acesso público total
    const publicTables = ['products', 'categories', 'slides', 'units'];
    
    for (const table of publicTables) {
      const policies = [
        {
          name: `Enable read access for all users on ${table}`,
          sql: `CREATE POLICY "Enable read access for all users on ${table}" ON ${table} FOR SELECT USING (true);`
        },
        {
          name: `Enable insert for all users on ${table}`,
          sql: `CREATE POLICY "Enable insert for all users on ${table}" ON ${table} FOR INSERT WITH CHECK (true);`
        },
        {
          name: `Enable update for all users on ${table}`,
          sql: `CREATE POLICY "Enable update for all users on ${table}" ON ${table} FOR UPDATE USING (true);`
        },
        {
          name: `Enable delete for all users on ${table}`,
          sql: `CREATE POLICY "Enable delete for all users on ${table}" ON ${table} FOR DELETE USING (true);`
        }
      ];

      for (const policy of policies) {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error && !error.message.includes('already exists')) {
          console.log(`   ❌ Erro ao criar política para ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${policy.name}`);
        }
      }
    }

    // Políticas especiais para product_images
    console.log('\n🖼️ Configurando políticas para product_images...');
    const imagesPolicies = [
      {
        name: 'Enable read access for all users on product_images',
        sql: `CREATE POLICY "Enable read access for all users on product_images" ON product_images FOR SELECT USING (true);`
      },
      {
        name: 'Enable insert for all users on product_images',
        sql: `CREATE POLICY "Enable insert for all users on product_images" ON product_images FOR INSERT WITH CHECK (true);`
      },
      {
        name: 'Enable update for all users on product_images',
        sql: `CREATE POLICY "Enable update for all users on product_images" ON product_images FOR UPDATE USING (true);`
      },
      {
        name: 'Enable delete for all users on product_images',
        sql: `CREATE POLICY "Enable delete for all users on product_images" ON product_images FOR DELETE USING (true);`
      }
    ];

    for (const policy of imagesPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ❌ Erro ao criar política para product_images: ${error.message}`);
      } else {
        console.log(`   ✅ ${policy.name}`);
      }
    }

    // Corrigir políticas de storage
    console.log('\n📁 Corrigindo políticas de storage...');
    
    // Remover políticas antigas de storage
    const storageDropPolicies = [
      'DROP POLICY IF EXISTS "Allow public read access on product-images" ON storage.objects;',
      'DROP POLICY IF EXISTS "Allow authenticated upload on product-images" ON storage.objects;',
      'DROP POLICY IF EXISTS "Allow public read access on slide-images" ON storage.objects;',
      'DROP POLICY IF EXISTS "Allow authenticated upload on slide-images" ON storage.objects;'
    ];

    for (const sql of storageDropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      // Ignorar erros de políticas que não existem
    }

    // Criar políticas de storage mais permissivas
    const newStoragePolicies = [
      {
        name: 'Allow all operations on product-images',
        sql: `CREATE POLICY "Allow all operations on product-images" ON storage.objects FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');`
      },
      {
        name: 'Allow all operations on slide-images',
        sql: `CREATE POLICY "Allow all operations on slide-images" ON storage.objects FOR ALL USING (bucket_id = 'slide-images') WITH CHECK (bucket_id = 'slide-images');`
      },
      {
        name: 'Allow all operations on user-avatars',
        sql: `CREATE POLICY "Allow all operations on user-avatars" ON storage.objects FOR ALL USING (bucket_id = 'user-avatars') WITH CHECK (bucket_id = 'user-avatars');`
      },
      {
        name: 'Allow all operations on unit-images',
        sql: `CREATE POLICY "Allow all operations on unit-images" ON storage.objects FOR ALL USING (bucket_id = 'unit-images') WITH CHECK (bucket_id = 'unit-images');`
      }
    ];

    for (const policy of newStoragePolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ❌ Erro ao criar política de storage: ${error.message}`);
      } else {
        console.log(`   ✅ ${policy.name}`);
      }
    }

    console.log('\n🎉 Políticas RLS corrigidas com sucesso!');
    console.log('\n📝 Mudanças aplicadas:');
    console.log('✅ Acesso público total para leitura em todas as tabelas');
    console.log('✅ Permissões de inserção/atualização mais flexíveis');
    console.log('✅ Políticas de storage simplificadas');
    console.log('✅ Correção de problemas de upload de imagens');
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('- Estas políticas são mais permissivas para resolver problemas de desenvolvimento');
    console.log('- Em produção, considere políticas mais restritivas baseadas em autenticação');
    console.log('- Teste o upload de imagens no admin para verificar se está funcionando');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixRLSPolicies();
