-- Ensure only malmaxhuni212@gmail.com is admin
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (SELECT user_id FROM public.profiles WHERE email = 'malmaxhuni212@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'client'::app_role
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id);

-- Seed sample technicians as real auth users
DO $$
DECLARE
  i int;
  new_id uuid;
  tech_email text;
BEGIN
  FOR i IN 1..4 LOOP
    tech_email := 'technician' || i || '@metroheating.local';
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = tech_email) THEN
      new_id := gen_random_uuid();
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        tech_email, crypt('TechPass123!', gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', 'Technician ' || i),
        false
      );
      INSERT INTO public.profiles (user_id, full_name, email)
      VALUES (new_id, 'Technician ' || i, tech_email)
      ON CONFLICT DO NOTHING;
      DELETE FROM public.user_roles WHERE user_id = new_id;
      INSERT INTO public.user_roles (user_id, role) VALUES (new_id, 'technician');
    END IF;
  END LOOP;
END $$;