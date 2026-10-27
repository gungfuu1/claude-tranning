-- Member profiles and login lockout for spec 003 (docs/003-member-registration-login.spec.md).
-- Accounts themselves live in auth.users (Supabase Auth); the app writes these tables only through
-- the server-side secret key, so anon/authenticated get no write access.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Stored lower-cased and trimmed so uniqueness and login are case-insensitive (BR-02).
  email text not null unique check (email = lower(btrim(email))),
  full_name text not null check (char_length(full_name) between 2 and 100 and full_name = btrim(full_name)),
  member_type text not null check (member_type in ('EMPLOYEE', 'PUBLIC')),
  -- Text, not a number, so a leading zero is kept (e.g. '012345').
  employee_id text unique,
  affiliation text,
  pdpa_consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  -- BR-04/BR-05: employees carry an id, affiliation and a @pea.co.th email; the public carry neither.
  constraint profiles_member_fields check (
    (member_type = 'EMPLOYEE'
      and employee_id ~ '^[0-9]{6}$'
      and affiliation is not null
      and split_part(email, '@', 2) = 'pea.co.th')
    or (member_type = 'PUBLIC' and employee_id is null and affiliation is null)
  )
);

alter table public.profiles enable row level security;

create policy "Members can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- BR-06: consecutive failed logins per account. Never exposed to users.
create table public.login_throttle (
  user_id uuid primary key references auth.users (id) on delete cascade,
  failed_count integer not null default 0 check (failed_count >= 0),
  locked_until timestamptz
);

alter table public.login_throttle enable row level security;
-- No policies: only the secret key (service_role, which bypasses RLS) reads or writes it.

-- New tables are not exposed to the Data API automatically; grant explicitly and narrowly.
revoke all on public.profiles, public.login_throttle from anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles, public.login_throttle to service_role;
