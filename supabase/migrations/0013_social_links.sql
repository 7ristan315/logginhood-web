-- Let users store links to their social media accounts for use in
-- features like "post my score".
alter table public.profiles add column social_links jsonb not null default '{}'::jsonb;
