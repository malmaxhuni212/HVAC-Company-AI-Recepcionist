
-- has_role must be callable by authenticated users for RLS policies to work
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
