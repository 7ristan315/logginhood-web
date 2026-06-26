CREATE TABLE logo_votes (
  id bigint generated always as identity primary key,
  logo_filename text not null,
  profile_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

CREATE UNIQUE INDEX logo_votes_unique ON logo_votes (logo_filename, profile_id);

ALTER TABLE logo_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vote counts"
  ON logo_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON logo_votes FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can remove their own vote"
  ON logo_votes FOR DELETE USING (auth.uid() = profile_id);
