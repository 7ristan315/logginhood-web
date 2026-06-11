-- Add club link and age category to profiles, so the profile page on the
-- website and the scoring app can share the same source of truth.
alter table public.profiles
  add column club_id uuid references public.clubs (id) on delete set null,
  add column age_category text check (
    age_category in ('U12', 'U14', 'U15', 'U16', 'U18', 'Senior', '50+', '60+')
  );
