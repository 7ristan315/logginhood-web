-- Raise anonymisation floors to k=10 DISTINCT ARCHERS (DPIA: 10–20 archers).
-- Also switches round-based floors (COUNT(*)) to archer-based (COUNT(DISTINCT profile_id)):
-- a COUNT(*)>=5 floor passes 1 archer who shot 5 rounds — not k-anonymous. Archer count is.
-- CREATE OR REPLACE (columns unchanged, only HAVING changes).
-- NOTE: these views are fine-grained, so k=10 archers will suppress a lot until the real
-- (non-seed) archer base grows. Correct for privacy; expect sparse sections meanwhile.

-- equipment performance: was COUNT(*) >= 5
CREATE OR REPLACE VIEW insights_equipment_performance AS
SELECT
  bs.bow_type,
  s.round_name,
  bs.riser,
  bs.limbs,
  bs.sight->>'name' AS sight_name,
  bs.button->>'name' AS button_name,
  bs.clicker->>'type' AS clicker_type,
  bs.tab->>'name' AS tab_name,
  bs.release_aid->>'name' AS release_aid_name,
  bs.scope->>'magnification' AS scope_magnification,
  bs.stabilisers->>'long_rod' AS long_rod_config,
  p.age_category,
  p.gender,
  COUNT(*) AS sample_size,
  ROUND(AVG(s.score), 1) AS avg_score,
  ROUND(STDDEV_POP(s.score), 1) AS score_stddev,
  MIN(s.score) AS min_score,
  MAX(s.score) AS max_score,
  ROUND(AVG(s.golds), 1) AS avg_golds
FROM scores s
JOIN bow_setups bs ON s.setup_id = bs.id
LEFT JOIN profiles p ON s.profile_id = p.id
WHERE s.setup_id IS NOT NULL
GROUP BY bs.bow_type, s.round_name, bs.riser, bs.limbs,
  bs.sight->>'name', bs.button->>'name', bs.clicker->>'type',
  bs.tab->>'name', bs.release_aid->>'name', bs.scope->>'magnification',
  bs.stabilisers->>'long_rod', p.age_category, p.gender
HAVING COUNT(DISTINCT s.profile_id) >= 10;

-- setup DNA: was COUNT(DISTINCT profile_id) >= 3
CREATE OR REPLACE VIEW insights_setup_dna AS
SELECT
  bs.bow_type,
  s.round_name,
  CASE
    WHEN s.score >= 550 THEN '550+'
    WHEN s.score >= 500 THEN '500-549'
    WHEN s.score >= 450 THEN '450-499'
    WHEN s.score >= 400 THEN '400-449'
    WHEN s.score >= 300 THEN '300-399'
    ELSE 'Under 300'
  END AS score_bracket,
  bs.riser,
  bs.limbs,
  bs.sight->>'name' AS sight_name,
  bs.draw_weight,
  COUNT(DISTINCT s.profile_id) AS archer_count,
  COUNT(*) AS round_count,
  ROUND(AVG(s.score), 1) AS avg_score
FROM scores s
JOIN bow_setups bs ON s.setup_id = bs.id
WHERE s.setup_id IS NOT NULL
GROUP BY bs.bow_type, s.round_name, score_bracket,
  bs.riser, bs.limbs, bs.sight->>'name', bs.draw_weight
HAVING COUNT(DISTINCT s.profile_id) >= 10;

-- arrow performance: was COUNT(*) >= 5
CREATE OR REPLACE VIEW insights_arrow_performance AS
SELECT
  bs.bow_type,
  s.round_name,
  sa.name AS arrow_name,
  sa.spine,
  sa.length AS arrow_length,
  sa.point_weight,
  COUNT(*) AS sample_size,
  COUNT(DISTINCT s.profile_id) AS archer_count,
  ROUND(AVG(s.score), 1) AS avg_score,
  ROUND(STDDEV_POP(s.score), 1) AS score_stddev,
  ROUND(AVG(s.golds), 1) AS avg_golds
FROM scores s
JOIN bow_setups bs ON s.setup_id = bs.id
JOIN setup_arrows sa ON sa.setup_id = bs.id AND sa.is_active = true
WHERE s.setup_id IS NOT NULL
GROUP BY bs.bow_type, s.round_name, sa.name, sa.spine, sa.length, sa.point_weight
HAVING COUNT(DISTINCT s.profile_id) >= 10;

-- equipment journey: was COUNT(*) >= 3
CREATE OR REPLACE VIEW insights_equipment_journey AS
SELECT
  bs.bow_type,
  s.round_name,
  bs.version,
  bs.riser,
  bs.limbs,
  bs.sight->>'name' AS sight_name,
  bs.draw_weight,
  COUNT(*) AS round_count,
  ROUND(AVG(s.score), 1) AS avg_score,
  ROUND(STDDEV_POP(s.score), 1) AS score_stddev,
  MIN(s.shot_at) AS first_used,
  MAX(s.shot_at) AS last_used
FROM scores s
JOIN bow_setups bs ON s.setup_id = bs.id
WHERE s.setup_id IS NOT NULL
GROUP BY bs.bow_type, s.round_name, bs.version, bs.riser, bs.limbs,
  bs.sight->>'name', bs.draw_weight
HAVING COUNT(DISTINCT s.profile_id) >= 10;

-- zone distribution: was COUNT(DISTINCT profile_id) >= 3
CREATE OR REPLACE VIEW insights_zone_distribution AS
WITH flat_arrows AS (
  SELECT
    s.profile_id,
    s.round_name,
    bs.bow_type,
    jsonb_array_elements_text(
      jsonb_array_elements(s.ends) -> 'arrows'
    ) AS zone
  FROM scores s
  JOIN bow_setups bs ON s.setup_id = bs.id
  WHERE s.ends IS NOT NULL
    AND jsonb_typeof(s.ends) = 'array'
    AND s.setup_id IS NOT NULL
)
SELECT
  bow_type,
  round_name,
  zone,
  COUNT(*) AS arrow_count,
  COUNT(DISTINCT profile_id) AS archer_count
FROM flat_arrows
WHERE zone IN ('X','10','9','8','7','6','5','4','3','2','1','M')
GROUP BY bow_type, round_name, zone
HAVING COUNT(DISTINCT profile_id) >= 10;

-- competitive edge: was COUNT(*) >= 5
CREATE OR REPLACE VIEW insights_competitive_edge AS
SELECT
  bs.bow_type,
  bs.riser,
  s.status,
  COUNT(*) AS sample_size,
  ROUND(AVG(s.score), 1) AS avg_score,
  ROUND(STDDEV_POP(s.score), 1) AS score_stddev,
  ROUND(AVG(s.golds), 1) AS avg_golds
FROM scores s
JOIN bow_setups bs ON s.setup_id = bs.id
WHERE s.setup_id IS NOT NULL
  AND bs.riser IS NOT NULL
  AND s.status IN ('Competition', 'Practice')
GROUP BY bs.bow_type, bs.riser, s.status
HAVING COUNT(DISTINCT s.profile_id) >= 10;
