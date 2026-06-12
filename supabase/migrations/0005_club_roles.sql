-- Multi-tier club roles: member, coach, records keeper, chairman.
-- Chairmen can manage other members' roles; new clubs automatically make
-- their creator the chairman.

-- 1. Migrate the old 'admin' role to 'chairman' and widen the role enum.
update public.club_members set role = 'chairman' where role = 'admin';

alter table public.club_members drop constraint club_members_role_check;
alter table public.club_members add constraint club_members_role_check
  check (role in ('member', 'coach', 'records_keeper', 'chairman'));

-- 2. Self-service joins are always as a plain member; elevated roles are
-- granted by a chairman afterwards.
drop policy "Users can join clubs themselves" on public.club_members;
create policy "Users can join clubs themselves"
  on public.club_members for insert
  to authenticated
  with check (auth.uid() = profile_id and role = 'member');

-- 3. Helper to read a member's role without recursive RLS checks.
create function public.club_role(p_club_id uuid, p_profile_id uuid)
returns text as $$
  select role from public.club_members
  where club_id = p_club_id and profile_id = p_profile_id;
$$ language sql stable security definer set search_path = public;

-- 4. Chairmen can update other members' roles and remove members.
create policy "Chairmen can update member roles"
  on public.club_members for update
  to authenticated
  using (public.club_role(club_id, auth.uid()) = 'chairman');

create policy "Chairmen can remove members"
  on public.club_members for delete
  to authenticated
  using (public.club_role(club_id, auth.uid()) = 'chairman');

-- 5. Automatically make a club's creator its chairman.
create function public.handle_new_club()
returns trigger as $$
begin
  insert into public.club_members (club_id, profile_id, role)
  values (new.id, new.created_by, 'chairman');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_club_created
  after insert on public.clubs
  for each row execute procedure public.handle_new_club();

-- 6. Backfill: make existing clubs' creators their chairman too.
insert into public.club_members (club_id, profile_id, role)
select id, created_by, 'chairman'
from public.clubs
where created_by is not null
on conflict (club_id, profile_id) do update set role = 'chairman';
