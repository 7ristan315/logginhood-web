-- Add a club website URL field to profiles, synced between the website
-- and the scoring app (Theme tab "Club website" link).
alter table public.profiles
  add column club_url text;
