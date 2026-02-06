-- Adiciona coluna image_url na tabela categories para suportar imagens personalizadas
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN categories.image_url IS 'URL da imagem personalizada da categoria (opcional, fallback para icon)';
