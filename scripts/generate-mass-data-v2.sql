-- Add second bow type setups for ~200 existing users (multi-discipline archers)
-- Give some Recurve archers a Barebow setup, some Compound archers a Recurve, etc.

INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, sight, button, tab, colour)
SELECT p.id, 'Indoor Barebow', 'Barebow', false,
  (ARRAY['Gillo GQ','Gillo GT','Spigarelli Revolution','MK Archery MK Alpha','Hoyt Xceed'])[floor(random()*5+1)],
  (ARRAY['Uukha VX+','Uukha SX+','Win&Win Wiawis NS-G','MK Archery MK Vera'])[floor(random()*4+1)],
  (ARRAY['30 lbs','32 lbs','34 lbs','36 lbs'])[floor(random()*4+1)],
  (ARRAY['27"','28"','29"'])[floor(random()*3+1)],
  NULL,
  json_build_object('brand','Shibuya'),
  json_build_object('brand','AAE'),
  '#059669'
FROM profiles p
WHERE p.bow_type = 'Recurve'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id AND bs.bow_type = 'Barebow')
ORDER BY random() LIMIT 100;

INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, sight, button, clicker, tab, colour)
SELECT p.id, 'Target Recurve', 'Recurve', false,
  (ARRAY['Hoyt Formula Xi','Win&Win Meta DX','WNS Motive FX','MK Archery MK Alpha'])[floor(random()*4+1)],
  (ARRAY['Hoyt Integra','Win&Win Wiawis NS-G','WNS Motive FX'])[floor(random()*3+1)],
  (ARRAY['34 lbs','36 lbs','38 lbs','40 lbs'])[floor(random()*4+1)],
  (ARRAY['28"','29"','30"'])[floor(random()*3+1)],
  json_build_object('brand','Shibuya','model','Ultima RC II'),
  json_build_object('brand','Beiter'),
  json_build_object('type','Blade'),
  json_build_object('brand','AAE'),
  '#2563EB'
FROM profiles p
WHERE p.bow_type IN ('Barebow','Compound')
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id AND bs.bow_type = 'Recurve')
ORDER BY random() LIMIT 80;

INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, draw_weight, draw_length, sight, release_aid, scope, colour)
SELECT p.id, 'Target Compound', 'Compound', false,
  (ARRAY['Hoyt Invicta','Mathews TRX','PSE Dominator Duo','Elite Echelon'])[floor(random()*4+1)],
  (ARRAY['50 lbs','55 lbs','60 lbs'])[floor(random()*3+1)],
  (ARRAY['28"','29"','30"'])[floor(random()*3+1)],
  json_build_object('brand','Axcel','model','Achieve CXL'),
  json_build_object('type','Hinge','brand','Carter'),
  json_build_object('brand','Axcel'),
  '#DC2626'
FROM profiles p
WHERE p.bow_type = 'Recurve'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id AND bs.bow_type = 'Compound')
ORDER BY random() LIMIT 60;

-- Arrow sets for new setups
INSERT INTO setup_arrows (setup_id, name, spine, length, point_weight, is_active)
SELECT bs.id,
  CASE bs.bow_type
    WHEN 'Recurve' THEN (ARRAY['Easton X10','Easton ACE','Easton Carbon One','Easton RX7','Skylon Radius'])[floor(random()*5+1)]
    WHEN 'Compound' THEN (ARRAY['Easton X10 ProTour','Easton ProComp','Victory VAP TKO','Gold Tip Pierce'])[floor(random()*4+1)]
    WHEN 'Barebow' THEN (ARRAY['Easton ACE','Easton Carbon One','Skylon Radius','Skylon Brixton'])[floor(random()*4+1)]
    ELSE 'Easton Jazz'
  END,
  (ARRAY['400','500','550','600','700'])[floor(random()*5+1)],
  (ARRAY['28"','29"','30"'])[floor(random()*3+1)],
  (ARRAY['100gr','110gr','120gr'])[floor(random()*3+1)],
  true
FROM bow_setups bs WHERE NOT EXISTS (SELECT 1 FROM setup_arrows sa WHERE sa.setup_id = bs.id);

-- Generate massive indoor scores with progression
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(r.min_score, LEAST(r.max_score,
    (r.base_lo + (abs(hashtext(bs.profile_id::text)) % (r.base_hi - r.base_lo)))
    + ((d.n::float / 25) * r.progression)::int
    + (random() * r.variance * 2 - r.variance)::int
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Invicta%' OR bs.riser ILIKE '%Meta DX%' OR bs.riser ILIKE '%Mathews%' THEN 25
        WHEN bs.riser ILIKE '%Gillo%' OR bs.riser ILIKE '%Titan%' THEN 15
        ELSE 0
      END
    + CASE
        WHEN bs.limbs ILIKE '%Wiawis%' OR bs.limbs ILIKE '%Integra%' OR bs.limbs ILIKE '%VX+%' THEN 15
        WHEN bs.limbs ILIKE '%Uukha%' THEN 12
        ELSE 0
      END
    + CASE bs.bow_type WHEN 'Compound' THEN 50 WHEN 'Recurve' THEN 20 WHEN 'Barebow' THEN 0 WHEN 'Longbow' THEN -40 ELSE 0 END
  )),
  GREATEST(0, LEAST(r.max_golds, (random() * r.max_golds * 0.7)::int)),
  (DATE '2024-09-01' + (d.n * (7 + floor(random()*10)))::int)::date,
  (ARRAY['Practice','Practice','Competition','Competition','UKRS'])[floor(random()*5+1)],
  bs.bow_type,
  COALESCE((SELECT age_category FROM profiles WHERE id = bs.profile_id), 'Senior'),
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN generate_series(1, 30) d(n)
CROSS JOIN (VALUES
  ('Portsmouth', 600, 50, 280, 480, 60, 50, 80, 60),
  ('WA 18m',     600, 50, 250, 450, 70, 55, 90, 60),
  ('Worcester',  300, 30, 120, 220, 40, 25, 50, 60),
  ('Stafford',   720, 40, 300, 520, 80, 40, 70, 72),
  ('Bray I',     150, 20,  60, 120, 25, 12, 30, 30)
) AS r(round_name, max_score, min_score, base_lo, base_hi, variance, max_golds, progression, arrows)
WHERE bs.is_active = true
ON CONFLICT DO NOTHING;

-- Generate outdoor scores
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(r.min_score, LEAST(r.max_score,
    (r.base_lo + (abs(hashtext(bs.profile_id::text || r.round_name)) % (r.base_hi - r.base_lo)))
    + ((d.n::float / 15) * r.progression)::int
    + (random() * r.variance * 2 - r.variance)::int
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Invicta%' THEN 30
        WHEN bs.riser ILIKE '%Gillo%' THEN 18
        ELSE 0
      END
    + CASE bs.bow_type WHEN 'Compound' THEN 60 WHEN 'Recurve' THEN 25 WHEN 'Barebow' THEN 0 WHEN 'Longbow' THEN -50 ELSE 0 END
  )),
  GREATEST(0, LEAST(r.max_golds, (random() * r.max_golds * 0.6)::int)),
  (DATE '2025-03-01' + (d.n * (10 + floor(random()*18)))::int)::date,
  (ARRAY['Practice','Competition','Competition','UKRS','WRS'])[floor(random()*5+1)],
  bs.bow_type,
  COALESCE((SELECT age_category FROM profiles WHERE id = bs.profile_id), 'Senior'),
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN generate_series(1, 15) d(n)
CROSS JOIN (VALUES
  ('York',           1296, 100, 350, 750, 150, 72, 120, 144),
  ('Hereford',       1296, 100, 400, 800, 140, 72, 100, 144),
  ('National',        864,  50, 250, 550, 120, 48,  80,  72),
  ('Western',         864,  50, 280, 560, 110, 48,  70,  96),
  ('Windsor',         972,  60, 300, 600, 130, 54,  90, 108),
  ('WA 70m',          720,  50, 200, 450, 100, 40,  80,  72),
  ('WA 60m',          720,  50, 220, 470,  95, 40,  75,  72),
  ('Long Metric V',   720,  50, 250, 480,  90, 40,  70,  72),
  ('Long Metric IV',  720,  50, 230, 460,  95, 40,  70,  72),
  ('Short Metric I',  720,  50, 280, 500,  85, 40,  65,  72),
  ('American',        810,  60, 250, 500, 120, 45,  75,  90),
  ('Warwick 30',      432,  30, 150, 320,  70, 24,  50,  48),
  ('Albion',          972,  60, 300, 620, 130, 54,  85, 108),
  ('Frostbite',       360,  20, 150, 280,  60, 20,  40,  36),
  ('Bristol V',      1296, 100, 500, 900, 140, 72,  90, 144)
) AS r(round_name, max_score, min_score, base_lo, base_hi, variance, max_golds, progression, arrows)
WHERE bs.is_active = true
ON CONFLICT DO NOTHING;
