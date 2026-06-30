-- Zone distribution: aggregate per-arrow score counts from ends JSONB
-- ends column format: [{end: 1, arrows: ["X","10","9"]}, ...]
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
HAVING COUNT(DISTINCT profile_id) >= 3;
