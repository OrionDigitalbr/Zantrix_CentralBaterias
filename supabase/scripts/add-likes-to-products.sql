-- Script para adicionar campo de likes na tabela products
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna likes_count na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. Criar índice para melhor performance nas consultas de likes
CREATE INDEX IF NOT EXISTS idx_products_likes_count ON products(likes_count);

-- 3. Criar tabela para rastrear likes individuais (opcional - para evitar likes duplicados)
CREATE TABLE IF NOT EXISTS product_likes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_ip VARCHAR(45), -- Para rastrear por IP quando não há usuário logado
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Para usuários logados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_ip), -- Evita likes duplicados por IP
  UNIQUE(product_id, user_id) -- Evita likes duplicados por usuário
);

-- 4. Habilitar RLS na tabela product_likes
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para product_likes
-- Permitir leitura para todos
CREATE POLICY "product_likes_select_policy" ON product_likes
FOR SELECT USING (true);

-- Permitir inserção para todos (com validação no código)
CREATE POLICY "product_likes_insert_policy" ON product_likes
FOR INSERT WITH CHECK (true);

-- Permitir deleção apenas do próprio like
CREATE POLICY "product_likes_delete_policy" ON product_likes
FOR DELETE USING (
  user_id = auth.uid() OR 
  (user_id IS NULL AND user_ip IS NOT NULL)
);

-- 6. Criar função para incrementar likes
CREATE OR REPLACE FUNCTION increment_product_likes(product_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE products 
  SET likes_count = likes_count + 1 
  WHERE id = product_id_param;
  
  SELECT likes_count INTO new_count 
  FROM products 
  WHERE id = product_id_param;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para decrementar likes
CREATE OR REPLACE FUNCTION decrement_product_likes(product_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE products 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = product_id_param;
  
  SELECT likes_count INTO new_count 
  FROM products 
  WHERE id = product_id_param;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Atualizar contadores existentes (opcional - se quiser manter os likes simulados atuais)
-- UPDATE products SET likes_count = FLOOR(RANDOM() * 50) + (id % 10) * 5 WHERE likes_count = 0;

COMMENT ON COLUMN products.likes_count IS 'Contador de likes/amei do produto';
COMMENT ON TABLE product_likes IS 'Tabela para rastrear likes individuais e evitar duplicatas';
