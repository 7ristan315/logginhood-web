-- Number of arrows shot in the round (e.g. Portsmouth = 60, York = 144).
-- Separate from score_ends arrow detail — this is the total count, useful for
-- per-arrow averages and display. Null = not recorded / set later.
ALTER TABLE scores ADD COLUMN IF NOT EXISTS arrows_used integer;
