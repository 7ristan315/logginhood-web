-- Backfill bow_setups for all test users based on their profile bow_type
-- Each bow type gets a realistic equipment loadout

-- Recurve setups
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, sight, button, clicker, tab, sling, stabilisers, colour)
SELECT
  p.id, 'My Recurve', 'Recurve', true,
  (ARRAY['Hoyt Formula Xi','Win&Win Meta DX','MK Archery MK Alpha','Gillo GQ','Fivics Titan EX','WNS Motive FX','Mybo Elite'])[floor(random()*7+1)],
  (ARRAY['Hoyt Integra','Win&Win Wiawis NS-G','MK Archery MK Vera','Uukha VX+','WNS Motive FX','Fivics Titan EX'])[floor(random()*6+1)],
  (ARRAY['32 lbs','34 lbs','36 lbs','38 lbs','40 lbs','42 lbs'])[floor(random()*6+1)],
  (ARRAY['26"','27"','28"','29"','30"'])[floor(random()*5+1)],
  json_build_object('brand',(ARRAY['Shibuya','Axcel','WNS','Sure-Loc','Arc Systeme'])[floor(random()*5+1)],'model',(ARRAY['Ultima RC II','Achieve XP','SPR-200','Challenger','SX200'])[floor(random()*5+1)],'pin','Fibre .019'),
  json_build_object('brand',(ARRAY['Shibuya','Beiter','AAE'])[floor(random()*3+1)],'model',(ARRAY['DX Plunger','Beiter Plunger','Gold Micro'])[floor(random()*3+1)],'tip_type','Standard'),
  json_build_object('type','Blade','brand',(ARRAY['Shibuya','Beiter','AAE'])[floor(random()*3+1)]),
  json_build_object('brand',(ARRAY['AAE','Fivics','Win&Win','Soma'])[floor(random()*4+1)],'model',(ARRAY['Elite Tab','Saker IV','Wiawis Finger Tab','Acro Tab'])[floor(random()*4+1)]),
  json_build_object('type','Finger sling'),
  json_build_object('long_rod',json_build_object('length',(ARRAY['28','30','32'])[floor(random()*3+1)],'weight',(ARRAY['6','8','10'])[floor(random()*3+1)]),'short_rods',json_build_object('length',(ARRAY['10','12'])[floor(random()*2+1)],'weight',(ARRAY['3','4'])[floor(random()*2+1)])),
  (ARRAY['#2563EB','#1A9B6B','#7C3AED','#DC2626','#D97706'])[floor(random()*5+1)]
FROM profiles p
WHERE p.bow_type = 'Recurve' AND p.id != 'afff38e8-198e-4052-a5aa-3f655a4195ce'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Compound setups
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, sight, release_aid, scope, sling, stabilisers, colour)
SELECT
  p.id, 'My Compound', 'Compound', true,
  (ARRAY['Hoyt Invicta','Hoyt Prevail','Mathews TRX','PSE Dominator Duo','Elite Echelon','Prime Nexus'])[floor(random()*6+1)],
  NULL,
  (ARRAY['50 lbs','55 lbs','60 lbs'])[floor(random()*3+1)],
  (ARRAY['27"','28"','29"','30"'])[floor(random()*4+1)],
  json_build_object('brand',(ARRAY['Axcel','Sure-Loc','CBE','Spot Hogg'])[floor(random()*4+1)],'model',(ARRAY['Achieve CXL','Quest X','Tek Target','Fast Eddie'])[floor(random()*4+1)]),
  json_build_object('type',(ARRAY['Thumb','Hinge','Tension'])[floor(random()*3+1)],'brand',(ARRAY['Carter','Stan','TruBall','Scott'])[floor(random()*4+1)],'model',(ARRAY['Wise Choice','PerfeX','Fulkrum Flex','Sigma'])[floor(random()*4+1)]),
  json_build_object('brand',(ARRAY['Axcel','Specialty Archery','Ultraview'])[floor(random()*3+1)],'magnification',(ARRAY['4x','6x','8x'])[floor(random()*3+1)]),
  json_build_object('type','Bow sling'),
  json_build_object('long_rod',json_build_object('length',(ARRAY['30','33'])[floor(random()*2+1)],'weight',(ARRAY['8','10','12'])[floor(random()*3+1)]),'short_rods',json_build_object('length','12','weight',(ARRAY['4','6'])[floor(random()*2+1)])),
  (ARRAY['#1E40AF','#065F46','#7C2D12','#4A1D96'])[floor(random()*4+1)]
FROM profiles p
WHERE p.bow_type = 'Compound' AND p.id != 'afff38e8-198e-4052-a5aa-3f655a4195ce'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Barebow setups
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, button, tab, sling, colour)
SELECT
  p.id, 'My Barebow', 'Barebow', true,
  (ARRAY['Gillo GQ','Gillo GT','Hoyt Xceed','MK Archery MK Alpha','Spigarelli Revolution','WNS Motive FX'])[floor(random()*6+1)],
  (ARRAY['Uukha VX+','Uukha SX+','Win&Win Wiawis NS-G','MK Archery MK Vera','Gillo GS8'])[floor(random()*5+1)],
  (ARRAY['30 lbs','32 lbs','34 lbs','36 lbs','38 lbs','40 lbs'])[floor(random()*6+1)],
  (ARRAY['27"','28"','29"','30"'])[floor(random()*4+1)],
  json_build_object('brand',(ARRAY['Shibuya','Beiter','AAE'])[floor(random()*3+1)],'model',(ARRAY['DX Plunger','Beiter Plunger','Gold Micro'])[floor(random()*3+1)],'tip_type','Standard'),
  json_build_object('brand',(ARRAY['AAE','Fivics','Soma','Fairweather'])[floor(random()*4+1)],'model',(ARRAY['Elite Tab','Saker IV','Acro Tab','Tab'])[floor(random()*4+1)]),
  json_build_object('type','Finger sling'),
  (ARRAY['#059669','#B45309','#7C3AED','#BE185D'])[floor(random()*4+1)]
FROM profiles p
WHERE p.bow_type = 'Barebow' AND p.id != 'afff38e8-198e-4052-a5aa-3f655a4195ce'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Longbow setups
INSERT INTO bow_setups (profile_id, name, bow_type, is_active, riser, limbs, draw_weight, draw_length, tab, colour)
SELECT
  p.id, 'My Longbow', 'Longbow', true,
  (ARRAY['Border Hex 5','Bamboo Viper','Longbow Shop Custom','Saxon Archery'])[floor(random()*4+1)],
  NULL,
  (ARRAY['28 lbs','30 lbs','32 lbs','35 lbs','40 lbs','45 lbs'])[floor(random()*6+1)],
  (ARRAY['27"','28"','29"','30"'])[floor(random()*4+1)],
  json_build_object('brand','Bateman','model','Cordovan Tab'),
  (ARRAY['#78350F','#365314','#1E3A5F','#4A1D96'])[floor(random()*4+1)]
FROM profiles p
WHERE p.bow_type = 'Longbow' AND p.id != 'afff38e8-198e-4052-a5aa-3f655a4195ce'
AND NOT EXISTS (SELECT 1 FROM bow_setups bs WHERE bs.profile_id = p.id);

-- Add arrow sets for all new setups
INSERT INTO setup_arrows (setup_id, name, spine, length, point_weight, is_active)
SELECT
  bs.id,
  CASE bs.bow_type
    WHEN 'Recurve' THEN (ARRAY['Easton X10','Easton ACE','Easton Carbon One','Easton RX7'])[floor(random()*4+1)]
    WHEN 'Compound' THEN (ARRAY['Easton X10 ProTour','Easton ProComp','CarbonExpress Nano Pro','Victory VAP TKO'])[floor(random()*4+1)]
    WHEN 'Barebow' THEN (ARRAY['Easton ACE','Easton Carbon One','Skylon Radius','Easton X10'])[floor(random()*4+1)]
    WHEN 'Longbow' THEN (ARRAY['Easton XX75 Platinum Plus','Easton Jazz','Carbon Tech Cheetah'])[floor(random()*3+1)]
  END,
  CASE bs.bow_type
    WHEN 'Recurve' THEN (ARRAY['500','550','600','700'])[floor(random()*4+1)]
    WHEN 'Compound' THEN (ARRAY['300','350','400'])[floor(random()*3+1)]
    WHEN 'Barebow' THEN (ARRAY['500','550','600','700','800'])[floor(random()*5+1)]
    WHEN 'Longbow' THEN (ARRAY['600','700','800','900'])[floor(random()*4+1)]
  END,
  (ARRAY['27"','28"','29"','30"','31"'])[floor(random()*5+1)],
  (ARRAY['80gr','100gr','110gr','120gr'])[floor(random()*4+1)],
  true
FROM bow_setups bs
WHERE NOT EXISTS (SELECT 1 FROM setup_arrows sa WHERE sa.setup_id = bs.id);

-- Link existing scores to their owner's active setup
UPDATE scores s
SET setup_id = bs.id
FROM bow_setups bs
WHERE bs.profile_id = s.profile_id
  AND bs.bow_type = s.bow_type
  AND bs.is_active = true
  AND s.setup_id IS NULL;
