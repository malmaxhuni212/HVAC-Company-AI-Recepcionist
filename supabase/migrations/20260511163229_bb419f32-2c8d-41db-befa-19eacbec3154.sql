-- Ensure malmaxhuni212@gmail.com has admin role only
DELETE FROM public.user_roles
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email = 'malmaxhuni212@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role FROM public.profiles WHERE email = 'malmaxhuni212@gmail.com';