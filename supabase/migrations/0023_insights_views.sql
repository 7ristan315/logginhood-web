-- ── Anonymised aggregation views for manufacturer data products ──

-- Equipment Performance Index: avg score per equipment item, normalised by round max
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
HAVING COUNT(*) >= 5;

-- Setup DNA: what equipment combinations are used at each score bracket
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
HAVING COUNT(DISTINCT s.profile_id) >= 3;

-- Arrow performance: arrow brand/spine vs scores
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
HAVING COUNT(*) >= 5;

-- Market share: equipment usage counts
CREATE OR REPLACE VIEW insights_market_share AS
SELECT
  bs.bow_type,
  bs.riser,
  bs.limbs,
  bs.sight->>'name' AS sight_name,
  bs.button->>'name' AS button_name,
  bs.release_aid->>'name' AS release_aid_name,
  bs.draw_weight,
  COUNT(DISTINCT bs.profile_id) AS archer_count,
  COUNT(DISTINCT s.id) AS round_count
FROM bow_setups bs
LEFT JOIN scores s ON s.setup_id = bs.id
WHERE bs.is_active = true
GROUP BY bs.bow_type, bs.riser, bs.limbs,
  bs.sight->>'name', bs.button->>'name', bs.release_aid->>'name',
  bs.draw_weight;

-- Switching events: detect when an archer's setup version changed between consecutive scores
CREATE OR REPLACE VIEW insights_switching_events AS
WITH scored_versions AS (
  SELECT
    s.profile_id,
    s.round_name,
    s.score,
    s.golds,
    s.shot_at,
    s.setup_id,
    bs.version AS setup_version,
    bs.bow_type,
    LAG(bs.version) OVER (PARTITION BY s.profile_id, s.round_name, s.setup_id ORDER BY s.shot_at) AS prev_version
  FROM scores s
  JOIN bow_setups bs ON s.setup_id = bs.id
  WHERE s.setup_id IS NOT NULL
)
SELECT
  profile_id,
  round_name,
  bow_type,
  setup_id,
  prev_version AS from_version,
  setup_version AS to_version,
  shot_at AS switch_date,
  score AS first_score_after
FROM scored_versions
WHERE prev_version IS NOT NULL AND setup_version != prev_version;

-- Equipment journey: avg score by setup version (tracks progression as gear changes)
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
HAVING COUNT(*) >= 3;

-- Platform stats: aggregate numbers for the scale slide
CREATE OR REPLACE VIEW insights_platform_stats AS
SELECT
  (SELECT COUNT(DISTINCT id) FROM profiles) AS total_archers,
  (SELECT COUNT(*) FROM scores) AS total_rounds,
  (SELECT COUNT(*) FROM scores WHERE setup_id IS NOT NULL) AS rounds_with_setup,
  (SELECT COUNT(*) FROM bow_setups) AS total_setups,
  (SELECT COUNT(DISTINCT profile_id) FROM scores WHERE shot_at >= CURRENT_DATE - INTERVAL '30 days') AS active_archers_30d,
  (SELECT COUNT(*) FROM scores WHERE shot_at >= CURRENT_DATE - INTERVAL '30 days') AS rounds_30d;
