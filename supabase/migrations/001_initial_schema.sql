-- Wuzzabug Initial Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- ============================================================
-- TABLES
-- ============================================================

create table bugs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  video_url text,
  submitted_by uuid references auth.users(id),
  location text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  funny_score integer default 0,
  created_at timestamp with time zone default now()
);

create table votes (
  id uuid default gen_random_uuid() primary key,
  bug_id uuid references bugs(id) on delete cascade,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  unique(bug_id, user_id)
);

create table comments (
  id uuid default gen_random_uuid() primary key,
  bug_id uuid references bugs(id) on delete cascade,
  user_id uuid references auth.users(id),
  body text not null,
  created_at timestamp with time zone default now()
);

create table promotions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  start_date date,
  end_date date,
  theme text,
  active boolean default false,
  created_at timestamp with time zone default now()
);

create table ad_slots (
  id uuid default gen_random_uuid() primary key,
  position text not null,
  sponsor_name text,
  image_url text,
  link_url text,
  active boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table bugs enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table promotions enable row level security;
alter table ad_slots enable row level security;

-- Bugs: anyone can read approved bugs
create policy "Public read approved bugs"
  on bugs for select
  using (status = 'approved');

-- Bugs: admins can read all bugs
create policy "Admin read all bugs"
  on bugs for select
  using (auth.jwt() ->> 'email' = 'arlochild2026@gmail.com');

-- Bugs: authenticated users can insert
create policy "Authenticated users can submit bugs"
  on bugs for insert
  with check (auth.uid() = submitted_by);

-- Bugs: admins can update status
create policy "Admin can update bugs"
  on bugs for update
  using (auth.jwt() ->> 'email' = 'arlochild2026@gmail.com');

-- Votes: anyone can read
create policy "Anyone can read votes"
  on votes for select
  using (true);

-- Votes: authenticated users can insert/delete their own
create policy "Users can vote"
  on votes for insert
  with check (auth.uid() = user_id);

create policy "Users can unvote"
  on votes for delete
  using (auth.uid() = user_id);

-- Comments: anyone can read
create policy "Anyone can read comments"
  on comments for select
  using (true);

-- Comments: authenticated users can insert
create policy "Authenticated users can comment"
  on comments for insert
  with check (auth.uid() = user_id);

-- Ad slots: anyone can read active ads
create policy "Public read active ad slots"
  on ad_slots for select
  using (active = true);

-- Ad slots: admin full access
create policy "Admin manage ad slots"
  on ad_slots for all
  using (auth.jwt() ->> 'email' = 'arlochild2026@gmail.com');

-- Promotions: public read active
create policy "Public read active promotions"
  on promotions for select
  using (active = true);

-- Promotions: admin full access
create policy "Admin manage promotions"
  on promotions for all
  using (auth.jwt() ->> 'email' = 'arlochild2026@gmail.com');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run this separately in Supabase SQL Editor:

-- insert into storage.buckets (id, name, public) values ('bugs', 'bugs', true);

-- create policy "Anyone can view bug files"
--   on storage.objects for select
--   using (bucket_id = 'bugs');

-- create policy "Authenticated users can upload bug files"
--   on storage.objects for insert
--   with check (bucket_id = 'bugs' and auth.uid() is not null);

-- ============================================================
-- VOTE TRIGGER — keeps funny_score in sync automatically
-- Runs as SECURITY DEFINER so it can update bugs without
-- requiring an UPDATE policy for regular users.
-- ============================================================

create or replace function update_funny_score()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update bugs set funny_score = funny_score + 1 where id = NEW.bug_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update bugs set funny_score = funny_score - 1 where id = OLD.bug_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or delete on votes
  for each row execute function update_funny_score();

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

create index bugs_status_idx on bugs(status);
create index bugs_funny_score_idx on bugs(funny_score desc);
create index bugs_created_at_idx on bugs(created_at desc);
create index votes_bug_id_idx on votes(bug_id);
create index votes_user_id_idx on votes(user_id);
create index comments_bug_id_idx on comments(bug_id);
