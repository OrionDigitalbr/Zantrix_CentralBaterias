-- Script para corrigir schema da tabela categories
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna show_in_filters se não existir
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS show_in_filters BOOLEAN DEFAULT true;

-- 2. Verificar se a coluna featured existe, se não, criar
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 3. Atualizar valores padrão para registros existentes
UPDATE categories 
SET show_in_filters = true 
WHERE show_in_filters IS NULL;

UPDATE categories 
SET featured = false 
WHERE featured IS NULL;

-- 4. Comentários para documentação
COMMENT ON COLUMN categories.featured IS 'Indica se a categoria deve ser destacada na página inicial';
COMMENT ON COLUMN categories.show_in_filters IS 'Indica se a categoria deve aparecer nos filtros de produtos';

-- 5. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;
