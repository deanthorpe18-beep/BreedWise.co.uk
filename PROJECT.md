# BreedWise.co.uk — Project Documentation

> **Source of truth** for architecture, database schema, auth flows, deployment, and environment configuration.

---

## 1. Project Overview

**BreedWise** is a UK-wide dog breeder directory built on:

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2 (App Router, React 18) |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL (eu-west-2) |
| Auth | Supabase Auth (email/password + OAuth) |
| Email | Resend |
| Hosting | Railway (custom domain via Cloudflare) |
| Analytics | Self-hosted (page_views, cta_clicks, user_sessions) |

### Philosophy
- **Directory only** — we do not sell puppies or endorse breeders.
- **Public-first** — breeder profiles are public pages; auth is only required for claims, admin, and account management.
- **Low cost** — no Redis, no external analytics SaaS, no unnecessary services.

---

## 2. Database Schema

### Role Enum
```sql
CREATE TYPE public.app_role AS ENUM ('public', 'buyer', 'breeder', 'admin', 'super_admin');
```

### Core Tables

#### `profiles` (extends `auth.users`)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, FK → `auth.users` |
| `display_name` | text | Defaults to email |
| `role` | app_role | Default `'breeder'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Trigger:** `on_auth_user_created` auto-creates a `profiles` row on `auth.users` INSERT.

#### `breeders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `slug` | text | Unique, URL-safe |
| `name` | text | Business name |
| `address`, `town`, `postcode`, `county`, `region`, `country` | text | Location |
| `lat`, `lng` | numeric | GPS coordinates |
| `website`, `phone`, `email` | text | Contact info |
| `google_rating` | numeric(2,1) | From Google Places |
| `google_review_count` | integer | From Google Places |
| `business_type` | text | From Google Places (e.g. "Pet Store") |
| `google_place_id` | text | Google Places ID |
| `status` | text | `public_listing`, `claimed_profile`, `hidden`, `archived` |
| `claimed` | boolean | |
| `hero_image_url` | text | Primary photo |
| `google_photo_urls` | text[] | Additional photo URLs |
| `source_tags` | text[] | `['google_places', 'uk_wide']` |
| `confidence_score` | numeric | 0–1 quality score |

#### `breeder_breeds`
Many-to-many linker: `breeder_id` + `breed` (unique pair).

#### `breeder_photos`
Stored photo metadata: `photo_reference`, `photo_url`, `width`, `height`, `is_primary`.

### Admin & Audit Tables

#### `admin_audit_log`
Admin actions: `action`, `target_table`, `target_id`, `old_values`, `new_values`, `admin_id`, `ip_address`.

#### `user_audit_log`
User-facing audit log (new in migration 011). Same shape as `admin_audit_log` but for all user actions.

#### `breeder_audit_log`
Auto-populated by trigger on `breeders` table. Captures `create`/`update`/`delete` with before/after JSON diffs.

### Claims & Removals

#### `claims`
| Column | Notes |
|--------|-------|
| `breeder_slug` | Target listing |
| `claimant_email`, `claimant_name`, `claimant_user_id` | Who is claiming |
| `status` | `pending`, `under_review`, `approved`, `rejected` |
| `reviewed_by`, `reviewed_at` | Admin decision |

#### `removals`
Same structure as `claims` but for removal/GDPR requests. Includes `gdpr_article_17` flag and `hard_deleted_at`/`hard_deleted_by` for GDPR erasure.

### Analytics Tables

#### `page_views`
| Column | Notes |
|--------|-------|
| `breeder_slug` | Which profile was viewed (nullable) |
| `page_path` | Generic page path |
| `ip_hash` | Hashed for privacy |
| `user_agent`, `referrer` | |

#### `cta_clicks`
| Column | Notes |
|--------|-------|
| `breeder_slug` | |
| `action_type` | `call`, `website`, `save`, `claim`, `email`, `directions` |

#### `user_sessions`
Heartbeat table for "users online" count. Updated every 2 minutes by `SessionTracker`.

### Email Templates

#### `email_templates` (migration 011)
| Column | Notes |
|--------|-------|
| `template_key` | Unique identifier |
| `subject`, `html_body`, `text_body` | Content with `{{variable}}` placeholders |
| `from_address` | Defaults to `BreedWise <noreply@breedwise.co.uk>` |
| `active` | Toggle on/off |

**Seeded templates:** `verification`, `password_reset`, `claim_approved`, `claim_rejected`, `removal_approved`, `removal_rejected`, `message_notification`, `welcome`.

### Notifications

#### `user_notifications` (migration 011)
In-app notification system: `type`, `title`, `message`, `action_url`, `read`.

---

## 3. Auth Flow

### Role Hierarchy
```
super_admin  → can do everything + manage admins + reset passwords + change emails
admin        → can manage breeders, claims, removals, view analytics
breeder      → default registered user, can claim listings
buyer        → can save favourites (future)
public       → anonymous visitor (no DB row)
```

### Registration Flow
1. User fills signup form → `POST /api/auth/signup`
2. Server validates (Zod schema), rate-limits, calls `supabase.auth.signUp()`
3. Supabase sends verification email with magic link
4. User clicks link → `/auth/callback?code=xxx` → `exchangeCodeForSession(code)`
5. Trigger `on_auth_user_created` creates `profiles` row with `role = 'breeder'`
6. User is now authenticated

### Login Flow
1. `POST /api/auth/login` → `signInWithPassword()`
2. Server checks `email_confirmed_at` — unverified users get `needsVerification: true`
3. Server fetches `profiles.role` → returns `{ redirectTo: "/admin" }` for admins, `"/"` for breeders
4. Client calls `router.push()` + `router.refresh()` → `AuthProvider` re-fetches `/api/auth/me`
5. `MainNav` instantaneously updates (dropdown with avatar + role badge)

### OAuth (Google / Apple)
Supabase Auth supports OAuth providers natively. To enable:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** and/or **Apple**
3. Add Client ID + Secret
4. Set redirect URL: `https://breedwise.co.uk/auth/callback`
5. No code changes needed — the existing `/auth/callback` route handles all OAuth flows

### Session Management
- **Middleware** refreshes session cookies on every request via `supabase.auth.getUser()`
- **Cookie cleanup** on auth failure: clears `sb-{project-ref}-auth-token` and related cookies
- **Session tracker** sends heartbeat every 2 minutes for analytics

---

## 4. Security Architecture

### Rate Limiting (in-memory, Railway-safe)
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 5 min |
| `/api/auth/signup` | 5 attempts | 60 sec |
| `/api/auth/forgot` | 3 attempts | 60 sec |
| `/api/auth/resend` | 3 attempts | 60 sec |
| `/api/places/[placeId]` | 30 requests | 60 sec |
| `/api/track/*` | 60 requests | 60 sec |
| `/api/cookie-consent` | 10 requests | 60 sec |
| `/api/claims` | 5 attempts | 60 sec |
| `/api/removals` | 5 attempts | 60 sec |

**Note:** In-memory rate limiting is safe on Railway because Railway runs persistent processes (not serverless). A TTL cleanup runs every 10 minutes to prevent memory leaks.

### SQL Injection Prevention
- **Never** interpolate user input into `.or()` strings directly.
- Search queries sanitize: `query.replace(/[%_(),&]/g, "")` before interpolation.
- Admin API routes use parameterized queries only.

### XSS Protection
- **CSP** header set in middleware:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.supabase.co`
  - `frame-ancestors 'none'`
- **X-Frame-Options: DENY**
- **X-Content-Type-Options: nosniff**

### Admin Route Protection
- **Middleware** blocks `/admin` for non-authenticated users (redirects to login)
- **Middleware** blocks `/admin` for non-admin roles (redirects to home)
- **API routes** use shared `requireAdmin()` / `requireSuperAdmin()` helpers
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is **never** exposed to client — only used server-side in API routes

### Audit Logging
- **Admin actions** logged to `admin_audit_log`
- **Breeder changes** auto-logged by trigger to `breeder_audit_log`
- **User actions** logged to `user_audit_log` (migration 011)

---

## 5. Admin & Super Admin System

### Admin Dashboard (`/admin`)
Tabs:
1. **Review Queue** — claims & removals with approve/reject/hard-delete
2. **Breeders** — CRUD + search/filter + add manually
3. **Analytics** — unique visitors (today/week/month/year/total), page views, CTA clicks, top breeders
4. **Audit Log** — breeder change history with before/after diffs
5. **Statistics** — total breeders, claims, removals, users
6. **Admins** — list admins, add/remove, super admin actions

### Super Admin Powers
Only users with `role = 'super_admin'` can:
- Reset any user's password (`POST /api/admin/users/reset-password`)
- Change any user's email (`POST /api/admin/users/change-email`)
- Create/remove other admins
- View full audit logs

### Creating the First Super Admin
Use the setup endpoint:
```bash
curl -X POST https://breedwise.co.uk/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secure123","secret":"YOUR_ADMIN_SETUP_SECRET"}'
```

Then manually promote to super_admin in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'you@example.com';
```

---

## 6. Railway Infrastructure

### Deployment
- **Platform:** Railway (persistent Node.js container)
- **Build command:** `npm run build`
- **Start command:** `npm start` (Next.js production server)
- **Health check:** `GET /api/health` returns `{ status: "ok" }`

### Environment Variables (Railway)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zbvwqsjgasgxpphljahs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Places
GOOGLE_PLACES_API_KEY=your_key
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key

# Resend
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=info@breedwise.co.uk
RESEND_NOREPLY_EMAIL=noreply@breedwise.co.uk
RESEND_ADMIN_EMAIL=admin@breedwise.co.uk

# Admin
ADMIN_SETUP_SECRET=your_random_secret

# Cron
CRON_SECRET=your_random_secret

# Site
NEXT_PUBLIC_SITE_URL=https://breedwise.co.uk
```

### Scheduled Jobs
Use Railway's native cron or an external scheduler (e.g., cron-job.org) to hit:
```
GET https://breedwise.co.uk/api/cron/google-refresh
Authorization: Bearer {CRON_SECRET}
```

### No Vercel Dependencies
- All `vercel.json` headers are ignored on Railway
- All cache control is handled by `next.config.js` and `middleware.js`
- The `no-store` Cache-Control is temporary during active development

---

## 7. Resend Email Integration

### Sent Emails
| Trigger | Template | Recipient |
|---------|----------|-----------|
| Signup | Verification | User |
| Forgot password | Password reset | User |
| Claim submitted | Claim confirmation | User |
| Claim submitted | Admin notification | Admin |
| Claim approved/rejected | Status update | User |
| Removal submitted | Removal confirmation | User |
| Removal submitted | Admin notification | Admin |
| Removal approved/rejected | Status update | User |
| Contact form | Confirmation | User |

### Template System (migration 011)
Templates are stored in `email_templates` table. Placeholders use `{{variable}}` syntax:
- `{{name}}` — user display name
- `{{verification_url}}` — magic link
- `{{reset_url}}` — password reset link
- `{{breeder_name}}` — breeder business name
- `{{profile_url}}` — link to breeder profile
- `{{reason}}` — admin decision reason

---

## 8. Migrations Order

Run in Supabase SQL Editor in this order:

1. `001_initial_schema.sql`
2. `002_breeders_and_hardening.sql`
3. `003_admin_status_updates.sql`
4. `004_idempotent_fix.sql`
5. `005_cookie_consent_email_audit.sql`
6. `006_apply_missing.sql`
7. `007_fix_profiles_rls_recursion.sql`
8. `008_admin_analytics.sql`
9. `009_enrich_breeders.sql`
10. `010_visitor_analytics.sql`
11. `011_comprehensive_auth_roles_security.sql` ⭐ **NEW**

---

## 9. File Structure (key paths)

```
app/
  layout.js                 → Root layout with AuthProvider + ToastProvider
  middleware.js             → Session refresh + security headers + admin protection
  page.js                   → Homepage
  search/page.js            → Search results with pagination
  breeder/[slug]/page.js    → Public breeder profile
  auth/
    login/page.js           → Login with toast
    signup/page.js          → Signup with toast
    callback/route.js       → OAuth/email verification callback
    forgot/page.js          → Password reset request
    reset/page.js           → Password reset form
  admin/page.js             → Admin dashboard (6 tabs)
  api/
    auth/                   → Login, logout, signup, me, forgot, reset, resend
    admin/                  → Analytics, breeders, claims, removals, users, audit
    track/                  → page-view, cta, session
    places/[placeId]        → Google Places proxy (rate-limited)
    cron/google-refresh     → Weekly breeder refresh
lib/
  auth.js                   → Shared requireAdmin / requireSuperAdmin helpers
  supabase/
    server.js               → createClient() + createAdminClient()
    middleware.js           → updateSession() for Next.js middleware
    client.js               → Browser-side Supabase client
  rate-limit.js             → In-memory rate limiter with TTL cleanup
  validation.js             → Zod schemas for forms
  emails/resend.js          → Email sending functions
  seo/                      → Metadata, structured data helpers
components/
  AuthProvider.js           → React context for auth state
  Toast.js                  → Toast notification system
  MainNav.js                → Header with user dropdown + role badge
  SearchForm.js             → Search with geolocation + distance
  SearchResults.js          → Results with pagination
```

---

## 10. Known Limitations & Future Work

| Limitation | Reason | Future Fix |
|------------|--------|------------|
| In-memory rate limiter | No Redis (cost) | Add Upstash Redis if traffic scales |
| No real-time updates | No WebSocket | Add Supabase Realtime for notifications |
| Google Places API quota | Costs money | Cache photos aggressively; consider paid tier |
| OAuth requires dashboard config | Supabase provider settings | Documented in Auth Flow section |
| No buyer role usage | Not yet implemented | Add favourites, saved searches, messaging |
| `no-store` Cache-Control | Active debugging | Switch to `max-age=0, must-revalidate` when stable |

---

*Last updated: 2026-06-06 by Kimi Code CLI*
