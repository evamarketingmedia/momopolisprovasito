-- Momòpolis — amministratori gestiti con Supabase Auth
--
-- 1. Esegui questo file nel SQL Editor di Supabase.
-- 2. Crea l'utente da Authentication → Users → Add user.
-- 3. Copia l'UUID dell'utente e autorizzalo con:
--    insert into public.admin_users (user_id, email, display_name)
--    values ('UUID-UTENTE', 'email@esempio.ch', 'Nome');
-- 4. Per sospendere l'accesso senza eliminare l'utente:
--    update public.admin_users set active = false where user_id = 'UUID-UTENTE';

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Nessuna policy pubblica: la verifica avviene esclusivamente sul server
-- tramite la service role key.
