-- Training courses shown on the public homepage.
create table public.courses (
  id bigint generated always as identity primary key,
  code text not null unique, -- human-facing course code, e.g. 'c-101'
  title text not null,
  category text not null,
  instructor text not null,
  duration_hours integer not null check (duration_hours > 0),
  level text not null check (level in ('พื้นฐาน', 'กลาง', 'ขั้นสูง')),
  mode text not null check (mode in ('ออนไลน์', 'ในห้องเรียน', 'ผสมผสาน')),
  start_date date not null,
  published_at date not null default current_date,
  enrolled integer not null default 0 check (enrolled >= 0),
  capacity integer not null check (capacity >= 0),
  graduates integer not null default 0 check (graduates >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now()
);

create index courses_start_date_idx on public.courses (start_date);

-- Public, read-only: anyone may read courses; writes need the dashboard or a service role.
alter table public.courses enable row level security;

create policy "Courses are viewable by everyone"
  on public.courses for select
  to anon, authenticated
  using (true);

-- Aggregates for the stats strip and category grid (security_invoker keeps RLS in force).
create view public.course_stats
with (security_invoker = true) as
select
  count(*)::int as total_courses,
  coalesce(sum(enrolled), 0)::int as total_learners,
  coalesce(sum(graduates), 0)::int as graduates,
  count(distinct instructor)::int as instructors
from public.courses;

create view public.course_categories
with (security_invoker = true) as
select category as name, count(*)::int as count
from public.courses
group by category;

-- Supabase's default privileges grant anon/authenticated everything on new public objects;
-- narrow that to read-only (least privilege) and grant explicitly in case the Data API
-- isn't set to expose new tables automatically.
revoke all on public.courses, public.course_stats, public.course_categories from anon, authenticated;
grant select on public.courses, public.course_stats, public.course_categories to anon, authenticated;
