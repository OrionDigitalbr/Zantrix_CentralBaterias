// Script para limpeza de dados de teste e arquivos temporários
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧹 Iniciando limpeza de dados de teste...\n');

async function cleanup() {
  try {
    // Limpar dados de teste das tabelas
    console.log('🗑️ Removendo dados de teste...');
    
    // Remover produtos de teste
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .like('name', '%teste%')
      .or('name.like.%Teste%,name.like.%TEST%');
    
    if (productsError) {
      console.log('⚠️ Erro ao remover produtos de teste:', productsError.message);
    } else {
      console.log('✅ Produtos de teste removidos');
    }

    // Remover categorias de teste
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .like('name', '%teste%')
      .or('name.like.%Teste%,name.like.%TEST%');
    
    if (categoriesError) {
      console.log('⚠️ Erro ao remover categorias de teste:', categoriesError.message);
    } else {
      console.log('✅ Categorias de teste removidas');
    }

    // Remover slides de teste
    const { error: slidesError } = await supabase
      .from('slides')
      .delete()
      .like('title', '%teste%')
      .or('title.like.%Teste%,title.like.%TEST%');
    
    if (slidesError) {
      console.log('⚠️ Erro ao remover slides de teste:', slidesError.message);
    } else {
      console.log('✅ Slides de teste removidos');
    }

    // Limpar dados de analytics antigos (mais de 90 dias)
    console.log('\n📊 Limpando dados de analytics antigos...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { error: analyticsError } = await supabase
      .from('analytics')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString());
    
    if (analyticsError) {
      console.log('⚠️ Erro ao limpar analytics:', analyticsError.message);
    } else {
      console.log('✅ Dados de analytics antigos removidos');
    }

    // Limpar notificações lidas antigas (mais de 30 dias)
    console.log('\n🔔 Limpando notificações antigas...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (notificationsError) {
      console.log('⚠️ Erro ao limpar notificações:', notificationsError.message);
    } else {
      console.log('✅ Notificações antigas removidas');
    }

    // Verificar espaço de storage
    console.log('\n📁 Verificando storage...');
    const buckets = ['product-images', 'slide-images', 'user-avatars', 'unit-images'];
    
    for (const bucketName of buckets) {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list();
      
      if (error) {
        console.log(`⚠️ Erro ao verificar bucket ${bucketName}:`, error.message);
      } else {
        console.log(`📦 Bucket ${bucketName}: ${files?.length || 0} arquivos`);
      }
    }

    console.log('\n🎉 Limpeza concluída!');
    console.log('\n📋 Resumo:');
    console.log('✅ Dados de teste removidos');
    console.log('✅ Analytics antigos limpos');
    console.log('✅ Notificações antigas removidas');
    console.log('✅ Storage verificado');

  } catch (error) {
    console.error('❌ Erro geral na limpeza:', error.message);
  }
}

// Verificar se o usuário realmente quer fazer a limpeza
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  cleanup();
} else {
  console.log('⚠️ ATENÇÃO: Este script irá remover dados de teste e limpar dados antigos.');
  console.log('Para confirmar a execução, use: node cleanup.js --confirm');
  console.log('\nO que será removido:');
  console.log('- Produtos, categorias e slides com "teste" no nome');
  console.log('- Dados de analytics com mais de 90 dias');
  console.log('- Notificações lidas com mais de 30 dias');
}
