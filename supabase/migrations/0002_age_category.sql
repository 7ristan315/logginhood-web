-- Add age category to scores, matching the categories used by the
-- Logginhood scoring app's classification tables.
alter table public.scores
  add column age_category text check (
    age_category in ('U12', 'U14', 'U15', 'U16', 'U18', 'Senior', '50+', '60+')
  );
