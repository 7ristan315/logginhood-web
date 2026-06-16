-- Online competitions with virtual trophy cabinet.

-- 1. Competitions ---------------------------------------------------------
create table public.competitions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  host_id      uuid not null references public.profiles(id),
  club_id      uuid references public.clubs(id) on delete set null,
  round_name   text not null,
  bow_type     text check (bow_type in ('Recurve','Compound','Barebow','Longbow')),
  start_date   date not null,
  end_date     date not null,
  max_entries  int,
  has_prizes   bool not null default true,
  trophies_awarded bool not null default false,
  status       text not null default 'upcoming'
               check (status in ('upcoming','active','completed','cancelled')),
  created_at   timestamptz not null default now(),
  check (end_date >= start_date)
);

alter table public.competitions enable row level security;

create policy "Competitions are viewable by everyone"
  on public.competitions for select using (true);

-- Elevated club members and platform admins can create competitions.
create policy "Elevated members can create competitions"
  on public.competitions for insert
  to authenticated
  with check (
    auth.uid() = host_id
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.platform_admin = true
      )
      or
      exists (
        select 1 from public.club_members cm
        where cm.profile_id = auth.uid()
          and cm.role in ('coach','records_keeper','chairman')
      )
    )
  );

-- Host can update/cancel their own competitions.
create policy "Host can update competition"
  on public.competitions for update
  to authenticated
  using (auth.uid() = host_id);

create index competitions_status_idx on public.competitions (status, start_date);

-- 2. Competition entries --------------------------------------------------
create table public.competition_entries (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  score          int not null check (score >= 0),
  bow_type       text check (bow_type in ('Recurve','Compound','Barebow','Longbow')),
  score_id       uuid references public.scores(id) on delete set null,
  notes          text,
  entered_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (competition_id, profile_id)
);

alter table public.competition_entries enable row level security;

create policy "Entries are viewable by everyone"
  on public.competition_entries for select using (true);

create policy "Authenticated users can enter competitions"
  on public.competition_entries for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can update their own entry"
  on public.competition_entries for update
  to authenticated
  using (auth.uid() = profile_id);

create policy "Users can withdraw their entry"
  on public.competition_entries for delete
  to authenticated
  using (auth.uid() = profile_id);

-- 3. Trophies -------------------------------------------------------------
create table public.trophies (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  position       int not null check (position in (1,2,3)),
  awarded_at     timestamptz not null default now(),
  unique (competition_id, profile_id),
  unique (competition_id, position)
);

alter table public.trophies enable row level security;

create policy "Trophies are viewable by everyone"
  on public.trophies for select using (true);

-- Only the competition host (or platform admin) can award trophies.
create policy "Host can award trophies"
  on public.trophies for insert
  to authenticated
  with check (
    exists (
      select 1 from public.competitions c
      where c.id = trophies.competition_id
        and (
          c.host_id = auth.uid()
          or
          exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.platform_admin = true
          )
        )
    )
  );
