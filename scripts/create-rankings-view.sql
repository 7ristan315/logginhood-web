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
  p.full_name,
  p.gender,
  c.id  AS club_id,
  c.name AS club_name
FROM public.scores s
JOIN public.profiles p ON p.id = s.profile_id
LEFT JOIN public.clubs c ON c.id = p.club_id;

CREATE UNIQUE INDEX score_rankings_id_idx ON public.score_rankings (id);
CREATE INDEX score_rankings_round_idx ON public.score_rankings (round_name);
CREATE INDEX score_rankings_bow_idx ON public.score_rankings (bow_type);
CREATE INDEX score_rankings_age_idx ON public.score_rankings (age_category);
CREATE INDEX score_rankings_gender_idx ON public.score_rankings (gender);

CREATE OR REPLACE FUNCTION refresh_score_rankings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.score_rankings;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_rankings_scores ON public.scores;
DROP TRIGGER IF EXISTS trg_refresh_rankings_profiles ON public.profiles;

CREATE TRIGGER trg_refresh_rankings_scores
AFTER INSERT OR UPDATE OR DELETE ON public.scores
FOR EACH STATEMENT EXECUTE FUNCTION refresh_score_rankings();

CREATE TRIGGER trg_refresh_rankings_profiles
AFTER UPDATE ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION refresh_score_rankings();

GRANT SELECT ON public.score_rankings TO authenticated;
