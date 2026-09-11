-- ============================================================================
-- Kuwait Schools Guide — Supabase schema
--
-- Everything the site needs lives in one Supabase project: Postgres for data,
-- Supabase Auth for accounts, Row Level Security for authorisation, Storage for
-- photos. No other backend service.
--
-- Authorisation is enforced here, in the database, not in the browser. The
-- current admin dashboard is gated by JavaScript, which protects nothing: a
-- client-side check is a suggestion. Every rule below is applied by Postgres
-- to every request, whatever it comes from.
--
-- Run order: this file is one migration. Apply with
--     supabase db push          (CLI, against a linked project)
-- or paste into the SQL editor.
-- ============================================================================

-- ---------------------------------------------------------------- extensions
create extension if not exists pg_trgm;      -- typeahead matching

-- A schema that is NOT exposed through the API. Security-definer helpers live
-- here so they can never be called directly over /rest/v1/rpc.
-- A schema that is NOT exposed through the API. PostgREST serves `public`
-- only, so security-definer helpers placed here cannot be invoked directly
-- over /rest/v1/rpc — they are reachable only from inside policies.
create schema if not exists private;

-- ---------------------------------------------------------------- enums
create type public.app_role       as enum ('parent','moderator','admin');
create type public.curriculum     as enum ('American','British','IB','Indian','Arabic','Early');
create type public.fee_basis      as enum ('school','directory','on-request','estimate');
create type public.review_status  as enum ('pending','approved','rejected');
create type public.claim_status   as enum ('open','verified','rejected');

-- ============================================================================
-- people
-- ============================================================================

create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text not null check (length(btrim(display_name)) between 2 and 80),
  blocked      boolean not null default false,
  created_at   timestamptz not null default now()
);
comment on table public.profiles is
  'Public-facing account data. Roles deliberately live elsewhere (user_roles).';

-- Only a moderator may change someone's blocked flag, including their own.
create or replace function private.guard_profile_columns()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- auth.uid() is null for service_role, the SQL editor and seed scripts, which
  -- legitimately administer accounts; the rule is about end users.
  if new.blocked is distinct from old.blocked
     and (select auth.uid()) is not null
     and not (select private.is_moderator()) then
    raise exception 'blocked may only be changed by a moderator';
  end if;
  return new;
end;
$$;

-- Roles are a separate table, not a column on profiles and never in
-- raw_user_meta_data — that field is writable by the user it belongs to, so a
-- role stored there is a self-service promotion to admin.
create table public.user_roles (
  user_id uuid not null references auth.users on delete cascade,
  role    public.app_role not null,
  primary key (user_id, role)
);

create index on public.user_roles (user_id);

-- Every new auth user gets a profile and the parent role.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  insert into public.user_roles (user_id, role) values (new.id, 'parent');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------- role lookup
-- Reading user_roles from inside a policy on user_roles would recurse, and
-- joining it on every row is slow. A security-definer helper in the private
-- schema sidesteps both. Policies call it as (select private.is_admin()) so
-- Postgres evaluates it once per statement rather than once per row.
create or replace function private.has_role(want public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = want
  );
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select private.has_role('admin'); $$;

create or replace function private.is_moderator()
returns boolean language sql stable security definer set search_path = ''
as $$ select private.has_role('admin') or private.has_role('moderator'); $$;

create or replace function private.is_blocked()
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce((select blocked from public.profiles where id = (select auth.uid())), false);
$$;

-- These bypass RLS by design, so they must not be reachable as API endpoints.
-- The protection is the schema, not the grant: PostgREST only exposes `public`,
-- so nothing in `private` can be called over /rest/v1/rpc.
--
-- The grants below are required, not optional. An RLS policy is evaluated as
-- the *calling* role, so if `authenticated` cannot execute is_blocked(), every
-- insert by a signed-in user fails with "permission denied for function" —
-- which looks like a broken app, not a locked-down one.
revoke execute on all functions in schema private from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.has_role(public.app_role) to anon, authenticated;
grant execute on function private.is_admin()     to anon, authenticated;
grant execute on function private.is_moderator() to anon, authenticated;
grant execute on function private.is_blocked()   to anon, authenticated;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function private.guard_profile_columns();

-- ============================================================================
-- schools
-- ============================================================================

create table public.schools (
  id            text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  name          text not null,
  name_ar       text,
  abbr          text,
  curriculum    public.curriculum not null,
  extras        text[] not null default '{}',
  gender        text,
  founded       int check (founded between 1900 and extract(year from now()) + 1),

  district      text not null,
  governorate   text not null,
  address       text,
  lat           double precision check (lat between 28.5 and 30.2),   -- Kuwait
  lng           double precision check (lng between 46.5 and 48.6),

  website       text,
  instagram     text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  phone         text,
  email         text,

  grade_from    text not null,
  grade_to      text not null,
  ages          text,
  languages     text[] not null default '{}',
  accreditation text[] not null default '{}',
  transport     boolean not null default false,
  facilities    text[] not null default '{}',

  blurb         text not null,
  about         text,
  theme         text[] not null default array['#0B2545','#1B6CA8']
                  check (array_length(theme,1) = 2),
  featured      boolean not null default false,

  -- fee provenance: the site shows a different badge per basis, and a school
  -- that publishes nothing must never be given an invented number
  fee_basis     public.fee_basis not null default 'estimate',
  fee_year      text,
  fee_source    text,
  fee_note      text,
  fee_range_min numeric(9,3) check (fee_range_min >= 0),
  fee_range_max numeric(9,3) check (fee_range_max >= fee_range_min),
  verified      boolean generated always as (fee_basis = 'school') stored,

  -- maintained by trigger from approved reviews only
  rating_avg    numeric(3,2) not null default 0,
  rating_count  int not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- A school that is not 'on-request' should carry either per-band rows or a
-- range. That cannot be a table constraint, because the bands live in another
-- table; it is asserted in the seed check and by the admin form instead.

create index on public.schools (curriculum);
create index on public.schools (district);
create index on public.schools (governorate);
create index on public.schools (featured) where featured;
create index on public.schools (rating_avg desc, rating_count desc);

-- Typeahead. Trigram indexes over a folded blob of the fields people type.
-- Maintained by trigger rather than GENERATED: concat_ws is only STABLE (it can
-- call type output functions), and a generated column requires IMMUTABLE.
alter table public.schools add column search_text text;

create or replace function private.sync_school_search()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.search_text := lower(
    coalesce(new.name,'')            || ' ' ||
    coalesce(new.name_ar,'')         || ' ' ||
    coalesce(new.abbr,'')            || ' ' ||
    coalesce(new.district,'')        || ' ' ||
    coalesce(new.governorate,'')     || ' ' ||
    coalesce(new.curriculum::text,'')|| ' ' ||
    coalesce(array_to_string(new.extras,' '),'') || ' ' ||
    coalesce(new.blurb,''));
  return new;
end;
$$;

create trigger schools_search_sync
  before insert or update on public.schools
  for each row execute function private.sync_school_search();

create index schools_search_trgm on public.schools using gin (search_text gin_trgm_ops);

create table public.school_fees (
  id         bigint generated always as identity primary key,
  school_id  text not null references public.schools on delete cascade,
  band       text not null,
  grade_from text not null,
  grade_to   text not null,
  amount     numeric(9,3) not null check (amount >= 0),
  sort_order int not null default 0
);
create index on public.school_fees (school_id, sort_order);

-- ============================================================================
-- reviews
-- ============================================================================

create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  school_id      text not null references public.schools on delete cascade,
  user_id        uuid not null references auth.users on delete cascade,
  rating         int  not null check (rating between 1 and 5),
  body           text not null check (length(btrim(body)) between 20 and 4000),
  tags           text[] not null default '{}',
  status         public.review_status not null default 'pending',
  created_at     timestamptz not null default now(),
  moderated_at   timestamptz,
  moderated_by   uuid references auth.users,
  moderator_note text,
  -- one review per school per account, which is what stops a single unhappy
  -- (or delighted) parent from running the rating on their own
  unique (school_id, user_id)
);
create index on public.reviews (school_id) where status = 'approved';
create index on public.reviews (status, created_at desc);
create index on public.reviews (user_id);

-- Ratings are denormalised onto schools so the directory can sort by them in
-- one indexed query. Only approved reviews count.
create or replace function private.refresh_school_rating(target text)
returns void language sql security definer set search_path = '' as $$
  update public.schools s
     set rating_avg = coalesce(agg.avg, 0),
         rating_count = coalesce(agg.n, 0)
    from (
      select avg(rating)::numeric(3,2) as avg, count(*) as n
        from public.reviews
       where school_id = target and status = 'approved'
    ) agg
   where s.id = target;
$$;

create or replace function private.on_review_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_school_rating(old.school_id);
    return old;
  end if;
  perform private.refresh_school_rating(new.school_id);
  if tg_op = 'UPDATE' and new.school_id <> old.school_id then
    perform private.refresh_school_rating(old.school_id);
  end if;
  return new;
end;
$$;

create trigger reviews_rating_sync
  after insert or update or delete on public.reviews
  for each row execute function private.on_review_change();

-- A submission must arrive as 'pending'. Without this a client could insert a
-- row that is already approved and skip moderation entirely.
create or replace function private.force_pending_on_insert()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not (select private.is_moderator()) then
    new.status := 'pending';
    new.moderated_at := null;
    new.moderated_by := null;
    new.moderator_note := null;
  end if;
  return new;
end;
$$;

create trigger reviews_force_pending
  before insert on public.reviews
  for each row execute function private.force_pending_on_insert();

-- ============================================================================
-- favourites, views, claims, audit
-- ============================================================================

create table public.favourites (
  user_id    uuid not null references auth.users on delete cascade,
  school_id  text not null references public.schools on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, school_id)
);
create index on public.favourites (user_id);

-- Daily counters rather than one row per hit: the dashboard only ever shows
-- totals and a most-viewed list, and this keeps the table small forever.
create table public.school_views (
  school_id text not null references public.schools on delete cascade,
  day       date not null default current_date,
  views     bigint not null default 0,
  primary key (school_id, day)
);

create or replace function public.record_school_view(p_school_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.school_views (school_id, day, views)
  values (p_school_id, current_date, 1)
  on conflict (school_id, day) do update set views = public.school_views.views + 1;
end;
$$;
-- deliberately callable by everyone, including signed-out visitors: it writes
-- one counter and reveals nothing
grant execute on function public.record_school_view(text) to anon, authenticated;

create table public.school_claims (
  id          uuid primary key default gen_random_uuid(),
  school_id   text not null references public.schools on delete cascade,
  claimant    uuid references auth.users on delete set null,
  contact     text not null,
  message     text,
  status      public.claim_status not null default 'open',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users
);

-- Who changed a school, and to what. Fee figures are the reason this exists:
-- when a number is disputed, the answer has to be recoverable.
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid references auth.users on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  before     jsonb,
  after      jsonb,
  at         timestamptz not null default now()
);
create index on public.audit_log (entity, entity_id, at desc);

create or replace function private.audit_schools()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (actor, action, entity, entity_id, before, after)
  values ((select auth.uid()), lower(tg_op), 'school',
          coalesce(new.id, old.id), to_jsonb(old), to_jsonb(new));
  return coalesce(new, old);
end;
$$;

create trigger schools_audit
  after insert or update or delete on public.schools
  for each row execute function private.audit_schools();

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger schools_touch before update on public.schools
  for each row execute function private.touch_updated_at();

-- ============================================================================
-- Row Level Security
--
-- Enabled on every table. Policies name their role with TO, and wrap helper
-- calls in (select ...) so they are evaluated once per statement.
-- ============================================================================

alter table public.profiles      enable row level security;
alter table public.user_roles    enable row level security;
alter table public.schools       enable row level security;
alter table public.school_fees   enable row level security;
alter table public.reviews       enable row level security;
alter table public.favourites    enable row level security;
alter table public.school_views  enable row level security;
alter table public.school_claims enable row level security;
alter table public.audit_log     enable row level security;

-- ---- schools + fees: world-readable, admin-writable -----------------------
create policy schools_read on public.schools
  for select to anon, authenticated using (true);
create policy schools_write on public.schools
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy fees_read on public.school_fees
  for select to anon, authenticated using (true);
create policy fees_write on public.school_fees
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---- profiles -------------------------------------------------------------
-- Display names appear next to reviews, so they are public. Nothing else is.
create policy profiles_read on public.profiles
  for select to anon, authenticated using (true);

-- A user may rename themselves. They may not unblock themselves — but that
-- cannot be expressed in the policy, because a policy on profiles that
-- subqueries profiles recurses. The column is guarded by a trigger instead.
create policy profiles_self_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy profiles_moderator_update on public.profiles
  for update to authenticated
  using ((select private.is_moderator())) with check ((select private.is_moderator()));

-- ---- user_roles: readable by nobody through the API, writable by admins ----
-- The client never needs to read this; the role reaches the browser in the JWT
-- via the access-token hook.
create policy roles_admin_all on public.user_roles
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- ---- reviews --------------------------------------------------------------
-- Approved reviews are public. Your own pending review is visible to you, so
-- the site can show it marked "awaiting moderation". Moderators see everything.
create policy reviews_read_approved on public.reviews
  for select to anon, authenticated using (status = 'approved');
create policy reviews_read_own on public.reviews
  for select to authenticated using ((select auth.uid()) = user_id);
create policy reviews_read_moderator on public.reviews
  for select to authenticated using ((select private.is_moderator()));

-- Post as yourself, only if you are not blocked. The trigger above forces the
-- row to 'pending' regardless of what was sent.
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id and not (select private.is_blocked()));

-- Edit your own review only while it is still unpublished.
create policy reviews_update_own on public.reviews
  for update to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status = 'pending');

create policy reviews_delete_own on public.reviews
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy reviews_moderate on public.reviews
  for update to authenticated
  using ((select private.is_moderator())) with check ((select private.is_moderator()));
create policy reviews_moderator_delete on public.reviews
  for delete to authenticated using ((select private.is_moderator()));

-- ---- favourites: strictly private to their owner --------------------------
create policy favourites_own on public.favourites
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- view counts: written only through record_school_view() ---------------
create policy views_read_moderator on public.school_views
  for select to authenticated using ((select private.is_moderator()));

-- ---- claims ---------------------------------------------------------------
create policy claims_insert_any on public.school_claims
  for insert to anon, authenticated with check (true);
create policy claims_read_own on public.school_claims
  for select to authenticated using ((select auth.uid()) = claimant);
create policy claims_moderator on public.school_claims
  for all to authenticated
  using ((select private.is_moderator())) with check ((select private.is_moderator()));

-- ---- audit log: admins read, nobody writes through the API ----------------
create policy audit_read_admin on public.audit_log
  for select to authenticated using ((select private.is_admin()));

-- Trigger functions are security definer as well. They are only ever fired by
-- Postgres, never called directly, so no role needs EXECUTE on them. This is
-- re-run at the end because several are created after the revoke above.
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_role(public.app_role) to anon, authenticated;
grant execute on function private.is_admin()     to anon, authenticated;
grant execute on function private.is_moderator() to anon, authenticated;
grant execute on function private.is_blocked()   to anon, authenticated;

-- ============================================================================
-- search
-- ============================================================================

-- Mirrors the ranking the browser uses today, so results do not change when the
-- search moves server-side: an abbreviation people actually use beats a name
-- prefix, which beats a substring buried in a description.
create or replace function public.search_schools(q text, max_rows int default 8)
returns table (
  id text, name text, name_ar text, abbr text, curriculum public.curriculum,
  district text, grade_from text, grade_to text,
  rating_avg numeric, rating_count int, fee_min numeric, score int
)
language sql stable set search_path = '' as $$
  with needle as (select lower(btrim(q)) as n)
  select s.id, s.name, s.name_ar, s.abbr, s.curriculum, s.district,
         s.grade_from, s.grade_to, s.rating_avg, s.rating_count,
         coalesce(s.fee_range_min, (select min(f.amount) from public.school_fees f
                                     where f.school_id = s.id)) as fee_min,
         case
           when lower(s.abbr) = needle.n                            then 100
           when position(needle.n in lower(s.name)) = 1             then 92
           when position(needle.n in lower(coalesce(s.abbr,''))) = 1 then 88
           when lower(s.name) like '% ' || needle.n || '%'          then 80
           when position(needle.n in lower(s.name)) > 0             then 70
           when position(needle.n in coalesce(s.name_ar,'')) > 0    then 66
           when position(needle.n in lower(s.district)) = 1         then 55
           when position(needle.n in lower(s.district)) > 0         then 50
           when position(needle.n in lower(s.curriculum::text)) = 1 then 45
           else 20
         end as score
    from public.schools s, needle
   where needle.n <> '' and s.search_text like '%' || needle.n || '%'
   order by score desc, s.rating_count desc, s.featured desc, s.name
   limit greatest(1, least(max_rows, 25));
$$;

grant execute on function public.search_schools(text, int) to anon, authenticated;

-- ============================================================================
-- storage
-- ============================================================================
-- Run once; buckets are rows, not DDL.
insert into storage.buckets (id, name, public)
values ('school-media', 'school-media', true)
on conflict (id) do nothing;

create policy school_media_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'school-media');
create policy school_media_write on storage.objects
  for all to authenticated
  using (bucket_id = 'school-media' and (select private.is_admin()))
  with check (bucket_id = 'school-media' and (select private.is_admin()));
