// Script para executar correções SQL no banco de dados
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function runSQLFix() {
  try {
    console.log('🔧 Executando correções no banco de dados...\n');

    // Ler arquivo SQL
    const sqlFilePath = path.join(__dirname, 'fix-database-complete.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir em comandos individuais (separados por ponto e vírgula)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comentários e comandos vazios
      if (command.startsWith('--') || command.trim() === '') {
        continue;
      }

      try {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });

        if (error) {
          // Alguns erros são esperados (como "já existe")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            console.log(`   ⚠️  ${error.message}`);
          } else {
            console.error(`   ❌ Erro: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Sucesso`);
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Erro inesperado: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Resumo da execução:');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Todas as correções foram aplicadas com sucesso!');
    } else {
      console.log('\n⚠️  Algumas correções falharam, mas o sistema pode ainda funcionar.');
    }

    // Verificar se as tabelas principais existem
    console.log('\n🔍 Verificando estrutura do banco...');
    
    const tablesToCheck = ['products', 'product_images', 'categories', 'units', 'settings', 'profiles'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ Tabela ${table}: ${err.message}`);
      }
    }

    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: node supabase/scripts/create-admin-user.js');
    console.log('2. Inicie o servidor: npm run dev');
    console.log('3. Acesse: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Erro ao executar correções:', error.message);
  }
}

runSQLFix();
