# Scripts do Supabase - Grupo Central

Esta pasta contém todos os scripts organizados para configuração e manutenção do banco de dados Supabase.

## Estrutura de Pastas

### `/setup/`
Scripts para configuração inicial do banco de dados:
- `01-create-tables.js` - Criação de todas as tabelas
- `02-create-buckets.js` - Criação dos buckets de storage
- `03-setup-rls.js` - Configuração das políticas RLS
- `04-insert-sample-data.js` - Inserção de dados de exemplo

### `/maintenance/`
Scripts para manutenção e atualizações:
- `fix-rls-policies.js` - Correção de políticas RLS
- `update-schema.js` - Atualizações de schema
- `backup-data.js` - Backup de dados importantes

### `/testing/`
Scripts para testes e verificações:
- `test-database.js` - Teste geral do banco
- `test-products.js` - Teste específico de produtos
- `test-analytics.js` - Teste do sistema de analytics
- `show-all-data.js` - Visualização de todos os dados

### `/utils/`
Utilitários e helpers:
- `describe-tables.js` - Descrição das tabelas
- `check-connections.js` - Verificação de conexões
- `cleanup.js` - Limpeza de dados de teste

## Como Usar

1. **Configuração Inicial** (apenas uma vez):
   ```bash
   node supabase/scripts/setup/01-create-tables.js
   node supabase/scripts/setup/02-create-buckets.js
   node supabase/scripts/setup/03-setup-rls.js
   node supabase/scripts/setup/04-insert-sample-data.js
   ```

2. **Testes e Verificações**:
   ```bash
   node supabase/scripts/testing/test-database.js
   node supabase/scripts/testing/test-products.js
   ```

3. **Manutenção**:
   ```bash
   node supabase/scripts/maintenance/fix-rls-policies.js
   ```

## Variáveis de Ambiente

Todos os scripts requerem as seguintes variáveis no arquivo `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notas Importantes

- Execute os scripts na ordem correta para evitar erros de dependência
- Sempre faça backup antes de executar scripts de manutenção
- Os scripts de teste são seguros e não modificam dados de produção
