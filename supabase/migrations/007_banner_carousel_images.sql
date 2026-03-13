-- Adiciona suporte a segunda imagem para carrossel automático nos banners
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS image_url_2 TEXT NULL,
  ADD COLUMN IF NOT EXISTS mobile_image_url_2 TEXT NULL,
  ADD COLUMN IF NOT EXISTS show_cta_button BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN banners.image_url_2 IS 'Segunda imagem desktop para carrossel (alternada a cada 5s se informada).';
COMMENT ON COLUMN banners.mobile_image_url_2 IS 'Segunda imagem mobile para carrossel (alternada a cada 5s se informada).';
COMMENT ON COLUMN banners.show_cta_button IS 'Exibe ou oculta o botão de CTA no banner de promoção.';
