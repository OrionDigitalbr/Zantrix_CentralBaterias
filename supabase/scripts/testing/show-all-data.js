// Script para mostrar todos os dados inseridos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showAllData() {
  console.log('📊 DADOS INSERIDOS NO SUPABASE\n');
  console.log('🔗 Projeto:', supabaseUrl);
  console.log('=' .repeat(50));
  
  try {
    // Categorias
    console.log('\n📂 CATEGORIAS:');
    const { data: categories } = await supabase.from('categories').select('*').order('id');
    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        console.log(`  ${cat.id}. ${cat.name} (${cat.slug}) - ${cat.active ? 'Ativo' : 'Inativo'}`);
      });
    } else {
      console.log('  Nenhuma categoria encontrada');
    }
    
    // Produtos
    console.log('\n🛍️ PRODUTOS:');
    const { data: products } = await supabase.from('products').select('*').order('id');
    if (products && products.length > 0) {
      products.forEach(prod => {
        console.log(`  ${prod.id}. ${prod.name} - R$ ${prod.price} (${prod.sku})`);
      });
    } else {
      console.log('  Nenhum produto encontrado');
    }
    
    // Slides
    console.log('\n🖼️ SLIDES:');
    const { data: slides } = await supabase.from('slides').select('*').order('display_order');
    if (slides && slides.length > 0) {
      slides.forEach(slide => {
        console.log(`  ${slide.display_order}. ${slide.title} - ${slide.active ? 'Ativo' : 'Inativo'}`);
      });
    } else {
      console.log('  Nenhum slide encontrado');
    }
    
    // Unidades
    console.log('\n🏢 UNIDADES:');
    const { data: units } = await supabase.from('units').select('*').order('id');
    if (units && units.length > 0) {
      units.forEach(unit => {
        console.log(`  ${unit.id}. ${unit.name} - ${unit.city}/${unit.state}`);
      });
    } else {
      console.log('  Nenhuma unidade encontrada');
    }
    
    // Usuários
    console.log('\n👥 USUÁRIOS:');
    const { data: users } = await supabase.from('users').select('id, name, email, active').order('id');
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  ${user.id}. ${user.name} (${user.email}) - ${user.active ? 'Ativo' : 'Inativo'}`);
      });
    } else {
      console.log('  Nenhum usuário encontrado');
    }
    
    // Roles
    console.log('\n🔐 ROLES:');
    const { data: roles } = await supabase.from('roles').select('*').order('id');
    if (roles && roles.length > 0) {
      roles.forEach(role => {
        console.log(`  ${role.id}. ${role.name} - ${role.description}`);
      });
    } else {
      console.log('  Nenhuma role encontrada');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Verificação concluída!');
    console.log('\n💡 DICA: No painel do Supabase, certifique-se de:');
    console.log('   1. Estar no projeto correto: lmlgxzfqnysvpsdewuag');
    console.log('   2. Clicar em "Table Editor" no menu lateral');
    console.log('   3. Selecionar cada tabela para ver os dados');
    console.log('   4. Atualizar a página se necessário (F5)');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

showAllData();
