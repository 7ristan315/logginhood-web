-- Chairman status requires admin approval (granted when the club is
-- verified, not at proposal time), and clubs can declare an official
-- contact email/domain to help admins confirm the chairman's identity.

alter table public.clubs add column official_email text;

-- Store each profile's email (from auth.users) so admins can compare it
-- against a club's declared official email/domain.
alter table public.profiles add column email text;

update public.profiles p set email = u.email
from auth.users u
where p.id = u.id;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- A club's creator becomes chairman only once the club is verified.
create or replace function public.handle_new_club()
returns trigger as $$
begin
  insert into public.club_members (club_id, profile_id, role, status)
  values (new.id, new.created_by, 'chairman', 'pending');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Any existing pending clubs: their creator's chairman membership should
-- also be pending until the club is verified.
update public.club_members cm
set status = 'pending'
from public.clubs c
where cm.club_id = c.id
  and cm.profile_id = c.created_by
  and cm.role = 'chairman'
  and c.status = 'pending';
