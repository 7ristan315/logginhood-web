-- Link scores to the setup that produced them
ALTER TABLE scores ADD COLUMN IF NOT EXISTS setup_id uuid REFERENCES bow_setups(id) ON DELETE SET NULL;

-- Track setup version (increments on each save)
ALTER TABLE bow_setups ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Archive previous setup configs on change
CREATE TABLE IF NOT EXISTS bow_setup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id uuid NOT NULL REFERENCES bow_setups(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_setup_history_setup
  ON bow_setup_history(setup_id, version DESC);

ALTER TABLE bow_setup_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own setup history" ON bow_setup_history
    FOR ALL USING (setup_id IN (SELECT id FROM bow_setups WHERE profile_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
