-- Allow platform admins to delete clubs (e.g. duplicates or rejected proposals).
create policy "Platform admins can delete clubs"
  on public.clubs for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and platform_admin
    )
  );
