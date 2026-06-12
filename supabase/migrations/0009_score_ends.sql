-- Store per-end arrow scores alongside the aggregate total, so the scoring
-- app can show full round detail for rounds synced from any device.
alter table public.scores add column ends jsonb;
