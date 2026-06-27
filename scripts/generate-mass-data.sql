-- Generate ~660 new profiles to reach 1000 total
-- Then create setups and scores for everyone

-- Step 1: Generate new profiles with varied bow types
INSERT INTO profiles (id, full_name, gender, date_of_birth, bow_type, age_category, gb_number, created_at, social_links)
SELECT
  gen_random_uuid(),
  first_names.name || ' ' || last_names.name,
  genders.g,
  DATE '1970-01-01' + (random() * 18000)::int,
  bows.b,
  CASE
    WHEN DATE '1970-01-01' + (random() * 18000)::int > DATE '2010-01-01' THEN 'U16'
    WHEN DATE '1970-01-01' + (random() * 18000)::int > DATE '2008-01-01' THEN 'U18'
    WHEN DATE '1970-01-01' + (random() * 18000)::int < DATE '1976-01-01' THEN '50+'
    ELSE 'Senior'
  END,
  'GB' || (100000 + floor(random() * 900000))::text,
  NOW() - (random() * 365)::int * INTERVAL '1 day',
  '{}'::jsonb
FROM
  (SELECT unnest(ARRAY['Oliver','Jack','Harry','George','Charlie','Jacob','Thomas','Oscar','William','James','Alexander','Daniel','Matthew','Henry','Joseph','Samuel','Benjamin','Edward','Leo','Archie','Freddie','Ethan','Isaac','Noah','Lucas','Arthur','Max','Logan','Riley','Finn','Emily','Amelia','Isla','Jessica','Poppy','Isabella','Sophie','Olivia','Lily','Grace','Mia','Evie','Scarlett','Ruby','Chloe','Daisy','Ella','Freya','Phoebe','Florence','Charlotte','Alice','Lucy','Hannah','Eleanor','Abigail','Martha','Harriet','Bethany','Rosie','Maisie']) AS name) first_names,
  (SELECT unnest(ARRAY['Smith','Jones','Williams','Brown','Taylor','Davies','Wilson','Evans','Thomas','Johnson','Roberts','Walker','Wright','Robinson','Thompson','White','Hall','Green','Harris','Clark','Lewis','Young','Jackson','Turner','Edwards','Morgan','Baker','King','Allen','Moore','Scott','Watson','Ward','Hughes','Parker','Price','Bennett','Wood','Brooks','Kelly','Ellis','Marshall','Gray','Russell','Cooper','Chapman','Webb','Hunt','Grant','Simpson','Mason','Dixon','Rose','Palmer','Gibson','Shaw','Fox','Holmes','Burton','Spencer','Knight','Cole','Murray','Harvey','Patel','Khan']) AS name) last_names,
  (SELECT unnest(ARRAY['Male','Female']) AS g) genders,
  (SELECT unnest(ARRAY['Recurve','Recurve','Recurve','Compound','Compound','Barebow','Barebow','Barebow','Longbow']) AS b) bows
ORDER BY random()
LIMIT 660;

-- Step 2: Create bow setups for new profiles (those without setups)
-- Recurve
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, sight, button, clicker, tab, sling, stabilisers, colour)
SELECT p.id, 'My Recurve', 'Recurve', true,
  (ARRAY['Hoyt Formula Xi','Win&Win Meta DX','MK Archery MK Alpha','Gillo GQ','Fivics Titan EX','WNS Motive FX','Mybo Elite','Hoyt Xceed','Kinetic Stylized A1','SF Archery Forged+','Core Jet Metal','WNS Delta FX'])[floor(random()*12+1)],
  (ARRAY['Hoyt Integra','Win&Win Wiawis NS-G','MK Archery MK Vera','Uukha VX+','Uukha SX+','WNS Motive FX','Fivics Titan EX','Gillo GS8','Kinetic Envy','SF Archery Premium+','Hoyt Velos'])[floor(random()*11+1)],
  (ARRAY['28 lbs','30 lbs','32 lbs','34 lbs','36 lbs','38 lbs','40 lbs','42 lbs','44 lbs'])[floor(random()*9+1)],
  (ARRAY['26"','27"','28"','29"','30"','31"'])[floor(random()*6+1)],
  json_build_object('brand',(ARRAY['Shibuya','Axcel','WNS','Sure-Loc','Arc Systeme','Fivics','Cartel'])[floor(random()*7+1)],'model',(ARRAY['Ultima RC II','Achieve XP','SPR-200','Challenger','SX200','Titan','Focus K'])[floor(random()*7+1)]),
  json_build_object('brand',(ARRAY['Shibuya','Beiter','AAE','Fivics','WNS','Cartel','Spigarelli'])[floor(random()*7+1)]),
  json_build_object('type',(ARRAY['Blade','Magnetic'])[floor(random()*2+1)]),
  json_build_object('brand',(ARRAY['AAE','Fivics','Win&Win','Soma','Beiter','Fairweather','Decut'])[floor(random()*7+1)]),
  json_build_object('type','Finger sling'),
  json_build_object('long_rod',json_build_object('length',(ARRAY['26','28','30','32'])[floor(random()*4+1)],'weight',(ARRAY['4','6','8','10','12'])[floor(random()*5+1)])),
  (ARRAY['#2563EB','#1A9B6B','#7C3AED','#DC2626','#D97706','#0891B2','#059669','#4F46E5'])[floor(random()*8+1)]
FROM profiles p WHERE p.bow_type = 'Recurve' AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Compound
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, draw_weight, draw_length, sight, release_aid, scope, sling, stabilisers, colour)
SELECT p.id, 'My Compound', 'Compound', true,
  (ARRAY['Hoyt Invicta','Hoyt Prevail','Mathews TRX','PSE Dominator Duo','PSE Supra Focus','Elite Echelon','Elite Rezult','Prime Nexus','Prime CT9','Bowtech Reckoning'])[floor(random()*10+1)],
  (ARRAY['45 lbs','48 lbs','50 lbs','55 lbs','60 lbs'])[floor(random()*5+1)],
  (ARRAY['27"','28"','29"','30"'])[floor(random()*4+1)],
  json_build_object('brand',(ARRAY['Axcel','Sure-Loc','CBE','Spot Hogg','Shibuya','Shrewd'])[floor(random()*6+1)]),
  json_build_object('type',(ARRAY['Thumb','Hinge','Tension'])[floor(random()*3+1)],'brand',(ARRAY['Carter','Stan','TruBall','Scott','B3 Archery'])[floor(random()*5+1)]),
  json_build_object('brand',(ARRAY['Axcel','Specialty Archery','Ultraview','CBE','Shrewd'])[floor(random()*5+1)]),
  json_build_object('type','Bow sling'),
  json_build_object('long_rod',json_build_object('length',(ARRAY['30','33','36'])[floor(random()*3+1)],'weight',(ARRAY['8','10','12','14'])[floor(random()*4+1)])),
  (ARRAY['#1E40AF','#065F46','#7C2D12','#4A1D96','#991B1B','#0C4A6E'])[floor(random()*6+1)]
FROM profiles p WHERE p.bow_type = 'Compound' AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Barebow
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, button, tab, sling, colour)
SELECT p.id, 'My Barebow', 'Barebow', true,
  (ARRAY['Gillo GQ','Gillo GT','Gillo G1','Hoyt Xceed','MK Archery MK Alpha','Spigarelli Revolution','Spigarelli Explorer 2.0','WNS Motive FX','Mybo Elite'])[floor(random()*9+1)],
  (ARRAY['Uukha VX+','Uukha SX+','Uukha EX1 Evo 2','Win&Win Wiawis NS-G','MK Archery MK Vera','Gillo GS8','Hoyt Velos','Spigarelli Zen'])[floor(random()*8+1)],
  (ARRAY['28 lbs','30 lbs','32 lbs','34 lbs','36 lbs','38 lbs','40 lbs','42 lbs'])[floor(random()*8+1)],
  (ARRAY['27"','28"','29"','30"'])[floor(random()*4+1)],
  json_build_object('brand',(ARRAY['Shibuya','Beiter','AAE','Spigarelli','Gillo'])[floor(random()*5+1)]),
  json_build_object('brand',(ARRAY['AAE','Fivics','Soma','Fairweather','Bateman','Decut'])[floor(random()*6+1)]),
  json_build_object('type','Finger sling'),
  (ARRAY['#059669','#B45309','#7C3AED','#BE185D','#1A9B6B','#9333EA'])[floor(random()*6+1)]
FROM profiles p WHERE p.bow_type = 'Barebow' AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Longbow
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, draw_weight, draw_length, tab, colour)
SELECT p.id, 'My Longbow', 'Longbow', true,
  (ARRAY['Border Hex 5','Bamboo Viper','Longbow Shop Custom','Saxon Archery','Bickerstaffe','Howard Hill','Bear Archery'])[floor(random()*7+1)],
  (ARRAY['25 lbs','28 lbs','30 lbs','32 lbs','35 lbs','38 lbs','40 lbs','45 lbs'])[floor(random()*8+1)],
  (ARRAY['27"','28"','29"','30"','31"'])[floor(random()*5+1)],
  json_build_object('brand','Bateman','model','Cordovan Tab'),
  (ARRAY['#78350F','#365314','#1E3A5F','#4A1D96','#713F12'])[floor(random()*5+1)]
FROM profiles p WHERE p.bow_type = 'Longbow' AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Arrow sets for all new setups
INSERT INTO setup_arrows (setup_id, name, spine, length, point_weight, is_active)
SELECT bs.id,
  CASE bs.bow_type
    WHEN 'Recurve' THEN (ARRAY['Easton X10','Easton ACE','Easton Carbon One','Easton RX7','Easton Avance','Skylon Radius','WNS Archon'])[floor(random()*7+1)]
    WHEN 'Compound' THEN (ARRAY['Easton X10 ProTour','Easton ProComp','CarbonExpress Nano Pro','Victory VAP TKO','Gold Tip Pierce','Easton FMJ'])[floor(random()*6+1)]
    WHEN 'Barebow' THEN (ARRAY['Easton ACE','Easton Carbon One','Skylon Radius','Skylon Brixton','Easton X10','Avalon Tec One'])[floor(random()*6+1)]
    WHEN 'Longbow' THEN (ARRAY['Easton XX75 Platinum Plus','Easton Jazz','Carbon Tech Cheetah','Easton Tribute'])[floor(random()*4+1)]
  END,
  CASE bs.bow_type
    WHEN 'Recurve' THEN (ARRAY['450','500','550','600','700','800'])[floor(random()*6+1)]
    WHEN 'Compound' THEN (ARRAY['250','300','350','400'])[floor(random()*4+1)]
    WHEN 'Barebow' THEN (ARRAY['500','550','600','700','800','900'])[floor(random()*6+1)]
    WHEN 'Longbow' THEN (ARRAY['600','700','800','900','1000'])[floor(random()*5+1)]
  END,
  (ARRAY['27"','28"','29"','30"','31"'])[floor(random()*5+1)],
  (ARRAY['80gr','100gr','110gr','120gr','130gr'])[floor(random()*5+1)],
  true
FROM bow_setups bs WHERE NOT EXISTS (SELECT 1 FROM setup_arrows sa WHERE sa.setup_id = bs.id);

-- Step 3: Generate ~50 scores per archer with progression over time
-- Each archer gets a base skill level that improves over time
-- Indoor rounds (Sept-June)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(r.min_score, LEAST(r.max_score,
    -- Base score varies by archer (seeded from profile id hash)
    (r.base_lo + (abs(hashtext(bs.profile_id::text)) % (r.base_hi - r.base_lo)))
    -- Progression: later dates = higher scores
    + ((d.day_offset::float / 600) * r.progression)::int
    -- Random variation per round
    + (random() * r.variance * 2 - r.variance)::int
    -- Equipment bonus
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Invicta%' OR bs.riser ILIKE '%Meta DX%' THEN 25
        WHEN bs.riser ILIKE '%Gillo%' OR bs.riser ILIKE '%Titan%' THEN 15
        WHEN bs.riser ILIKE '%Mathews%' OR bs.riser ILIKE '%PSE%' THEN 20
        ELSE 0
      END
    + CASE
        WHEN bs.limbs ILIKE '%Wiawis%' OR bs.limbs ILIKE '%Integra%' OR bs.limbs ILIKE '%VX+%' THEN 15
        WHEN bs.limbs ILIKE '%Uukha%' OR bs.limbs ILIKE '%Velos%' THEN 12
        ELSE 0
      END
    -- Bow type adjustment
    + CASE bs.bow_type WHEN 'Compound' THEN 50 WHEN 'Recurve' THEN 20 WHEN 'Barebow' THEN 0 WHEN 'Longbow' THEN -40 ELSE 0 END
  )),
  GREATEST(0, LEAST(r.max_golds, (random() * r.max_golds * 0.7)::int)),
  (DATE '2024-09-01' + d.day_offset)::date,
  (ARRAY['Practice','Practice','Practice','Competition','Competition','UKRS'])[floor(random()*6+1)],
  bs.bow_type,
  COALESCE((SELECT age_category FROM profiles WHERE id = bs.profile_id), 'Senior'),
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN (
  SELECT generate_series(0, 600, (12 + floor(random()*14))::int) AS day_offset
) d
CROSS JOIN (VALUES
  ('Portsmouth', 600, 50, 280, 480, 60, 50, 80, 60),
  ('WA 18m',     600, 50, 250, 450, 70, 55, 90, 60),
  ('Worcester',  300, 30, 120, 220, 40, 25, 50, 60)
) AS r(round_name, max_score, min_score, base_lo, base_hi, variance, max_golds, progression, arrows)
WHERE bs.is_active = true
AND d.day_offset < 640;

-- Outdoor rounds (Mar-Sept)
INSERT INTO scores (profile_id, round_name, score, golds, shot_at, status, bow_type, age_category, setup_id, arrows_used)
SELECT
  bs.profile_id,
  r.round_name,
  GREATEST(r.min_score, LEAST(r.max_score,
    (r.base_lo + (abs(hashtext(bs.profile_id::text || r.round_name)) % (r.base_hi - r.base_lo)))
    + ((d.day_offset::float / 600) * r.progression)::int
    + (random() * r.variance * 2 - r.variance)::int
    + CASE
        WHEN bs.riser ILIKE '%Formula Xi%' OR bs.riser ILIKE '%Invicta%' OR bs.riser ILIKE '%Meta DX%' THEN 30
        WHEN bs.riser ILIKE '%Gillo%' THEN 18
        WHEN bs.riser ILIKE '%Mathews%' THEN 25
        ELSE 0
      END
    + CASE bs.bow_type WHEN 'Compound' THEN 60 WHEN 'Recurve' THEN 25 WHEN 'Barebow' THEN 0 WHEN 'Longbow' THEN -50 ELSE 0 END
  )),
  GREATEST(0, LEAST(r.max_golds, (random() * r.max_golds * 0.6)::int)),
  (DATE '2025-03-01' + d.day_offset)::date,
  (ARRAY['Practice','Competition','Competition','UKRS','Practice'])[floor(random()*5+1)],
  bs.bow_type,
  COALESCE((SELECT age_category FROM profiles WHERE id = bs.profile_id), 'Senior'),
  bs.id,
  r.arrows
FROM bow_setups bs
CROSS JOIN (
  SELECT generate_series(0, 480, (18 + floor(random()*20))::int) AS day_offset
) d
CROSS JOIN (VALUES
  ('York',           1296, 100, 350, 750, 150, 72, 120, 144),
  ('Hereford',       1296, 100, 400, 800, 140, 72, 100, 144),
  ('National',        864,  50, 250, 550, 120, 48,  80,  72),
  ('Western',         864,  50, 280, 560, 110, 48,  70,  96),
  ('Windsor',         972,  60, 300, 600, 130, 54,  90, 108),
  ('WA 70m',          720,  50, 200, 450, 100, 40,  80,  72),
  ('Long Metric V',   720,  50, 250, 480,  90, 40,  70,  72),
  ('Short Metric I',  720,  50, 280, 500,  85, 40,  65,  72),
  ('American',        810,  60, 250, 500, 120, 45,  75,  90),
  ('Warwick 30',      432,  30, 150, 320,  70, 24,  50,  48),
  ('Frostbite',       360,  20, 150, 280,  60, 20,  40,  36)
) AS r(round_name, max_score, min_score, base_lo, base_hi, variance, max_golds, progression, arrows)
WHERE bs.is_active = true
AND d.day_offset < 500
AND (DATE '2025-03-01' + d.day_offset) BETWEEN DATE '2025-03-01' AND DATE '2026-09-30';
