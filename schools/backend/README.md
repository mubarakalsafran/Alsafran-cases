# Backend plan — Supabase only

Everything the site currently fakes in `localStorage` moves into one Supabase project.
No second service, no server of our own: Postgres holds the data, Supabase Auth holds the
accounts, Row Level Security does the authorising, Storage holds the photos.

`schema.sql` in this folder is the whole thing as one runnable migration. This file explains
what it does and in what order to adopt it.

---

## 1. What is frozen today, and what thaws it

| Frozen | Why it is frozen | What unfreezes it |
|---|---|---|
| **Accounts** | `hash()` is FNV-1a in the browser. Not a password hash. | Supabase Auth: bcrypt server-side, email confirmation, password reset, sessions |
| **Google / Apple sign-in** | Buttons create a fake local account | Real OAuth providers in Auth |
| **Reviews** | Live in one browser. Nobody else can see them | `reviews` table, readable by everyone once approved |
| **Moderation** | A client-side `status` field anyone could edit | RLS + a trigger that forces every submission to `pending` |
| **Admin dashboard** | Gated by JavaScript, which protects nothing | RLS: admin writes are rejected by Postgres, not by the UI |
| **Favourites** | Per-browser, lost on a new device | `favourites` table keyed to the account |
| **View counts / stats** | Per-browser, meaningless | `school_views` daily counters, written by an RPC |
| **School edits** | A patch layer in one admin's browser | `schools` table + `audit_log` of who changed what |
| **Photos** | CSS gradients standing in for real images | Storage bucket `school-media` |
| **Claim a listing** | A link that goes nowhere | `school_claims` table with a moderation queue |

## 2. Why Supabase alone is sufficient

The site is a read-heavy directory of 41 rows with a small write path. It needs a database,
authentication, authorisation, and file hosting — Supabase is all four. The pieces that would
normally push a project toward a custom API server are not present here:

- **No server-side rendering to do.** The site is static and hosted on Vercel already.
- **No business logic that cannot be a constraint, a trigger, or a policy.** Forcing a review
  to `pending`, recomputing a school's rating, blocking a suspended user — all of it is
  expressible in Postgres, so it holds no matter who calls the API.
- **No third-party integrations** in scope.

The one thing genuinely worth adding later is an Edge Function, and only for outbound email
(notifying a moderator that a review is waiting). Not needed for v1.

## 3. Shape of the data

```
auth.users ──┬── profiles        display name, blocked
             ├── user_roles      parent | moderator | admin   (never on profiles, see §4)
             ├── reviews         one per school per account, pending → approved/rejected
             ├── favourites      (user, school)
             └── school_claims   "this is my school, here is proof"

schools ─────┬── school_fees     one row per grade band
             ├── school_views    daily counters
             └── audit_log       every insert/update/delete, with before/after
```

Ratings are denormalised onto `schools.rating_avg` / `rating_count` by trigger, counting
approved reviews only, so the directory can sort by rating in one indexed query instead of
aggregating 41 subqueries on every page load.

Fee provenance survives the move intact: `fee_basis`, `fee_year`, `fee_source`, `fee_note`, and
either per-band rows in `school_fees` or a `fee_range_min/max`. `verified` is a *generated*
column — `fee_basis = 'school'` — so it cannot drift from the evidence behind it.

## 4. Authorisation is the part that matters

Three rules the current build breaks and this one cannot:

**Roles never live anywhere the user can write.** Not on `profiles`, and above all not in
`raw_user_meta_data`, which the account holder can edit through the API — a role stored there is
a self-service promotion to admin. They live in `user_roles`, which no client can read or write.

**Policy helpers live in a non-exposed schema.** `private.is_admin()` is `security definer`, so
it bypasses RLS to read `user_roles` without recursing. Anything `security definer` that
`authenticated` can execute is an open API endpoint, so `EXECUTE` is revoked from `anon`,
`authenticated` and `public`; only policies call them.

**A submission cannot arrive pre-approved.** The insert policy checks the author is the signed-in
user and is not blocked, and a `before insert` trigger stamps `status = 'pending'` regardless of
what the client sent. Approval is a separate `update` reachable only by a moderator.

Policies use `TO authenticated` and wrap helpers as `(select private.is_admin())`, which lets
Postgres evaluate them once per statement rather than once per row — the difference is roughly
11,000 ms versus 7 ms on Supabase's own benchmark for exactly this pattern.

## 5. Auth setup

- **Email + password**, confirmation on. Minimum 8 characters, as the UI already enforces.
- **Google** — free, needs an OAuth client in Google Cloud.
- **Apple** — needs a **paid Apple Developer account (~$99/year)**. If that is not wanted, drop
  the Apple button rather than leave a dead one.
- **Roles into the JWT** with a Custom Access Token Auth Hook reading `user_roles`, so the
  browser can hide the admin nav without a round trip. The hiding is cosmetic; RLS is the
  enforcement.
- **Email delivery**: Supabase's built-in SMTP is rate-limited and explicitly not for production.
  A real sender (Resend, SES, Postmark) has to be configured for confirmations and resets. This
  is the one place "Supabase only" needs an exception, and Supabase requires it too.

## 6. Search

`search_schools(q, max_rows)` reproduces the ranking the browser uses today — abbreviation match
beats name prefix beats substring — so results do not change when search moves server-side. A
`pg_trgm` GIN index over a generated `search_text` column backs it.

At 41 schools this is not needed for speed. Keep fetching the full catalogue once and filtering
in the browser, exactly as now: the payload is small, and it keeps the directory instant and
the typeahead offline-capable. Switch the typeahead to the RPC when the catalogue passes roughly
a thousand schools, or when fee data gets heavy enough to be worth not shipping wholesale.

## 7. What changes in the client

The data layer was built with one read path, which is what makes this small:

| Today | Becomes |
|---|---|
| `Data.all()` reads `SCHOOLS` + localStorage patch layer | one `select` on `schools` + `school_fees`, cached in memory |
| `Data.reviewsFor(id)` | `select` on `reviews where status='approved'` |
| `Data.rating(id)` | read `rating_avg` / `rating_count` off the school row |
| `Data.countView(id)` | `rpc('record_school_view')` |
| `Auth.*` (FNV-1a, localStorage) | `supabase.auth.*` |
| `Favs` | `favourites` table |
| `Compare` | **stays local** — it is ephemeral UI state, not data |
| `Data.edits/added/removed` patch layer | direct writes to `schools`, gated by RLS |

`supabase-js` loads from jsDelivr; no build step is introduced. Roughly 300 lines change, nearly
all inside `Data` and `Auth`.

## 8. Migrating what exists

1. **Schools** — generate `insert` statements from `assets/js/data.js`; it is already the shape of
   the table. One script, run once.
2. **Reviews** — there are none to migrate. Nothing was seeded, by design.
3. **Favourites** — on first sign-in after the switch, offer to copy whatever is in `localStorage`
   into the account, then clear it.
4. **The admin's local edits** — the dashboard's *Export catalogue as JSON* already emits the live
   catalogue; import that before switching over, so no correction is lost.

## 9. Phases

| Phase | Work | Rough effort |
|---|---|---|
| 0 | Create project, run `schema.sql`, seed 41 schools | half a day |
| 1 | Read path: schools and fees from Postgres | half a day |
| 2 | Auth: email + Google, sessions, account page | 1 day |
| 3 | Reviews: submit, own-pending visibility, moderation queue | 1 day |
| 4 | Favourites | 2 hours |
| 5 | Admin writes + audit log + user management | 1 day |
| 6 | Storage: real photos, replace the gradient tiles | half a day |
| 7 | Claims, view stats, rate limiting, advisor pass | 1 day |

Phases 1–4 are shippable on their own; the admin dashboard can keep running on the patch layer
until phase 5.

## 10. Cost and one real operational catch

Free plan covers this comfortably on volume: 500 MB database (the catalogue is well under 1 MB),
1 GB storage, 50,000 monthly active users, 5 GB egress.

**But free projects pause after 7 days of low activity**, restorable for 90 days. A public school
directory in its quiet season will hit that, and a paused project means the site's data layer is
simply down. Two honest options:

- **Pro, $25/month** — paid projects are never paused. The right answer if this is a real service.
- **Stay free** and accept it, keeping the catalogue readable by leaving `data.js` in place as a
  fallback the site can fall back to when the API is unreachable. Reviews and accounts would be
  unavailable during a pause.

Free also has no daily backups worth the name — worth knowing before real parent reviews exist
that cannot be regenerated.

## 11. This schema has been run, not just written

`schema.sql` was applied to a real Postgres 16 instance and `schema.test.sql` exercised the
authorisation model against it — **52 assertions, all passing**. Reproduce it:

```bash
createdb ksg
psql -d ksg -f local-harness.sql   # stubs auth.users / auth.uid() / storage, which Supabase manages
psql -d ksg -f schema.sql
psql -d ksg -f schema.test.sql     # every line must print "ok"
```

What the suite proves, per role: an anonymous visitor can read the directory and record a page
view but cannot write or see pending reviews; a parent's submission is forced to `pending` even
when the client sends `status:'approved'`, and they cannot review a school twice, approve their
own review, promote themselves, unblock anyone, or touch a school; a blocked account can still
read but cannot post; a moderator can work the queue but cannot edit the catalogue; only an admin
can, and every such edit lands in `audit_log`.

Writing it caught three defects that would otherwise have surfaced on the first day:

- **Revoking `EXECUTE` on the policy helpers broke every authenticated write.** A policy is
  evaluated as the *calling* role, so `authenticated` must be able to execute `is_blocked()`.
  What keeps those functions off the API is the unexposed `private` schema, not the grant.
- **`concat_ws` is `STABLE`, not `IMMUTABLE`**, so it cannot back a `GENERATED` column —
  `search_text` is maintained by trigger instead.
- **The blocked-flag guard locked out the seed script**, because `auth.uid()` is null for
  `service_role`. It now applies only to end users.

One nuance worth knowing when reading test output: under RLS an `UPDATE` or `DELETE` against rows
you may not touch affects **zero rows** rather than raising. "Was it refused?" is the wrong
assertion; "did anything change?" is the right one.

## 12. Before it goes live

- [ ] RLS enabled on **every** table in `public` (the migration does this; verify with the linter)
- [ ] Database Advisor security lints clean — especially `security definer` functions that
      `authenticated` can execute
- [ ] `service_role` key is not in any client bundle. Only the publishable key ships.
- [ ] Confirm as an anonymous user: cannot read pending reviews, cannot write anything
- [ ] Confirm as a parent: cannot approve their own review, cannot set their own role,
      cannot unblock themselves, cannot edit a school
- [ ] Confirm as a blocked user: reads still work, writes are refused
- [ ] Custom SMTP configured; confirmation and reset emails actually arrive
- [ ] Rate limit review submission (one per school per account is already a hard constraint)
- [ ] Backups: know what the plan actually retains

## 13. Decisions needed before phase 0

1. **Pro or free?** Pausing is the deciding factor, not the quotas.
2. **Apple sign-in?** It costs $99/year. Google alone is free and covers most people.
3. **Who moderates?** The `moderator` role exists so review approval does not require handing
   out full admin.
4. **Do reviews show real names?** Currently the display name is public next to each review.
   First name plus last initial is the usual compromise.
