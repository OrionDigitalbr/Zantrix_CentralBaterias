-- Script para corrigir a estrutura da tabela slides
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna image_url se não existir
ALTER TABLE slides 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Adicionar outras colunas necessárias
ALTER TABLE slides 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- 3. Migrar dados existentes
-- Copiar image_pc para image_url onde image_url for null
UPDATE slides 
SET image_url = COALESCE(image_pc, '/placeholder.svg?height=400&width=1200&text=Slide')
WHERE image_url IS NULL;

-- 4. Migrar campo 'link' para 'link_url'
UPDATE slides 
SET link_url = link 
WHERE link_url IS NULL AND link IS NOT NULL;

-- 5. Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'slides' 
ORDER BY ordinal_position;

-- 6. Mostrar dados atuais
SELECT id, title, image_url, link_url, subtitle, button_text, active 
FROM slides 
ORDER BY display_order;
