create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;

create policy "Anyone can submit contact form"
on public.contact_submissions for insert
to anon, authenticated
with check (true);

create policy "Admins can view contact submissions"
on public.contact_submissions for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));