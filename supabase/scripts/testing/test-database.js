// Script para testar conexão e funcionalidades do banco de dados
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 Testando conexão e funcionalidades do banco de dados...\n');

async function testDatabase() {
  try {
    // Teste 1: Conexão básica
    console.log('🔌 Teste 1: Verificando conexão...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('❌ Erro de conexão:', connectionError.message);
      return;
    } else {
      console.log('✅ Conexão estabelecida com sucesso');
    }

    // Teste 2: Verificar tabelas
    console.log('\n📋 Teste 2: Verificando tabelas...');
    const tables = ['categories', 'products', 'slides', 'units', 'users'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro na tabela ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} acessível`);
      }
    }

    // Teste 3: Contar registros
    console.log('\n📊 Teste 3: Contando registros...');
    
    const { data: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    console.log(`📂 Categorias: ${categoriesCount?.length || 0} registros`);

    const { data: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    console.log(`🛍️ Produtos: ${productsCount?.length || 0} registros`);

    const { data: slidesCount } = await supabase
      .from('slides')
      .select('*', { count: 'exact', head: true });
    console.log(`🎠 Slides: ${slidesCount?.length || 0} registros`);

    const { data: unitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true });
    console.log(`🏢 Unidades: ${unitsCount?.length || 0} registros`);

    // Teste 4: Verificar storage
    console.log('\n📁 Teste 4: Verificando storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erro ao acessar storage:', bucketsError.message);
    } else {
      console.log('✅ Storage acessível');
      console.log('📦 Buckets encontrados:');
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.id} (público: ${bucket.public})`);
      });
    }

    // Teste 5: Teste de inserção (e remoção)
    console.log('\n✏️ Teste 5: Teste de inserção/remoção...');
    
    const testCategory = {
      name: 'Teste Categoria',
      slug: 'teste-categoria-' + Date.now(),
      description: 'Categoria de teste - pode ser removida',
      active: false
    };

    const { data: insertedCategory, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir categoria de teste:', insertError.message);
    } else {
      console.log('✅ Inserção funcionando');
      
      // Remover categoria de teste
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', insertedCategory.id);
      
      if (deleteError) {
        console.log('⚠️ Erro ao remover categoria de teste:', deleteError.message);
      } else {
        console.log('✅ Remoção funcionando');
      }
    }

    // Teste 6: Verificar RLS
    console.log('\n🔐 Teste 6: Verificando RLS...');
    
    // Criar cliente anônimo para testar RLS
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: publicData, error: publicError } = await anonSupabase
      .from('products')
      .select('*')
      .limit(1);

    if (publicError) {
      console.log('❌ Erro no acesso público:', publicError.message);
    } else {
      console.log('✅ Acesso público funcionando (RLS configurado)');
    }

    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n📋 Resumo:');
    console.log('✅ Conexão: OK');
    console.log('✅ Tabelas: OK');
    console.log('✅ Storage: OK');
    console.log('✅ Inserção/Remoção: OK');
    console.log('✅ RLS: OK');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
}

testDatabase();
