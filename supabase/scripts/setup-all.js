// Script principal para executar toda a configuração do Supabase
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 CONFIGURAÇÃO COMPLETA DO SUPABASE - GRUPO CENTRAL\n');
console.log('Este script irá executar todos os passos de configuração em sequência.\n');

const scripts = [
  {
    name: '01 - Criar Tabelas',
    path: './setup/01-create-tables.js',
    description: 'Criação de todas as tabelas do banco de dados'
  },
  {
    name: '02 - Criar Buckets',
    path: './setup/02-create-buckets.js',
    description: 'Criação dos buckets de storage'
  },
  {
    name: '03 - Configurar RLS',
    path: './setup/03-setup-rls.js',
    description: 'Configuração das políticas de segurança RLS'
  },
  {
    name: '04 - Inserir Dados',
    path: './setup/04-insert-sample-data.js',
    description: 'Inserção de dados de exemplo'
  }
];

async function runScript(scriptPath, scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Executando: ${scriptName}`);
    console.log(`${'='.repeat(60)}\n`);

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.dirname(__filename)
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} - Concluído com sucesso!`);
        resolve();
      } else {
        console.log(`\n❌ ${scriptName} - Falhou com código ${code}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.log(`\n❌ ${scriptName} - Erro: ${error.message}`);
      reject(error);
    });
  });
}

async function setupAll() {
  try {
    console.log('📋 Scripts que serão executados:');
    scripts.forEach((script, index) => {
      console.log(`   ${index + 1}. ${script.name} - ${script.description}`);
    });

    console.log('\n⏱️ Iniciando configuração...');

    for (const script of scripts) {
      await runScript(script.path, script.name);
      
      // Pequena pausa entre scripts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('✅ Todos os scripts foram executados com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Execute: npm run dev');
    console.log('2. Acesse: http://localhost:3000');
    console.log('3. Teste o admin: http://localhost:3000/admin');
    console.log('4. Verifique se não há erros no console');
    
    console.log('\n🧪 Para testar a configuração:');
    console.log('   node supabase/scripts/testing/test-database.js');
    console.log('   node supabase/scripts/testing/show-all-data.js');

    console.log('\n🔧 Se houver problemas com RLS:');
    console.log('   node supabase/scripts/maintenance/fix-rls-policies.js');

  } catch (error) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('❌ ERRO NA CONFIGURAÇÃO');
    console.log(`${'='.repeat(60)}\n`);
    
    console.log('A configuração foi interrompida devido a um erro.');
    console.log('Erro:', error.message);
    
    console.log('\n🔧 Para resolver:');
    console.log('1. Verifique as credenciais no .env.local');
    console.log('2. Confirme se o projeto Supabase está ativo');
    console.log('3. Execute os scripts individualmente para identificar o problema');
    
    process.exit(1);
  }
}

// Verificar se as variáveis de ambiente estão configuradas
require('dotenv').config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ ERRO: Variáveis de ambiente não encontradas!');
  console.log('\nVerifique se o arquivo .env.local contém:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Verificar se o usuário quer executar
const args = process.argv.slice(2);
if (args.includes('--run')) {
  setupAll();
} else {
  console.log('⚠️ ATENÇÃO: Este script irá configurar completamente o banco de dados.');
  console.log('Certifique-se de que:');
  console.log('1. As credenciais do Supabase estão corretas no .env.local');
  console.log('2. O projeto Supabase está ativo e acessível');
  console.log('3. Você tem permissões de administrador no projeto');
  console.log('\nPara executar a configuração, use:');
  console.log('   node supabase/scripts/setup-all.js --run');
}
