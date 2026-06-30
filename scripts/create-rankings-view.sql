-- Rebuild score_rankings: add best_classification (window fn) and gov_body (derived)
DROP MATERIALIZED VIEW IF EXISTS public.score_rankings CASCADE;

CREATE MATERIALIZED VIEW public.score_rankings AS
SELECT
  s.id,
  s.profile_id,
  s.round_name,
  s.score,
  s.golds,
  s.shot_at,
  s.status,
  s.bow_type,
  s.age_category,
  s.classification,
  FIRST_VALUE(s.classification) OVER (
    PARTITION BY s.profile_id, s.bow_type
    ORDER BY ARRAY_POSITION(
      ARRAY['IA3','IA2','IA1','IB3','IB2','IB1','IMB','IGMB']::text[],
      s.classification
    ) DESC NULLS LAST
  ) AS best_classification,
  CASE WHEN s.round_name LIKE 'WA %' THEN 'WA' ELSE 'AGB' END AS gov_body,
  p.full_name,
  p.gender,
  c.id   AS club_id,
  c.name AS club_name
FROM public.scores s
JOIN public.profiles p ON p.id = s.profile_id
LEFT JOIN public.clubs c ON c.id = p.club_id;

CREATE UNIQUE INDEX score_rankings_id_idx      ON public.score_rankings (id);
CREATE INDEX score_rankings_round_idx          ON public.score_rankings (round_name);
CREATE INDEX score_rankings_bow_idx            ON public.score_rankings (bow_type);
CREATE INDEX score_rankings_age_idx            ON public.score_rankings (age_category);
CREATE INDEX score_rankings_gender_idx         ON public.score_rankings (gender);
CREATE INDEX score_rankings_gov_idx            ON public.score_rankings (gov_body);
CREATE INDEX score_rankings_shot_at_idx        ON public.score_rankings (shot_at DESC);

-- Rebuild trigger (CASCADE dropped it above)
CREATE OR REPLACE FUNCTION refresh_score_rankings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.score_rankings;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_rankings_scores   ON public.scores;
DROP TRIGGER IF EXISTS trg_refresh_rankings_profiles ON public.profiles;

CREATE TRIGGER trg_refresh_rankings_scores
AFTER INSERT OR UPDATE OR DELETE ON public.scores
FOR EACH STATEMENT EXECUTE FUNCTION refresh_score_rankings();

CREATE TRIGGER trg_refresh_rankings_profiles
AFTER UPDATE ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION refresh_score_rankings();

GRANT SELECT ON public.score_rankings TO authenticated;
