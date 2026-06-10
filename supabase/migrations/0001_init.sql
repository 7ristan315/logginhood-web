-- Logginhood archery hub: initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- 1. Profiles -----------------------------------------------------------
-- One row per auth user, created automatically on signup.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  gb_number text,
  gender text check (gender in ('Male', 'Female')),
  date_of_birth date,
  bow_type text check (bow_type in ('Recurve', 'Compound', 'Barebow', 'Longbow')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Clubs ----------------------------------------------------------------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.clubs enable row level security;

create policy "Clubs are viewable by everyone"
  on public.clubs for select
  using (true);

create policy "Authenticated users can create clubs"
  on public.clubs for insert
  to authenticated
  with check (auth.uid() = created_by);

-- 3. Club membership -------------------------------------------------------
create table public.club_members (
  club_id uuid references public.clubs (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (club_id, profile_id)
);

alter table public.club_members enable row level security;

create policy "Club membership is viewable by everyone"
  on public.club_members for select
  using (true);

create policy "Users can join clubs themselves"
  on public.club_members for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can leave clubs themselves"
  on public.club_members for delete
  to authenticated
  using (auth.uid() = profile_id);

-- 4. Scores -----------------------------------------------------------------
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete set null,
  round_name text not null,
  score integer not null,
  golds integer,
  shot_at date not null default current_date,
  status text not null default 'Practice' check (status in ('Practice', 'Competition', 'UKRS', 'WRS')),
  bow_type text check (bow_type in ('Recurve', 'Compound', 'Barebow', 'Longbow')),
  classification text,
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

create policy "Scores are viewable by everyone"
  on public.scores for select
  using (true);

create policy "Users can insert their own scores"
  on public.scores for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can update their own scores"
  on public.scores for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own scores"
  on public.scores for delete
  using (auth.uid() = profile_id);

create index scores_profile_id_idx on public.scores (profile_id);
create index scores_club_id_idx on public.scores (club_id);
