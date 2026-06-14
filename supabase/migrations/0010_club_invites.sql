-- Allow signup links to carry an invite_club_id, so a new user is
-- automatically added as a pending member of the inviting club.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  invite_club uuid;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);

  invite_club := (new.raw_user_meta_data ->> 'invite_club_id')::uuid;
  if invite_club is not null then
    insert into public.club_members (club_id, profile_id, role, status)
    values (invite_club, new.id, 'member', 'pending');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
