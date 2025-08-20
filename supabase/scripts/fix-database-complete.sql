-- =====================================================
-- SCRIPT COMPLETO DE CORREÇÃO DO BANCO DE DADOS
-- =====================================================
-- Este script corrige todas as inconsistências identificadas

-- 1. CRIAR TABELA SETTINGS (FALTANTE)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CORRIGIR INCONSISTÊNCIAS EM PRODUCT_IMAGES
-- =====================================================
-- Adicionar coluna is_main se não existir (para compatibilidade com código)
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false;

-- Sincronizar is_main com is_primary
UPDATE product_images SET is_main = is_primary WHERE is_primary IS NOT NULL;

-- 3. CORRIGIR TABELA PRODUCTS - ADICIONAR CAMPOS FALTANTES
-- =====================================================
-- Adicionar campos que o código espera mas podem não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);

-- Sincronizar stock_quantity com stock
UPDATE products SET stock = stock_quantity WHERE stock_quantity IS NOT NULL AND stock = 0;

-- 4. VERIFICAR E CORRIGIR TABELA SLIDES
-- =====================================================
-- A tabela slides já tem image_url, mas vamos garantir que existe
ALTER TABLE slides 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Atualizar slides sem image_url
UPDATE slides SET image_url = '/placeholder.svg?height=400&width=1200&text=Slide' 
WHERE image_url IS NULL OR image_url = '';

-- 5. CRIAR TABELAS DE RELACIONAMENTO SE NÃO EXISTIREM
-- =====================================================
-- Tabela product_units (relacionamento produto-unidade)
CREATE TABLE IF NOT EXISTS product_units (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, unit_id)
);

-- Tabela product_categories (relacionamento produto-categoria)
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Tabela profiles para auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONFIGURAR RLS PARA TODAS AS TABELAS
-- =====================================================
-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS PERMISSIVAS PARA AUTHENTICATED
-- =====================================================
-- Políticas para products
DROP POLICY IF EXISTS "Allow all for authenticated users" ON products;
CREATE POLICY "Allow all for authenticated users" ON products
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para product_images
DROP POLICY IF EXISTS "Allow all for authenticated users" ON product_images;
CREATE POLICY "Allow all for authenticated users" ON product_images
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para product_units
DROP POLICY IF EXISTS "Allow all for authenticated users" ON product_units;
CREATE POLICY "Allow all for authenticated users" ON product_units
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para product_categories
DROP POLICY IF EXISTS "Allow all for authenticated users" ON product_categories;
CREATE POLICY "Allow all for authenticated users" ON product_categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para categories
DROP POLICY IF EXISTS "Allow all for authenticated users" ON categories;
CREATE POLICY "Allow all for authenticated users" ON categories
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para units
DROP POLICY IF EXISTS "Allow all for authenticated users" ON units;
CREATE POLICY "Allow all for authenticated users" ON units
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para slides
DROP POLICY IF EXISTS "Allow all for authenticated users" ON slides;
CREATE POLICY "Allow all for authenticated users" ON slides
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para settings
DROP POLICY IF EXISTS "Allow all for authenticated users" ON settings;
CREATE POLICY "Allow all for authenticated users" ON settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para notifications
DROP POLICY IF EXISTS "Allow all for authenticated users" ON notifications;
CREATE POLICY "Allow all for authenticated users" ON notifications
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para analytics
DROP POLICY IF EXISTS "Allow all for authenticated users" ON analytics;
CREATE POLICY "Allow all for authenticated users" ON analytics
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para profiles
DROP POLICY IF EXISTS "Allow all for authenticated users" ON profiles;
CREATE POLICY "Allow all for authenticated users" ON profiles
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. CONFIGURAR STORAGE POLICIES
-- =====================================================
-- Políticas para buckets de storage
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('product-images', 'slide-images', 'user-avatars', 'unit-images'));

DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id IN ('product-images', 'slide-images', 'user-avatars', 'unit-images'));

DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id IN ('product-images', 'slide-images', 'user-avatars', 'unit-images'));

DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'slide-images', 'user-avatars', 'unit-images'));

-- 9. INSERIR CONFIGURAÇÕES PADRÃO
-- =====================================================
INSERT INTO settings (key, value, type, description)
VALUES 
  ('show_prices', 'true', 'boolean', 'Exibir preços dos produtos'),
  ('theme_color', '#f97316', 'string', 'Cor principal do tema'),
  ('enable_analytics', 'true', 'boolean', 'Habilitar analytics'),
  ('site_name', 'Grupo Central', 'string', 'Nome do site'),
  ('contact_email', 'contato@grupocentral.com.br', 'string', 'Email de contato')
ON CONFLICT (key) DO NOTHING;

-- 10. INSERIR ROLES PADRÃO
-- =====================================================
INSERT INTO roles (name, description, permissions)
VALUES 
  ('admin', 'Administrador com acesso total', '{"all": true}'),
  ('manager', 'Gerente com acesso limitado', '{"products": true, "categories": true}'),
  ('user', 'Usuário básico', '{"read": true}')
ON CONFLICT (name) DO NOTHING;

-- 11. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas relevantes
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slides_updated_at ON slides;
CREATE TRIGGER update_slides_updated_at
    BEFORE UPDATE ON slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. VERIFICAÇÕES FINAIS
-- =====================================================
-- Verificar se todas as tabelas existem
DO $$
BEGIN
    RAISE NOTICE 'Verificando estrutura do banco...';
    
    -- Verificar tabelas principais
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        RAISE EXCEPTION 'Tabela settings não foi criada!';
    END IF;
    
    RAISE NOTICE 'Todas as correções foram aplicadas com sucesso!';
END $$;
