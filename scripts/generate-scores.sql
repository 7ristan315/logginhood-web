-- Generate realistic scores for all users with setups
-- Better equipment = higher base score, with natural variation

-- Indoor rounds (Portsmouth max 600, WA 18m max 600, Worcester max 300)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(50, LEAST(r.max_score,
    r.base_score + (random() * r.variance * 2 - r.variance)::int
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Meta DX%' OR bs.riser ILIKE '%Invicta%' THEN 20
        WHEN bs.riser ILIKE '%Gillo%' OR bs.riser ILIKE '%Titan%' THEN 10
        ELSE 0
      END
    + CASE
        WHEN bs.limbs ILIKE '%Wiawis%' OR bs.limbs ILIKE '%Integra%' OR bs.limbs ILIKE '%VX+%' THEN 15
        WHEN bs.limbs ILIKE '%Uukha%' THEN 12
        ELSE 0
      END
  )),
  GREATEST(0, (random() * r.max_golds)::int),
  (DATE '2025-09-01' + (random() * 300)::int)::date,
  (ARRAY['Practice','Competition','Practice','Practice','Competition'])[floor(random()*5+1)],
  bs.bow_type,
  'Senior',
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN (VALUES
  ('Portsmouth', 600, 380, 80, 60, 60),
  ('Portsmouth', 600, 400, 70, 60, 60),
  ('Portsmouth', 600, 420, 60, 60, 60),
  ('WA 18m', 600, 350, 90, 60, 60),
  ('WA 18m', 600, 370, 80, 60, 60),
  ('Worcester', 300, 180, 50, 30, 60),
  ('Bray I', 150, 90, 30, 15, 30),
  ('Stafford', 720, 400, 120, 40, 72)
) AS r(round_name, max_score, base_score, variance, max_golds, arrows)
WHERE bs.bow_type IN ('Recurve', 'Compound', 'Barebow');

-- More Portsmouth for Barebow specifically (lower scores)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  'Portsmouth',
  GREATEST(100, LEAST(600, 320 + (random() * 120 - 60)::int
    + CASE WHEN bs.riser ILIKE '%Gillo%' THEN 25 WHEN bs.riser ILIKE '%Hoyt%' THEN 15 ELSE 0 END
    + CASE WHEN bs.limbs ILIKE '%Uukha%' THEN 20 WHEN bs.limbs ILIKE '%Wiawis%' THEN 15 ELSE 0 END
  )),
  GREATEST(0, (random() * 40)::int),
  (DATE '2025-09-01' + (random() * 300)::int)::date,
  (ARRAY['Practice','Competition','Practice'])[floor(random()*3+1)],
  'Barebow', 'Senior', bs.id, 60
FROM bow_setups bs
CROSS JOIN generate_series(1, 5)
WHERE bs.bow_type = 'Barebow';

-- More Portsmouth for Compound (higher scores)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  'Portsmouth',
  GREATEST(200, LEAST(600, 480 + (random() * 80 - 40)::int
    + CASE WHEN bs.riser ILIKE '%Invicta%' OR bs.riser ILIKE '%Mathews%' THEN 20 ELSE 0 END
  )),
  GREATEST(0, (random() * 60)::int),
  (DATE '2025-09-01' + (random() * 300)::int)::date,
  (ARRAY['Practice','Competition','Competition'])[floor(random()*3+1)],
  'Compound', 'Senior', bs.id, 60
FROM bow_setups bs
CROSS JOIN generate_series(1, 5)
WHERE bs.bow_type = 'Compound';

-- Outdoor rounds
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(50, LEAST(r.max_score,
    r.base_score + (random() * r.variance * 2 - r.variance)::int
    + CASE WHEN bs.bow_type = 'Compound' THEN 60 WHEN bs.bow_type = 'Recurve' THEN 30 ELSE 0 END
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Invicta%' OR bs.riser ILIKE '%Meta DX%' THEN 25
        WHEN bs.riser ILIKE '%Gillo%' THEN 15
        ELSE 0
      END
  )),
  GREATEST(0, (random() * r.max_golds)::int),
  (DATE '2026-03-01' + (random() * 120)::int)::date,
  (ARRAY['Practice','Competition','Competition','UKRS'])[floor(random()*4+1)],
  bs.bow_type,
  'Senior',
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN (VALUES
  ('York', 1296, 600, 200, 72, 144),
  ('Hereford', 1296, 650, 180, 72, 144),
  ('Bristol V', 1296, 800, 150, 72, 144),
  ('National', 864, 400, 150, 48, 72),
  ('Western', 864, 420, 140, 48, 96),
  ('Windsor', 972, 500, 160, 54, 108),
  ('Warwick 30', 432, 250, 80, 24, 48),
  ('WA 70m', 720, 350, 120, 40, 72),
  ('WA 60m', 720, 380, 110, 40, 72),
  ('Long Metric V', 720, 400, 100, 40, 72),
  ('Long Metric IV', 720, 380, 110, 40, 72),
  ('Short Metric I', 720, 420, 100, 40, 72),
  ('American', 810, 400, 150, 45, 90),
  ('Albion', 972, 500, 160, 54, 108)
) AS r(round_name, max_score, base_score, variance, max_golds, arrows)
WHERE bs.bow_type IN ('Recurve', 'Compound', 'Barebow');

-- Longbow scores (lower overall)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(30, LEAST(r.max_score, r.base_score + (random() * r.variance * 2 - r.variance)::int)),
  GREATEST(0, (random() * r.max_golds)::int),
  (DATE '2025-09-01' + (random() * 300)::int)::date,
  (ARRAY['Practice','Competition','Practice'])[floor(random()*3+1)],
  'Longbow', 'Senior', bs.id, r.arrows
FROM bow_setups bs
CROSS JOIN (VALUES
  ('Portsmouth', 600, 250, 80, 30, 60),
  ('Portsmouth', 600, 260, 70, 30, 60),
  ('Portsmouth', 600, 240, 90, 25, 60),
  ('Worcester', 300, 140, 50, 15, 60),
  ('National', 864, 300, 120, 30, 72),
  ('Western', 864, 320, 130, 30, 96),
  ('York', 1296, 400, 180, 40, 144),
  ('Hereford', 1296, 450, 160, 40, 144)
) AS r(round_name, max_score, base_score, variance, max_golds, arrows)
WHERE bs.bow_type = 'Longbow';
