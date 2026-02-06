-- Tabela para configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão da seção promoção
INSERT INTO site_settings (key, value, description) VALUES
  ('promo_default_subtitle', '🔥 Promoção Especial', 'Subtítulo padrão da seção promoção'),
  ('promo_default_title', 'ATÉ 40% OFF EM PEÇAS SELECIONADAS', 'Título padrão da seção promoção'),
  ('promo_default_description', 'Aproveite descontos exclusivos na coleção de inverno. Por tempo limitado!', 'Descrição padrão da seção promoção'),
  ('promo_default_link', '/catalogo?filter=sale', 'Link padrão do botão da seção promoção'),
  ('promo_show_without_banner', 'true', 'Mostrar seção promoção mesmo sem banner cadastrado')
ON CONFLICT (key) DO NOTHING;

-- Permitir leitura pública
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings" ON site_settings
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated update settings" ON site_settings
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
