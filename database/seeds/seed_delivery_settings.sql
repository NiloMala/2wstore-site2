-- Seed to set free delivery threshold to R$ 600.00
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.delivery_settings) THEN
    UPDATE public.delivery_settings
    SET free_delivery_threshold = 600.00,
        updated_at = NOW();
  ELSE
    INSERT INTO public.delivery_settings (is_motoboy_enabled, minimum_order, free_delivery_threshold)
    VALUES (true, 50.00, 600.00);
  END IF;
END
$$;
