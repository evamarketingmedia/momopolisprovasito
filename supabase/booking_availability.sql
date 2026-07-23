-- Momopolis — capacity-based availability for bookings
-- Run this once in the SQL Editor, in addition to schema.sql and site_images.sql.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE / guarded DO blocks).
-- Non-destructive: existing rows in `bookings` are kept; new columns get a safe default.

-- ─────────────────────────────────────────────────────────────
-- 1. booking_availability — admin-defined capacity per date (+ optional time slot)
-- ─────────────────────────────────────────────────────────────
create table if not exists booking_availability (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time,
  end_time time,
  capacity integer not null check (capacity > 0),
  is_available boolean not null default true,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_availability_time_order
    check (start_time is null or end_time is null or end_time > start_time)
);

-- One slot per date+time combination (NULL start_time = "whole day" slot;
-- Postgres does not treat two NULLs as duplicates, so whole-day slots aren't
-- enforced unique here — the admin UI prevents creating an obvious duplicate).
create unique index if not exists booking_availability_date_time_key
  on booking_availability (date, start_time);

create index if not exists booking_availability_date_idx on booking_availability (date);

alter table booking_availability enable row level security;

drop policy if exists "Public can read availability" on booking_availability;
create policy "Public can read availability"
  on booking_availability for select
  using (true);

-- Keep `updated_at` current on every edit (used by the admin dashboard).
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists booking_availability_set_updated_at on booking_availability;
create trigger booking_availability_set_updated_at
  before update on booking_availability
  for each row
  execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. bookings — link each booking to a slot, add status, drop old 1-per-date rule
-- ─────────────────────────────────────────────────────────────
alter table bookings add column if not exists availability_id uuid references booking_availability(id) on delete set null;
alter table bookings add column if not exists start_time time;
alter table bookings add column if not exists end_time time;
alter table bookings add column if not exists status text not null default 'confirmed';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_status_check') then
    alter table bookings add constraint bookings_status_check
      check (status in ('pending', 'confirmed', 'cancelled'));
  end if;
end $$;

-- The old model allowed exactly one booking per date. Capacity replaces it:
-- many bookings can now share a date (and even a specific time slot) as long
-- as the sum of their `participants` stays within `booking_availability.capacity`.
alter table bookings drop constraint if exists bookings_date_key;

create index if not exists bookings_availability_id_idx on bookings (availability_id);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_date_idx on bookings (date);

-- ─────────────────────────────────────────────────────────────
-- 3. Read model: availability + live remaining-seats count
-- ─────────────────────────────────────────────────────────────
create or replace view booking_availability_status as
select
  ba.id,
  ba.date,
  ba.start_time,
  ba.end_time,
  ba.capacity,
  ba.is_available,
  ba.internal_note,
  ba.created_at,
  ba.updated_at,
  coalesce(b.booked, 0)::integer as booked_count,
  (ba.capacity - coalesce(b.booked, 0))::integer as remaining
from booking_availability ba
left join (
  select availability_id, sum(participants) as booked
  from bookings
  where status <> 'cancelled' and availability_id is not null
  group by availability_id
) b on b.availability_id = ba.id;

-- ─────────────────────────────────────────────────────────────
-- 4. Atomic booking creation — prevents overbooking under concurrent requests
-- ─────────────────────────────────────────────────────────────
create or replace function create_booking(
  p_availability_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_participants integer,
  p_party_type text,
  p_message text,
  p_locale text
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot booking_availability%rowtype;
  v_booked integer;
  v_remaining integer;
  v_booking bookings%rowtype;
begin
  if p_participants is null or p_participants < 1 then
    raise exception 'INVALID_PARTICIPANTS';
  end if;

  -- Row lock: concurrent calls for the same slot serialize here, so the
  -- remaining-seats check below always sees committed, up-to-date counts.
  select * into v_slot
  from booking_availability
  where id = p_availability_id
  for update;

  if not found then
    raise exception 'AVAILABILITY_NOT_FOUND';
  end if;

  if not v_slot.is_available or v_slot.date < current_date then
    raise exception 'AVAILABILITY_CLOSED';
  end if;

  select coalesce(sum(participants), 0) into v_booked
  from bookings
  where availability_id = p_availability_id
    and status <> 'cancelled';

  v_remaining := v_slot.capacity - v_booked;

  if p_participants > v_remaining then
    raise exception 'NOT_ENOUGH_SEATS';
  end if;

  insert into bookings (
    availability_id, date, start_time, end_time,
    name, email, phone, party_type, participants, message, locale, status
  ) values (
    v_slot.id, v_slot.date, v_slot.start_time, v_slot.end_time,
    p_name, p_email, p_phone, p_party_type, p_participants, p_message, p_locale, 'confirmed'
  )
  returning * into v_booking;

  return v_booking;
end;
$$;
