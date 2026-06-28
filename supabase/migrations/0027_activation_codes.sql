CREATE TABLE activation_codes (
  id bigint generated always as identity primary key,
  code text not null unique,
  brand text not null,
  product_name text,
  product_category text check (product_category in ('riser', 'limbs', 'sight', 'arrows', 'stabiliser', 'release_aid', 'scope', 'button', 'tab', 'other')),
  bow_type text check (bow_type in ('Recurve', 'Compound', 'Barebow', 'Longbow')),
  batch_name text,
  premium_months integer not null default 12,
  insights_member_id bigint references insights_members(id),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

CREATE INDEX activation_codes_brand ON activation_codes (brand);
CREATE INDEX activation_codes_batch ON activation_codes (batch_name);
CREATE INDEX activation_codes_redeemed ON activation_codes (redeemed_by) WHERE redeemed_by IS NOT NULL;

ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read unredeemed codes by code value"
  ON activation_codes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can redeem"
  ON activation_codes FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND redeemed_by IS NULL
    AND is_active = true
  ) WITH CHECK (
    redeemed_by = auth.uid()
  );

CREATE POLICY "Insights admins can manage codes"
  ON activation_codes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM insights_members
      WHERE profile_id = auth.uid()
      AND tier IN ('admin', 'enterprise')
      AND is_active = true
    )
  );

CREATE TABLE premium_subscriptions (
  id bigint generated always as identity primary key,
  profile_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('stripe', 'activation_code', 'trial', 'admin')),
  activation_code_id bigint references activation_codes(id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

CREATE UNIQUE INDEX premium_sub_active ON premium_subscriptions (profile_id) WHERE is_active = true;

ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON premium_subscriptions FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "System can manage subscriptions"
  ON premium_subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_admin)
  );
