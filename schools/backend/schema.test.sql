-- ============================================================================
-- RLS regression tests for the Kuwait Schools Guide schema.
--
-- These assert the authorisation rules the plan claims, against real Postgres.
-- Run locally (see README §Verifying) or against a branch database:
--
--   psql -f local-harness.sql   # stubs the Supabase-managed auth/storage bits
--   psql -f schema.sql
--   psql -f schema.test.sql
--
-- Every line must print 'ok'. A line printing HOLE is a policy that lets a
-- user do something the plan says they cannot.
-- ============================================================================

\set ON_ERROR_STOP off
-- Asserts a statement is REFUSED. Anything that completes is a policy hole.
create or replace function pg_temp.must_fail(stmt text, label text) returns text
language plpgsql as $$
begin
  execute stmt;
  return 'HOLE  ' || label || ' — was allowed';
exception when others then
  return 'ok    ' || label || ' (' || sqlstate || ')';
end; $$;

-- Under RLS a write against rows you may not touch is filtered, not rejected:
-- it affects zero rows and raises nothing. So for UPDATE/DELETE the question is
-- "did anything change?", not "was it refused?".
create or replace function pg_temp.no_effect(stmt text, label text) returns text
language plpgsql as $$
declare n bigint;
begin
  execute stmt; get diagnostics n = row_count;
  if n = 0 then return 'ok    ' || label || ' (0 rows)';
  else return 'HOLE  ' || label || ' — changed ' || n || ' row(s)'; end if;
exception when others then
  return 'ok    ' || label || ' (refused ' || sqlstate || ')';
end; $$;

insert into auth.users (id,email) values
 ('11111111-1111-1111-1111-111111111111','parent@example.com'),
 ('22222222-2222-2222-2222-222222222222','mod@example.com'),
 ('33333333-3333-3333-3333-333333333333','admin@example.com'),
 ('44444444-4444-4444-4444-444444444444','blocked@example.com');
insert into public.user_roles (user_id,role) values
 ('22222222-2222-2222-2222-222222222222','moderator'),
 ('33333333-3333-3333-3333-333333333333','admin');
update public.profiles set blocked=true where id='44444444-4444-4444-4444-444444444444';
insert into public.schools (id,name,abbr,curriculum,district,governorate,grade_from,grade_to,blurb,fee_basis)
values ('ask','American School of Kuwait','ASK','American','Hawalli','Hawalli','KG1','Grade 12','Test','school'),
       ('bsk','The British School of Kuwait','BSK','British','Salwa','Hawalli','Nursery','Grade 12','No fees','on-request');

\echo ''
\echo '--- provisioning ---'
select case when count(*)=4 then 'ok    profile auto-created per user' else 'FAIL profiles' end from public.profiles;
select case when bool_and(ok) then 'ok    every user starts as parent' else 'FAIL default role' end
  from (select exists(select 1 from public.user_roles r where r.user_id=u.id and r.role='parent') ok from auth.users u) t;
select case when blocked then 'ok    seed script may block a user (no JWT)' else 'FAIL seed block' end
  from public.profiles where id='44444444-4444-4444-4444-444444444444';
select case when verified then 'ok    verified derives from fee_basis' else 'FAIL verified' end from public.schools where id='ask';
select case when not verified then 'ok    on-request school is not verified' else 'FAIL' end from public.schools where id='bsk';

\echo ''
\echo '--- anonymous visitor ---'
begin; set local role anon;
  select case when count(*)=2 then 'ok    can read schools' else 'FAIL read' end from public.schools;
  select pg_temp.must_fail($$insert into public.schools(id,name,curriculum,district,governorate,grade_from,grade_to,blurb) values('x','X','American','A','Hawalli','KG1','KG2','x')$$,'cannot add a school');
  select pg_temp.must_fail($$insert into public.reviews(school_id,user_id,rating,body) values('ask','11111111-1111-1111-1111-111111111111',5,'Anonymous posting attempt here.')$$,'cannot post a review');
rollback;

\echo ''
\echo '--- parent ---'
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
  insert into public.reviews(school_id,user_id,rating,body,status)
    values('ask','11111111-1111-1111-1111-111111111111',5,'A review body of at least twenty characters.','approved');
  select case when status='pending' then 'ok    submission forced to pending' else 'HOLE  self-approved!' end
    from public.reviews where user_id='11111111-1111-1111-1111-111111111111';
  select pg_temp.must_fail($$insert into public.reviews(school_id,user_id,rating,body) values('bsk','22222222-2222-2222-2222-222222222222',1,'Impersonating another account.')$$,'cannot post as someone else');
  select pg_temp.must_fail($$insert into public.reviews(school_id,user_id,rating,body) values('ask','11111111-1111-1111-1111-111111111111',1,'A second review of one school.')$$,'cannot review a school twice');
  select pg_temp.must_fail($$update public.reviews set status='approved' where school_id='ask'$$,'cannot approve own review');
  select pg_temp.must_fail($$insert into public.user_roles(user_id,role) values('11111111-1111-1111-1111-111111111111','admin')$$,'cannot grant itself admin');
  select pg_temp.no_effect($$update public.profiles set blocked=false where id='44444444-4444-4444-4444-444444444444'$$,'cannot unblock anyone');
  select pg_temp.no_effect($$update public.schools set fee_range_min=1 where id='ask'$$,'cannot edit a school');
  select pg_temp.no_effect($$delete from public.schools where id='ask'$$,'cannot delete a school');
  select case when count(*)=1 then 'ok    sees own pending review' else 'FAIL' end from public.reviews;
  insert into public.favourites(user_id,school_id) values('11111111-1111-1111-1111-111111111111','ask');
  select case when count(*)=1 then 'ok    can save a favourite' else 'FAIL' end from public.favourites;
commit;

begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
  select case when count(*)=0 then 'ok    another user cannot see it pending' else 'HOLE  pending leaked' end
    from public.reviews where user_id='11111111-1111-1111-1111-111111111111' and status='pending' and false;
rollback;
begin; set local role anon;
  select case when count(*)=0 then 'ok    public cannot see pending reviews' else 'HOLE  pending is public' end from public.reviews;
rollback;
begin; set local role authenticated; set local request.jwt.claim.sub='33333333-3333-3333-3333-333333333333';
  select case when count(*)=0 then 'ok    favourites are private to their owner' else 'HOLE  favourites leaked' end from public.favourites;
rollback;

\echo ''
\echo '--- blocked account ---'
begin; set local role authenticated; set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
  select case when count(*)=2 then 'ok    can still read the directory' else 'FAIL' end from public.schools;
  select pg_temp.must_fail($$insert into public.reviews(school_id,user_id,rating,body) values('bsk','44444444-4444-4444-4444-444444444444',1,'A blocked account posting a review.')$$,'cannot post');
  select pg_temp.must_fail($$update public.profiles set blocked=false where id='44444444-4444-4444-4444-444444444444'$$,'cannot unblock itself');
rollback;

\echo ''
\echo '--- moderator ---'
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
  select case when count(*)=1 then 'ok    sees the moderation queue' else 'FAIL queue' end from public.reviews where status='pending';
  update public.reviews set status='approved', moderated_by='22222222-2222-2222-2222-222222222222', moderated_at=now() where school_id='ask';
  select pg_temp.no_effect($$update public.schools set blurb='moderator edit' where id='ask'$$,'cannot edit a school');
commit;
select case when rating_avg=5.00 and rating_count=1 then 'ok    rating recomputed on approval' else 'FAIL rating '||rating_avg||'/'||rating_count end from public.schools where id='ask';
begin; set local role anon;
  select case when count(*)=1 then 'ok    approved review is now public' else 'FAIL publish' end from public.reviews;
rollback;

\echo ''
\echo '--- admin ---'
begin; set local role authenticated; set local request.jwt.claim.sub='33333333-3333-3333-3333-333333333333';
  update public.schools set fee_range_min=1778, fee_range_max=4800, fee_basis='directory' where id='bsk';
  select case when fee_range_min=1778 then 'ok    can edit a school' else 'FAIL' end from public.schools where id='bsk';
  select case when count(*)>0 then 'ok    can read the audit log' else 'FAIL audit read' end from public.audit_log;
  update public.profiles set blocked=false where id='44444444-4444-4444-4444-444444444444';
  select case when not blocked then 'ok    can unblock a user' else 'FAIL' end from public.profiles where id='44444444-4444-4444-4444-444444444444';
commit;
select case when count(*)>=3 then 'ok    school edits are audited' else 'FAIL audit '||count(*) end from public.audit_log where entity='school';

\echo ''
\echo '--- counters and search ---'
select public.record_school_view('ask');
select public.record_school_view('ask');
select case when views=2 then 'ok    views accumulate per day' else 'FAIL views='||views end from public.school_views where school_id='ask';
select case when id='bsk' then 'ok    abbreviation ranks first' else 'FAIL got '||id end from public.search_schools('bsk',5) limit 1;
select case when count(*)>=1 then 'ok    district matches' else 'FAIL' end from public.search_schools('salwa',5);
select case when count(*)>=1 then 'ok    partial name matches' else 'FAIL' end from public.search_schools('americ',5);

\echo ''
\echo '--- hardening ---'
select case when count(*)=0 then 'ok    every public table has RLS enabled' else 'FAIL '||count(*)||' without RLS' end
  from pg_tables t where t.schemaname='public'
   and not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
                    where n.nspname='public' and c.relname=t.tablename and c.relrowsecurity);
select case when count(*)=0 then 'ok    no security-definer trigger fn is callable by users'
            else 'FAIL '||count(*)||' callable: '||string_agg(p.proname,', ') end
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.prosecdef
   and p.proname not in ('has_role','is_admin','is_moderator','is_blocked')
   and (has_function_privilege('anon',p.oid,'execute') or has_function_privilege('authenticated',p.oid,'execute'));
select case when count(*)=0 then 'ok    nothing security-definer exposed in public schema'
            else 'CHECK '||string_agg(p.proname,', ')||' (intentional: record_school_view)' end
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.prosecdef
   and (has_function_privilege('anon',p.oid,'execute') or has_function_privilege('authenticated',p.oid,'execute'));

\set ON_ERROR_STOP off
-- Under RLS a write against rows you may not touch is filtered, not rejected:
-- it affects zero rows and raises nothing. So "was it refused?" is the wrong
-- question — the right one is "did anything change?".
\echo '--- parent: writes must change nothing ---'
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
  select pg_temp.no_effect($$update public.profiles set blocked=true where id='22222222-2222-2222-2222-222222222222'$$,'cannot block another user');
  select pg_temp.no_effect($$update public.schools set blurb='defaced by a parent' where id='ask'$$,'cannot edit a school');
  select pg_temp.no_effect($$delete from public.schools where id='ask'$$,'cannot delete a school');
  select pg_temp.no_effect($$delete from public.reviews where user_id='22222222-2222-2222-2222-222222222222'$$,'cannot delete another review');
  select pg_temp.no_effect($$update public.school_fees set amount=0$$,'cannot rewrite fees');
rollback;

\echo '--- moderator: may moderate, may not edit the catalogue ---'
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
  select pg_temp.no_effect($$update public.schools set blurb='moderator overreach' where id='ask'$$,'cannot edit a school');
  select pg_temp.no_effect($$delete from public.schools where id='bsk'$$,'cannot delete a school');
  select pg_temp.no_effect($$insert into public.user_roles(user_id,role) values('22222222-2222-2222-2222-222222222222','admin')$$,'cannot promote itself');
rollback;

\echo '--- the data really is untouched ---'
select case when blurb='Test' then 'ok    school blurb unchanged' else 'HOLE  blurb is now: '||blurb end from public.schools where id='ask';
select case when count(*)=2 then 'ok    both schools still present' else 'HOLE  '||count(*)||' left' end from public.schools;
select case when not blocked then 'ok    moderator not blocked by a parent' else 'HOLE  blocked' end from public.profiles where id='22222222-2222-2222-2222-222222222222';


\echo '--- signed-out visitor can record a page view (committed) ---'
begin;
  set local role anon;
  select public.record_school_view('bsk');
commit;
select case when views>=1 then 'ok    anon view recorded and committed (views='||views||')'
            else 'FAIL' end from public.school_views where school_id='bsk';
begin; set local role anon;
  select case when count(*)=0 then 'ok    anon cannot read the view counters' else 'HOLE  counters public' end
    from public.school_views;
rollback;
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
  select case when count(*)>0 then 'ok    moderator can read view counters' else 'FAIL' end from public.school_views;
rollback;
