// Script para corrigir políticas de autenticação
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthPolicies() {
  try {
    console.log('🔧 Corrigindo políticas de autenticação...\n');

    // Verificar se o usuário admin existe e pode fazer login
    console.log('🔍 Testando login do usuário admin...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@grupocentral.com.br',
      password: 'admin123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('🔧 Tentando corrigir credenciais...');
        
        // Listar usuários para verificar se existe
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Erro ao listar usuários:', listError.message);
          return;
        }

        const adminUser = users.users.find(u => u.email === 'admin@grupocentral.com.br');
        
        if (adminUser) {
          console.log('👤 Usuário encontrado. Forçando atualização...');
          
          // Forçar atualização da senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { 
              password: 'admin123456',
              email_confirm: true
            }
          );

          if (updateError) {
            console.error('❌ Erro ao atualizar:', updateError.message);
          } else {
            console.log('✅ Senha atualizada com sucesso!');
          }
        } else {
          console.log('❌ Usuário admin não encontrado. Criando...');
          
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@grupocentral.com.br',
            password: 'admin123456',
            email_confirm: true,
            user_metadata: {
              full_name: 'Administrador',
              role: 'admin'
            }
          });

          if (createError) {
            console.error('❌ Erro ao criar usuário:', createError.message);
          } else {
            console.log('✅ Usuário admin criado!');
          }
        }
      }
    } else {
      console.log('✅ Login do admin funcionando corretamente!');
      
      // Fazer logout
      await supabase.auth.signOut();
    }

    // Verificar e corrigir políticas RLS
    console.log('\n🔒 Verificando políticas RLS...');
    
    const tables = ['products', 'product_images', 'categories', 'units', 'profiles'];
    
    for (const table of tables) {
      try {
        // Testar acesso à tabela
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Tabela ${table}: ${error.message}`);
          
          if (error.message.includes('RLS')) {
            console.log(`   🔧 Corrigindo RLS para ${table}...`);
            
            // Tentar criar política permissiva
            const policySQL = `
              DROP POLICY IF EXISTS "Allow all for authenticated users" ON ${table};
              CREATE POLICY "Allow all for authenticated users" ON ${table}
              FOR ALL TO authenticated USING (true) WITH CHECK (true);
            `;
            
            // Note: Em produção, você executaria isso diretamente no Supabase SQL Editor
            console.log(`   📝 Execute no Supabase SQL Editor: ${policySQL}`);
          }
        } else {
          console.log(`   ✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ Tabela ${table}: ${err.message}`);
      }
    }

    console.log('\n🎯 Teste final de login...');
    
    // Teste final
    const { data: finalTest, error: finalError } = await supabase.auth.signInWithPassword({
      email: 'admin@grupocentral.com.br',
      password: 'admin123456'
    });

    if (finalError) {
      console.error('❌ Login ainda falhando:', finalError.message);
      console.log('\n💡 Soluções possíveis:');
      console.log('1. Execute as correções SQL diretamente no Supabase Dashboard');
      console.log('2. Verifique se o email está confirmado');
      console.log('3. Verifique as configurações de Auth no Supabase');
    } else {
      console.log('✅ Login funcionando perfeitamente!');
      await supabase.auth.signOut();
    }

    console.log('\n📋 Credenciais para teste:');
    console.log('Email: admin@grupocentral.com.br');
    console.log('Senha: admin123456');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixAuthPolicies();
