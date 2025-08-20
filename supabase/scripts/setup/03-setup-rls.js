// Script para configurar políticas RLS (Row Level Security)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔐 Configurando políticas RLS...\n');

async function setupRLS() {
  try {
    // Habilitar RLS nas tabelas principais
    console.log('🛡️ Habilitando RLS nas tabelas...');
    
    const tables = ['users', 'products', 'categories', 'slides', 'units', 'notifications', 'analytics'];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
      
      if (error) {
        console.log(`   ⚠️  RLS já habilitado para ${table} ou erro:`, error.message);
      } else {
        console.log(`   ✅ RLS habilitado para ${table}`);
      }
    }

    // Políticas para tabela users
    console.log('\n👤 Criando políticas para users...');
    const userPolicies = [
      {
        name: 'Users can view their own profile',
        sql: `CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);`
      },
      {
        name: 'Users can update their own profile',
        sql: `CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: 'Allow public read access to users',
        sql: `CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);`
      }
    ];

    for (const policy of userPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ❌ Erro ao criar política: ${error.message}`);
      } else {
        console.log(`   ✅ ${policy.name}`);
      }
    }

    // Políticas para tabelas públicas (products, categories, etc.)
    console.log('\n🌐 Criando políticas para tabelas públicas...');
    const publicTables = ['products', 'categories', 'slides', 'units'];
    
    for (const table of publicTables) {
      const policies = [
        {
          name: `Allow public read access to ${table}`,
          sql: `CREATE POLICY "Allow public read access to ${table}" ON ${table} FOR SELECT USING (true);`
        },
        {
          name: `Allow authenticated insert on ${table}`,
          sql: `CREATE POLICY "Allow authenticated insert on ${table}" ON ${table} FOR INSERT WITH CHECK (auth.role() = 'authenticated');`
        },
        {
          name: `Allow authenticated update on ${table}`,
          sql: `CREATE POLICY "Allow authenticated update on ${table}" ON ${table} FOR UPDATE USING (auth.role() = 'authenticated');`
        },
        {
          name: `Allow authenticated delete on ${table}`,
          sql: `CREATE POLICY "Allow authenticated delete on ${table}" ON ${table} FOR DELETE USING (auth.role() = 'authenticated');`
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

    // Políticas para storage
    console.log('\n📁 Criando políticas para storage...');
    const storagePolicies = [
      {
        name: 'Allow public read access on product-images',
        sql: `CREATE POLICY "Allow public read access on product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');`
      },
      {
        name: 'Allow authenticated upload on product-images',
        sql: `CREATE POLICY "Allow authenticated upload on product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');`
      },
      {
        name: 'Allow public read access on slide-images',
        sql: `CREATE POLICY "Allow public read access on slide-images" ON storage.objects FOR SELECT USING (bucket_id = 'slide-images');`
      },
      {
        name: 'Allow authenticated upload on slide-images',
        sql: `CREATE POLICY "Allow authenticated upload on slide-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'slide-images' AND auth.role() = 'authenticated');`
      },
      {
        name: 'Allow public read access on user-avatars',
        sql: `CREATE POLICY "Allow public read access on user-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');`
      },
      {
        name: 'Allow users to upload their own avatar',
        sql: `CREATE POLICY "Allow users to upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');`
      }
    ];

    for (const policy of storagePolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ❌ Erro ao criar política de storage: ${error.message}`);
      } else {
        console.log(`   ✅ ${policy.name}`);
      }
    }

    // Políticas para analytics
    console.log('\n📊 Criando políticas para analytics...');
    const analyticsPolicies = [
      {
        name: 'Allow public insert on analytics',
        sql: `CREATE POLICY "Allow public insert on analytics" ON analytics FOR INSERT WITH CHECK (true);`
      },
      {
        name: 'Allow authenticated read on analytics',
        sql: `CREATE POLICY "Allow authenticated read on analytics" ON analytics FOR SELECT USING (auth.role() = 'authenticated');`
      }
    ];

    for (const policy of analyticsPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`   ❌ Erro ao criar política de analytics: ${error.message}`);
      } else {
        console.log(`   ✅ ${policy.name}`);
      }
    }

    console.log('\n🎉 Políticas RLS configuradas com sucesso!');
    console.log('📝 Próximo passo: Execute o script de inserção de dados de exemplo');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

setupRLS();
