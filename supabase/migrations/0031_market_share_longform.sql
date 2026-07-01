-- Coarsen insights_market_share so raw equipment FINGERPRINTS never leave the DB.
-- Was: one wide row per 7-field combo (bow+riser+limbs+sight+button+release_aid+draw)
--      — a row like "1 archer, riser X, limbs Y, sight Z, ..." is re-identifying (DPIA R2),
--      and it shipped to the browser even though nothing displayed it.
-- Now: LONG format — one row per single dimension (others null). All four consumers use
--      one dimension at a time and null-guard, so no combination is ever exposed.
--      Totals stay exact (computed directly per dimension). release_aid/draw_weight dropped
--      (unused by any consumer, and pure fingerprint entropy).
-- DROP+CREATE (not REPLACE) because the column set changes; no SQL view depends on this one.
DROP VIEW IF EXISTS insights_market_share;

CREATE VIEW insights_market_share AS
WITH ms_base AS (
  SELECT
    bs.bow_type,
    bs.riser,
    bs.limbs,
    bs.sight->>'name'  AS sight_name,
    bs.button->>'name' AS button_name,
    bs.profile_id,
    s.id AS score_id
  FROM bow_setups bs
  LEFT JOIN scores s ON s.setup_id = bs.id
  WHERE bs.is_active = true
)
SELECT bow_type, riser, NULL::text AS limbs, NULL::text AS sight_name, NULL::text AS button_name,
       COUNT(DISTINCT profile_id) AS archer_count, COUNT(DISTINCT score_id) AS round_count
FROM ms_base WHERE riser IS NOT NULL GROUP BY bow_type, riser
UNION ALL
SELECT bow_type, NULL, limbs, NULL, NULL,
       COUNT(DISTINCT profile_id), COUNT(DISTINCT score_id)
FROM ms_base WHERE limbs IS NOT NULL GROUP BY bow_type, limbs
UNION ALL
SELECT bow_type, NULL, NULL, sight_name, NULL,
       COUNT(DISTINCT profile_id), COUNT(DISTINCT score_id)
FROM ms_base WHERE sight_name IS NOT NULL GROUP BY bow_type, sight_name
UNION ALL
SELECT bow_type, NULL, NULL, NULL, button_name,
       COUNT(DISTINCT profile_id), COUNT(DISTINCT score_id)
FROM ms_base WHERE button_name IS NOT NULL GROUP BY bow_type, button_name;
