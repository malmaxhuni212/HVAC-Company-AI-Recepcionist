-- Restore admin
DELETE FROM public.user_roles
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email='malmaxhuni212@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role FROM public.profiles WHERE email='malmaxhuni212@gmail.com';

-- Safeguard: prevent removing admin from this email and prevent giving admin to anyone else
CREATE OR REPLACE FUNCTION public.protect_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  protected_user_id uuid;
BEGIN
  SELECT user_id INTO protected_user_id FROM public.profiles WHERE email='malmaxhuni212@gmail.com' LIMIT 1;

  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin' AND OLD.user_id = protected_user_id THEN
      RAISE EXCEPTION 'Cannot remove admin role from primary admin';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') THEN
    IF NEW.role = 'admin' AND NEW.user_id <> protected_user_id THEN
      RAISE EXCEPTION 'Only malmaxhuni212@gmail.com may hold the admin role';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_admin_role_trg ON public.user_roles;
CREATE TRIGGER protect_admin_role_trg
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_role();