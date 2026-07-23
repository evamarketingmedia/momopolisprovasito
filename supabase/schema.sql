-- Momopolis — Supabase schema
-- Run this once in your project's SQL Editor (supabase.com/dashboard → SQL Editor → New query).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Bookings (party/event reservation requests)
-- ─────────────────────────────────────────────────────────────
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  date date not null unique,
  party_type text not null,
  participants integer not null check (participants > 0),
  message text,
  locale text not null default 'it',
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- No public policies: all access goes through the server API route using
-- the service role key, which bypasses RLS. This keeps customer data
-- (name, email, phone) unreadable to anon/public clients.

-- ─────────────────────────────────────────────────────────────
-- Gallery images (Galleria page — filterable by category)
-- ─────────────────────────────────────────────────────────────
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('playground', 'parties', 'events')),
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_images enable row level security;

-- Gallery photos are meant to be public (they're shown on the site to everyone).
create policy "Public can read gallery images"
  on gallery_images for select
  using (true);

-- Seed data: the placeholder Unsplash photos currently on the site.
-- Replace these rows (or add new ones) with real Momopolis photography
-- straight from the Supabase Table Editor — no code changes needed.
-- NOTE: run this insert once. Running it again will duplicate rows —
-- if you need to reseed, first run: truncate table gallery_images;
insert into gallery_images (category, url, sort_order) values
  ('playground', 'https://images.unsplash.com/photo-1606733894347-7cb201dc810b?w=800&h=600&fit=crop&q=80&auto=format', 1),
  ('playground', 'https://images.unsplash.com/photo-1623231411138-b1b47f72c91c?w=800&h=600&fit=crop&q=80&auto=format', 2),
  ('playground', 'https://images.unsplash.com/photo-1605813968977-07f8b75c0bf0?w=800&h=600&fit=crop&q=80&auto=format', 3),
  ('playground', 'https://images.unsplash.com/photo-1569466126773-842a038eae3e?w=800&h=600&fit=crop&q=80&auto=format', 4),
  ('playground', 'https://images.unsplash.com/photo-1641686288048-b1994a394b95?w=800&h=600&fit=crop&q=80&auto=format', 5),
  ('playground', 'https://images.unsplash.com/photo-1604921827342-b4bc94df162c?w=800&h=600&fit=crop&q=80&auto=format', 6),
  ('playground', 'https://images.unsplash.com/photo-1544438825-f1222acc39dc?w=800&h=600&fit=crop&q=80&auto=format', 7),
  ('parties', 'https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=800&h=600&fit=crop&q=80&auto=format', 8),
  ('parties', 'https://images.unsplash.com/photo-1608790672275-309c02d888ff?w=800&h=600&fit=crop&q=80&auto=format', 9),
  ('parties', 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800&h=600&fit=crop&q=80&auto=format', 10),
  ('parties', 'https://images.unsplash.com/photo-1509666537727-9154b6962292?w=800&h=600&fit=crop&q=80&auto=format', 11),
  ('parties', 'https://images.unsplash.com/photo-1516668557604-c8e814fdb184?w=800&h=600&fit=crop&q=80&auto=format', 12),
  ('parties', 'https://images.unsplash.com/photo-1615445565741-c60a9edd393f?w=800&h=600&fit=crop&q=80&auto=format', 13),
  ('parties', 'https://images.unsplash.com/photo-1688632107202-7902806ff3d4?w=800&h=600&fit=crop&q=80&auto=format', 14),
  ('events', 'https://images.unsplash.com/photo-1611596534346-94839c5622ab?w=800&h=600&fit=crop&q=80&auto=format', 15),
  ('events', 'https://images.unsplash.com/photo-1591171986440-5591a68ce6ef?w=800&h=600&fit=crop&q=80&auto=format', 16),
  ('events', 'https://images.unsplash.com/photo-1663627654773-d23a1750597d?w=800&h=600&fit=crop&q=80&auto=format', 17),
  ('events', 'https://images.unsplash.com/photo-1629862403793-332f8c1ceb0c?w=800&h=600&fit=crop&q=80&auto=format', 18),
  ('events', 'https://images.unsplash.com/photo-1542868796-20f2ddc9d41f?w=800&h=600&fit=crop&q=80&auto=format', 19),
  ('events', 'https://images.unsplash.com/photo-1759330203240-b89ccee8840f?w=800&h=600&fit=crop&q=80&auto=format', 20);
