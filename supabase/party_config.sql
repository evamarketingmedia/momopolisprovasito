create table if not exists public.party_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.party_config enable row level security;

-- L’accesso avviene esclusivamente dal server tramite service role.
