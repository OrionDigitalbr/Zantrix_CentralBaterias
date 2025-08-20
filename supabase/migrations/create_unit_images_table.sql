-- Criar tabela unit_images para armazenar imagens das unidades
-- Similar à estrutura de product_images

CREATE TABLE IF NOT EXISTS public.unit_images (
    id BIGSERIAL PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT fk_unit_images_unit_id 
        FOREIGN KEY (unit_id) 
        REFERENCES public.units(id) 
        ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_unit_images_unit_id ON public.unit_images(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_images_is_primary ON public.unit_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_unit_images_display_order ON public.unit_images(display_order);

-- Criar índice único para garantir apenas uma imagem primária por unidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_images_unique_primary 
    ON public.unit_images(unit_id) 
    WHERE is_primary = true;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_unit_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_unit_images_updated_at
    BEFORE UPDATE ON public.unit_images
    FOR EACH ROW
    EXECUTE FUNCTION update_unit_images_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.unit_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública das imagens
CREATE POLICY "unit_images_select_policy" ON public.unit_images
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização/exclusão apenas para usuários autenticados
CREATE POLICY "unit_images_insert_policy" ON public.unit_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "unit_images_update_policy" ON public.unit_images
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "unit_images_delete_policy" ON public.unit_images
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.unit_images IS 'Tabela para armazenar imagens das unidades';
COMMENT ON COLUMN public.unit_images.unit_id IS 'ID da unidade (referência para units.id)';
COMMENT ON COLUMN public.unit_images.image_url IS 'URL da imagem armazenada no storage';
COMMENT ON COLUMN public.unit_images.alt_text IS 'Texto alternativo para acessibilidade';
COMMENT ON COLUMN public.unit_images.is_primary IS 'Indica se é a imagem principal da unidade';
COMMENT ON COLUMN public.unit_images.display_order IS 'Ordem de exibição das imagens';
