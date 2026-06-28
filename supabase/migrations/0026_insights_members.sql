CREATE TABLE insights_members (
  id bigint generated always as identity primary key,
  profile_id uuid references auth.users(id) on delete cascade,
  tier text not null check (tier in ('starter', 'professional', 'enterprise', 'admin')),
  company_name text,
  brand_filter text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

CREATE UNIQUE INDEX insights_members_profile ON insights_members (profile_id);

ALTER TABLE insights_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership"
  ON insights_members FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all"
  ON insights_members FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_admin)
  );
