-- Let platform admins manage membership (role changes, removals) across all clubs.
create policy "Platform admins can update member roles"
  on public.club_members for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and platform_admin
    )
  );

create policy "Platform admins can remove members"
  on public.club_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and platform_admin
    )
  );
