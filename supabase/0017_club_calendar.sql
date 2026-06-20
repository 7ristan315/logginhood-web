-- Run AFTER 0014_sessions.sql
-- Adds: formal club_locations table + per-session assigned keyholder

-- Formal location records (sessions.location text stays for FK-free flexibility)
CREATE TABLE IF NOT EXISTS club_locations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name         text NOT NULL,
  address      text,
  access_notes text,         -- e.g. "key is in lockbox code 1234"
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, name)
);

ALTER TABLE club_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members read locations" ON club_locations
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Chairmen manage locations" ON club_locations
  FOR ALL USING (
    public.club_role(club_id, auth.uid()) IN ('chairman','secretary','records_keeper')
  );

-- Allow a specific member to be assigned as keyholder for a session instance
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS assigned_keyholder_id uuid REFERENCES profiles(id);
