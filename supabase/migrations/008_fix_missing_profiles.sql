-- Corrige usuários autenticados sem registro em public.profiles
-- (causa do erro "406 Not Acceptable" ao buscar /rest/v1/profiles?select=*&id=eq.<uuid>)

-- 1. Permite que o próprio usuário crie seu perfil caso ele não exista
--    (necessário para o self-heal feito no app no login)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 2. Backfill: cria o perfil para qualquer usuário de auth.users que ainda não tenha um
INSERT INTO public.profiles (id, email, name, phone)
SELECT
    u.id,
    COALESCE(u.email, u.raw_user_meta_data->>'email'),
    COALESCE(u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, u.raw_user_meta_data->>'email'), '@', 1)),
    COALESCE(u.phone, u.raw_user_meta_data->>'phone')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3. Backfill: garante que todo usuário tenha a role 'user'
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'user'
WHERE r.user_id IS NULL;
