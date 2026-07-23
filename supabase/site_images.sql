-- Momopolis — "site images" table (hero / about / events photos managed from /admin)
-- Run this once in the SQL Editor, in addition to schema.sql.

create table if not exists site_images (
  key text primary key,
  url text not null,
  updated_at timestamptz not null default now()
);

alter table site_images enable row level security;

-- Public read (these images are shown on the public site); writes only
-- happen server-side through the admin panel using the service role key.
create policy "Public can read site images"
  on site_images for select
  using (true);

-- Seed with the photos currently hardcoded in src/data/gallery.ts (featureImages).
-- Safe to run once — running twice will fail on the primary key, which is fine.
insert into site_images (key, url) values
  ('hero_slide', 'https://images.unsplash.com/photo-1691903835735-d7d3e45bc238'),
  ('hero_jump', 'https://images.unsplash.com/photo-1620700374542-d129058c0d0a'),
  ('about_story', 'https://images.unsplash.com/photo-1631512700403-ee66a05fd497'),
  ('about_team', 'https://images.unsplash.com/photo-1704747199445-85f81dfd8605'),
  ('zones_a', 'https://images.unsplash.com/photo-1631512700356-574da7748a44'),
  ('zones_b', 'https://images.unsplash.com/photo-1663579169382-2f30a1b26bcb'),
  ('zones_c', 'https://images.unsplash.com/photo-1689609523729-00a50c278c18'),
  ('event_birthday', 'https://images.unsplash.com/photo-1631397831385-b6023fd545ac'),
  ('event_class', 'https://images.unsplash.com/photo-1553710120-23dd1551da41'),
  ('event_corporate', 'https://images.unsplash.com/photo-1607977229409-8c278bc34628'),
  ('event_themed', 'https://images.unsplash.com/photo-1585645187037-a27267194293')
on conflict (key) do nothing;
