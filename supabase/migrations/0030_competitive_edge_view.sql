-- Competition vs practice performance per riser.
-- Fixes the Competitive Edge section: insights_equipment_performance never
-- carried scores.status, so the component couldn't split comp vs practice.
-- Dedicated view (not adding status to the shared view — that would split its
-- HAVING>=5 buckets and silently starve every other insights section).
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
HAVING COUNT(*) >= 5;
