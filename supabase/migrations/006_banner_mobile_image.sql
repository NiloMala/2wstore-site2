-- Adiciona suporte a imagem separada para dispositivos móveis nos banners
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS mobile_image_url TEXT NULL;

COMMENT ON COLUMN banners.mobile_image_url IS 'URL da imagem otimizada para dispositivos móveis. Se nulo, usa image_url.';
