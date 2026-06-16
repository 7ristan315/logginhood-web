-- Club session calendar: templates, instances, bookings, and keyholders.

-- 1. Session templates (recurring rules) --------------------------------
create table public.session_templates (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  name        text not null,
  location    text not null,
  description text,
  day_of_week int check (day_of_week between 0 and 6), -- 0=Sun … 6=Sat; null = one-off
  start_time  time not null,
  end_time    time not null,
  max_places  int not null default 20,
  is_active   bool not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.session_templates enable row level security;

create policy "Templates viewable by club members"
  on public.session_templates for select
  using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = session_templates.club_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "Chairmen can manage templates"
  on public.session_templates for all
  to authenticated
  using (public.club_role(club_id, auth.uid()) in ('chairman','records_keeper'))
  with check (public.club_role(club_id, auth.uid()) in ('chairman','records_keeper'));

-- 2. Individual session instances ----------------------------------------
create table public.sessions (
  id                    uuid primary key default gen_random_uuid(),
  template_id           uuid references public.session_templates(id) on delete set null,
  club_id               uuid not null references public.clubs(id) on delete cascade,
  name                  text not null,
  location              text not null,
  description           text,
  session_date          date not null,
  start_time            time not null,
  end_time              time not null,
  max_places            int not null default 20,
  is_cancelled          bool not null default false,
  keyholder_alert_sent  bool not null default false,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Sessions viewable by club members"
  on public.sessions for select
  using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = sessions.club_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "Chairmen can manage sessions"
  on public.sessions for all
  to authenticated
  using (public.club_role(club_id, auth.uid()) in ('chairman','records_keeper'))
  with check (public.club_role(club_id, auth.uid()) in ('chairman','records_keeper'));

create index sessions_club_date_idx on public.sessions (club_id, session_date);

-- 3. Session bookings -----------------------------------------------------
create table public.session_bookings (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  booked_at   timestamptz not null default now(),
  unique (session_id, profile_id)
);

alter table public.session_bookings enable row level security;

create policy "Bookings viewable by club members"
  on public.session_bookings for select
  using (
    exists (
      select 1 from public.sessions s
      join public.club_members cm on cm.club_id = s.club_id
      where s.id = session_bookings.session_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "Users can book themselves"
  on public.session_bookings for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can cancel their own booking"
  on public.session_bookings for delete
  to authenticated
  using (auth.uid() = profile_id);

-- 4. Keyholders -----------------------------------------------------------
create table public.keyholders (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  location    text not null,
  is_active   bool not null default true,
  created_at  timestamptz not null default now(),
  unique (club_id, profile_id, location)
);

alter table public.keyholders enable row level security;

create policy "Keyholders viewable by club members"
  on public.keyholders for select
  using (
    exists (
      select 1 from public.club_members cm
      where cm.club_id = keyholders.club_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "Chairmen can manage keyholders"
  on public.keyholders for all
  to authenticated
  using (public.club_role(club_id, auth.uid()) = 'chairman')
  with check (public.club_role(club_id, auth.uid()) = 'chairman');
