// Script para criar usuário RafaelRosa
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createRafaelUser() {
  try {
    console.log('🚀 Criando usuário RafaelRosa...\n');

    // Dados do usuário
    const userEmail = 'rafael17roomt@Outlook.com';
    const userPassword = 'Admin123';
    const userName = 'RafaelRosa';

    console.log(`📧 Email: ${userEmail}`);
    console.log(`🔑 Senha: [PROTEGIDO]`);
    console.log(`👤 Nome de usuário: ${userName}\n`);

    // Primeiro, verificar se o usuário já existe
    console.log('🔍 Verificando usuários existentes...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === userEmail);

    if (existingUser) {
      console.log('ℹ️  Usuário já existe. Atualizando dados...');

      // Atualizar dados do usuário existente
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: userPassword,
          email_confirm: true,
          user_metadata: {
            full_name: userName,
            role: 'admin' // ou 'user', dependendo da permissão desejada
          }
        }
      );

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError.message);
        throw updateError;
      }

      console.log('✅ Dados do usuário atualizados com sucesso!');

      // Criar/atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          full_name: userName,
          role: 'admin'
        });

      if (profileError) {
        console.warn('⚠️  Erro ao criar/atualizar perfil:', profileError.message);
      } else {
        console.log('✅ Perfil do usuário criado/atualizado!');
      }
    } else {
      console.log('📝 Criando novo usuário...');

      // Criar usuário usando Admin API
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: userName,
          role: 'admin' // ou 'user', dependendo da permissão desejada
        }
      });

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        throw createError;
      }

      console.log('✅ Usuário criado com sucesso!');
      console.log(`👤 ID do usuário: ${user.id}`);

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: userName,
          role: 'admin'
        });

      if (profileError) {
        console.warn('⚠️  Erro ao criar perfil:', profileError.message);
      } else {
        console.log('✅ Perfil do usuário criado!');
      }
    }

    console.log('\n🎉 Configuração do usuário concluída!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);

    if (error.message.includes('relation "profiles" does not exist')) {
      console.log('\n💡 Dica: Execute primeiro o script de correção do banco:');
      console.log('   node supabase/scripts/run-sql-fix.js');
    }
  }
}

createRafaelUser();