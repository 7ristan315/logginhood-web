-- Tracks every version of classification thresholds with an effective date.
-- This allows applying the correct thresholds to scores by the date they were shot,
-- matching how Archery GB handles scheme changes (old scores retain the classification
-- earned under the rules at the time).

CREATE TABLE IF NOT EXISTS classification_threshold_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bow_type       text NOT NULL,
  age_category   text NOT NULL,
  gender         text NOT NULL,
  round_name     text NOT NULL,
  thresholds     integer[] NOT NULL,
  effective_from date NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cls_history_lookup
  ON classification_threshold_history (bow_type, age_category, gender, round_name, effective_from DESC);

ALTER TABLE classification_threshold_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read"  ON classification_threshold_history FOR SELECT USING (true);
CREATE POLICY "auth_insert"  ON classification_threshold_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Seed initial history from the current thresholds table (effective from 2023-01-01,
-- when AGB last overhauled the classification system).
INSERT INTO classification_threshold_history (bow_type, age_category, gender, round_name, thresholds, effective_from)
SELECT bow_type, age_category, gender, round_name, thresholds, '2023-01-01'::date
FROM classification_thresholds;
