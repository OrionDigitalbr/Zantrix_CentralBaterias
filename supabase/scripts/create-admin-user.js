// Script para criar usuário admin inicial - VERSÃO FUNCIONAL
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// CONFIGURAÇÃO DIRETA - SEM DEPENDÊNCIAS EXTERNAS
// ===========
// 
// 
// ==========================================

// Substitua estas URLs pelas suas credenciais reais do Supabase
const SUPABASE_URL = 'https://qqmfrsgkfpnjeuwaxgiu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbWZyc2drZnBuamV1d2F4Z2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0Mzk0NDQsImV4cCI6MjA3MTAxNTQ0NH0.AhhSFA2ER-xNZ0qVN3mQczb9TeuUR7wfzDOGzNXoy6U';

// =====================================================
// DADOS DO USUÁRIO ADMIN
// =====================================================
const ADMIN_EMAIL = 'admin@grupocentral.com.br';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_NAME = 'Administrador Grupo Central';

console.log('🚀 SCRIPT DE CRIAÇÃO DE USUÁRIO ADMIN');
console.log('=====================================================');
console.log(`📧 Email: ${ADMIN_EMAIL}`);
console.log(`🔑 Senha: ${ADMIN_PASSWORD}`);
console.log(`👤 Nome: ${ADMIN_NAME}`);
console.log('=====================================================');

// =====================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =====================================================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================
async function createAdminUser() {
  try {
    console.log('\n🔍 Verificando usuários existentes...');
    
    // Listar usuários existentes
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      throw listError;
    }
    
    const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log('ℹ️  Usuário admin já existe. Atualizando senha...');
      
      // Atualizar senha do usuário existente
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: ADMIN_NAME,
            role: 'admin'
          }
        }
      );
      
      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError.message);
        throw updateError;
      }
      
      console.log('✅ Senha do usuário admin atualizada com sucesso!');
      
      // Criar/atualizar perfil
      await createOrUpdateProfile(existingUser.id);
      
    } else {
      console.log('📝 Criando novo usuário admin...');
      
      // Criar usuário usando Admin API
      const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
          role: 'admin'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        throw createError;
      }
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log(`👤 ID do usuário: ${user.user.id}`);
      
      // Criar perfil do usuário
      await createOrUpdateProfile(user.user.id);
    }
    
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=====================================================');
    console.log('📋 CREDENCIAIS DE LOGIN:');
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔑 Senha: ${ADMIN_PASSWORD}`);
    console.log('=====================================================');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Acesse: http://localhost:3000/admin');
    console.log('2. Use as credenciais acima para fazer login');
    console.log('3. Teste se o dashboard funciona corretamente');
    console.log('=====================================================');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    
    if (error.message.includes('relation "profiles" does not exist')) {
      console.log('\n💡 Dica: A tabela profiles não existe. Execute primeiro:');
      console.log('   node supabase/scripts/setup-all.js');
    }
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Dica: Verifique se as credenciais do Supabase estão corretas');
      console.log('   - SUPABASE_URL: deve ser a URL do seu projeto');
      console.log('   - SUPABASE_SERVICE_KEY: deve ser a chave de serviço (service_role)');
    }
  }
}

// =====================================================
// FUNÇÃO AUXILIAR - CRIAR/ATUALIZAR PERFIL
// =====================================================
async function createOrUpdateProfile(userId) {
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: ADMIN_NAME,
        role: 'admin',
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.warn('⚠️  Erro ao criar perfil:', profileError.message);
      console.log('   Isso pode ser normal se a tabela profiles não existir ainda');
    } else {
      console.log('✅ Perfil do admin criado/atualizado!');
    }
  } catch (error) {
    console.warn('⚠️  Erro ao criar perfil (pode ser normal):', error.message);
  }
}

// =====================================================
// EXECUTAR O SCRIPT
// =====================================================
console.log('🚀 Iniciando criação do usuário admin...\n');
createAdminUser();
