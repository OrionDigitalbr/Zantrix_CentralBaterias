// Script para descrever a estrutura das tabelas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('📋 Descrevendo estrutura das tabelas...\n');

async function describeTables() {
  try {
    const tables = [
      'roles',
      'users', 
      'categories',
      'products',
      'product_images',
      'slides',
      'units',
      'notifications',
      'analytics'
    ];

    for (const tableName of tables) {
      console.log(`\n📊 TABELA: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(50));
      
      // Obter informações das colunas
      const { data: columns, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          ORDER BY ordinal_position;
        `
      });

      if (error) {
        console.log(`❌ Erro ao descrever tabela ${tableName}:`, error.message);
        continue;
      }

      if (!columns || columns.length === 0) {
        console.log(`⚠️ Tabela ${tableName} não encontrada ou sem colunas`);
        continue;
      }

      // Mostrar colunas
      console.log('Colunas:');
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        
        console.log(`  • ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultValue}`);
      });

      // Contar registros
      const { data: countData, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`\nRegistros: ${countData?.length || 0}`);
      }

      // Mostrar alguns dados de exemplo (apenas primeiros 3 registros)
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);

      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log('\nDados de exemplo:');
        sampleData.forEach((row, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
        });
      }
    }

    // Mostrar informações dos buckets de storage
    console.log('\n\n📁 STORAGE BUCKETS');
    console.log('=' .repeat(50));
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
    } else if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`\n📦 ${bucket.id}`);
        console.log(`   Público: ${bucket.public ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${bucket.created_at}`);
        console.log(`   Atualizado em: ${bucket.updated_at}`);
      });
    } else {
      console.log('Nenhum bucket encontrado');
    }

    console.log('\n\n🎉 Descrição das tabelas concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

describeTables();
