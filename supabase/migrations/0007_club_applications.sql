-- Club join applications: joining a club creates a pending application that
-- a chairman must approve before the user becomes a full member.

alter table public.club_members
  add column status text not null default 'pending' check (status in ('pending', 'approved'));

-- Grandfather in existing memberships.
update public.club_members set status = 'approved';

-- Self-joins create a pending application, not an approved membership.
drop policy "Users can join clubs themselves" on public.club_members;
create policy "Users can join clubs themselves"
  on public.club_members for insert
  to authenticated
  with check (auth.uid() = profile_id and role = 'member' and status = 'pending');

-- A club's creator is added as an already-approved chairman.
create or replace function public.handle_new_club()
returns trigger as $$
begin
  insert into public.club_members (club_id, profile_id, role, status)
  values (new.id, new.created_by, 'chairman', 'approved');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
