-- ── Bow Setups: the hub for all equipment ──
CREATE TABLE bow_setups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  bow_type text NOT NULL CHECK (bow_type IN ('Recurve','Compound','Barebow','Longbow')),
  is_active boolean DEFAULT false,

  -- Bow
  riser text,
  limbs text,
  draw_weight text,
  draw_length text,

  -- Equipment (JSONB — bow_type determines which are valid)
  sight jsonb,        -- {name, pin}  (Recurve, Compound)
  button jsonb,       -- {name, spring, position}  (Recurve, Compound, Barebow)
  clicker jsonb,      -- {type, position}  (Recurve, Compound)
  tab jsonb,          -- {name, size, finger_spacer, plate_material}  (Recurve, Barebow, Longbow)
  sling jsonb,        -- {type, name}  (Recurve, Compound, Barebow)
  release_aid jsonb,  -- {type, name}  (Compound)
  scope jsonb,        -- {magnification, housing_size}  (Compound)
  stabilisers jsonb,  -- {long_rod:{length,weight}, short_rods:{length,weight}, v_bar:{angle,dampers}, riser_weights:[{weight,position}]}

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bow_setups_profile ON bow_setups(profile_id);

-- ── Sight marks per distance ──
CREATE TABLE sight_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id uuid NOT NULL REFERENCES bow_setups(id) ON DELETE CASCADE,
  distance text NOT NULL,
  sight_number decimal,
  extension_bar integer,
  notes text,
  UNIQUE(setup_id, distance)
);

-- ── Crawl marks per distance (barebow / longbow) ──
CREATE TABLE crawl_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id uuid NOT NULL REFERENCES bow_setups(id) ON DELETE CASCADE,
  distance text NOT NULL,
  finger_position text CHECK (finger_position IN ('3 under', 'split')),
  anchor text CHECK (anchor IN ('lip', 'chin')),
  tab_count decimal,
  notes text,
  UNIQUE(setup_id, distance)
);

-- ── Arrow sets tied to a setup ──
CREATE TABLE setup_arrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id uuid NOT NULL REFERENCES bow_setups(id) ON DELETE CASCADE,
  name text NOT NULL,
  spine text,
  length text,
  point_weight text,
  fletching text,
  nock text,
  clicker_offset decimal,
  is_active boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ──
ALTER TABLE bow_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sight_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_arrows ENABLE ROW LEVEL SECURITY;

-- Users can manage their own setups
CREATE POLICY "Users manage own setups" ON bow_setups
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users manage own sight marks" ON sight_marks
  FOR ALL USING (setup_id IN (SELECT id FROM bow_setups WHERE profile_id = auth.uid()));

CREATE POLICY "Users manage own crawl marks" ON crawl_marks
  FOR ALL USING (setup_id IN (SELECT id FROM bow_setups WHERE profile_id = auth.uid()));

CREATE POLICY "Users manage own arrows" ON setup_arrows
  FOR ALL USING (setup_id IN (SELECT id FROM bow_setups WHERE profile_id = auth.uid()));

-- Public read for profiles (world rankings etc.)
CREATE POLICY "Setups viewable by all" ON bow_setups
  FOR SELECT USING (true);
