# BreedWise — Project Source of Truth

> A living document for developers, AI assistants, and team members.  
> Last updated: 2026-06-06

---

## 1. Project Overview

**BreedWise** is a UK dog breeder directory. It helps prospective dog buyers compare public breeder information before making contact. It also gives breeders a way to claim their profile, improve accuracy, or request removal.

**Target audience**
- Dog buyers searching for breeders by town, postcode, or breed
- UK dog breeders who want to manage or remove their public listing

**Business model**
- Free directory with public listings
- Future premium listings (not yet implemented)
- AdSense integration (feature-flagged, not yet enabled)

**Geographic focus**
- Currently West Sussex and surrounding areas
- Scalable to UK-wide rollout via dynamic SEO landing pages

**Core principles**
- Transparency: clearly show data sources and last-updated dates
- No endorsement: inclusion does not mean recommendation, vetting, or guarantee
- No puppy sales: BreedWise is a directory only, not a marketplace
- Compliance-first: UK GDPR, PECR, and Google API terms are respected

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2.3 |
| React | React | 18 |
| Styling | Tailwind CSS | 3.4.1 |
| UI Icons | Lucide React | 0.378.0 |
| Backend / API | Next.js API Routes + Server Actions | — |
| Database | Supabase (Postgres) | — |
| Auth | Supabase Auth | — |
| Email | Resend | 3.2.0 |
| Validation | Zod | 3.23.0 |
| Hosting | Vercel | — |
| External APIs | Google Places API (New) | — |

---

## 3. Repository Structure

```
├── app/
│   ├── [country]/[region]/[county]/[town]/
│   │   ├── dog-breeders/page.js           # Location landing page
│   │   └── [breed]-breeders/page.js       # Breed + location landing page
│   ├── admin/page.js                      # Admin dashboard (claims & removals)
│   ├── api/
│   │   ├── admin/claims/route.js          # Admin claims API
│   │   ├── admin/removals/route.js        # Admin removals API
│   │   ├── admin/removals/hard-delete/    # GDPR hard delete endpoint
│   │   ├── auth/                          # Signup, login, logout, me, forgot, reset, resend
│   │   ├── claims/route.js                # Public claim submission
│   │   ├── contact/route.js               # Contact form
│   │   ├── cron/google-refresh/route.js   # Weekly Google Places refresh
│   │   ├── places/[placeId]/route.js      # Google Places proxy
│   │   ├── removals/route.js              # Public removal submission
│   │   ├── robots/route.js                # robots.txt
│   │   └── sitemap/route.js               # sitemap.xml
│   ├── auth/
│   │   ├── callback/route.js              # Supabase auth callback
│   │   ├── forgot/page.js                 # Password reset request
│   │   ├── login/page.js                  # Login
│   │   ├── reset/page.js                  # Password reset confirmation
│   │   ├── signup/page.js                 # Signup
│   │   └── verify/page.js                 # Email verification prompt
│   ├── breeder/[slug]/page.js             # Individual breeder profile
│   ├── breeder-benefits/page.js           # Why claim your profile
│   ├── breeders/
│   │   ├── [slug]/page.js                 # Breed or location landing page
│   │   └── [slug]/[subSlug]/page.js       # Breed + location landing page
│   ├── claim/page.js                      # Claim listing flow
│   ├── components/                        # Reusable React components
│   ├── corrections-removals/page.js       # Policy page
│   ├── data-sources/page.js               # Policy page
│   ├── disclaimer/page.js                 # Policy page
│   ├── editorial-policy/page.js           # Policy page
│   ├── education/                         # Buyer guides hub + 5 guides
│   ├── listing-policy/page.js             # Policy page
│   ├── privacy/page.js                    # Policy page
│   ├── request-removal/page.js            # Removal request flow
│   ├── search/page.js                     # Search results
│   ├── suggest-edit/page.js               # Suggest an edit
│   └── terms/page.js                      # Policy page
├── lib/
│   ├── analytics.js                       # Client-side analytics (localStorage)
│   ├── api.js                             # TCGDex API helpers (legacy)
│   ├── breeders.js                        # In-memory breeder data + helpers
│   ├── emails/resend.js                   # Resend email wrappers
│   ├── rate-limit.js                      # In-memory rate limiter
│   ├── security.js                        # Input sanitisation + CSRF
│   ├── server-analytics.js                # Server-side analytics helpers
│   ├── seo/metadata.js                    # Metadata generator
│   ├── seo/schema.js                      # JSON-LD schema builders
│   ├── supabase/
│   │   ├── client.js                      # Browser Supabase client
│   │   ├── middleware.js                  # Session refresh middleware
│   │   └── server.js                      # Server Supabase client + admin client
│   └── validation.js                      # Zod schemas
├── supabase/
│   ├── migrations/                        # Schema migrations (001, 002, 003)
│   ├── config.toml                        # Supabase CLI config
│   └── seed.sql                           # Seed data (minimal)
├── middleware.js                          # Next.js middleware (auth, CSP, headers)
├── next.config.js                         # Next.js config (headers, aliases)
├── vercel.json                            # Vercel config (cron, headers, rewrites)
├── tailwind.config.js                     # Tailwind theme
├── postcss.config.js                      # PostCSS config
├── .env.example                           # Required environment variables
└── PROJECT.md                             # This file
```

---

## 4. Database Schema

### 4.1 Tables

#### `profiles`
Extends Supabase Auth users.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references auth.users ON DELETE CASCADE |
| display_name | text | |
| role | app_role | NOT NULL DEFAULT 'breeder' (enum: public, breeder, admin) |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Trigger**: `on_auth_user_created` auto-creates a profile on signup with role `breeder`.

#### `claims`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK DEFAULT uuid_generate_v4() |
| breeder_slug | text | NOT NULL |
| breeder_name | text | |
| claimant_email | text | NOT NULL |
| claimant_name | text | |
| claimant_user_id | uuid | FK profiles(id) ON DELETE SET NULL |
| status | text | DEFAULT 'pending' CHECK ('pending','under_review','approved','rejected') |
| notes | text | |
| admin_reason | text | |
| admin_notes | text | |
| submitted_at | timestamptz | DEFAULT now() |
| reviewed_at | timestamptz | |
| reviewed_by | uuid | FK profiles(id) ON DELETE SET NULL |
| status_update_sent_at | timestamptz | |

#### `removals`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK DEFAULT uuid_generate_v4() |
| breeder_slug | text | NOT NULL |
| breeder_name | text | |
| requester_email | text | NOT NULL |
| requester_name | text | |
| requester_user_id | uuid | FK profiles(id) ON DELETE SET NULL |
| reason | text | |
| status | text | DEFAULT 'pending' CHECK ('pending','under_review','approved','rejected') |
| admin_notes | text | |
| admin_reason | text | |
| gdpr_article_17 | boolean | DEFAULT false |
| submitted_at | timestamptz | DEFAULT now() |
| reviewed_at | timestamptz | |
| reviewed_by | uuid | FK profiles(id) ON DELETE SET NULL |
| hard_deleted_at | timestamptz | |
| hard_deleted_by | uuid | FK profiles(id) ON DELETE SET NULL |
| status_update_sent_at | timestamptz | |

#### `breeders`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK DEFAULT uuid_generate_v4() |
| slug | text | NOT NULL UNIQUE |
| name | text | NOT NULL |
| address | text | |
| town | text | NOT NULL |
| postcode | text | |
| county | text | NOT NULL |
| region | text | NOT NULL |
| country | text | DEFAULT 'england' |
| lat | numeric(10,6) | |
| lng | numeric(10,6) | |
| website | text | |
| phone | text | |
| email | text | |
| google_rating | numeric(2,1) | |
| google_place_id | text | |
| kennel_club | text | |
| council_licence | text | |
| health_testing | text | |
| about | text | |
| location_notes | text | |
| status | text | DEFAULT 'public_listing' CHECK ('public_listing','claimed_profile','hidden','archived') |
| claimed | boolean | DEFAULT false |
| last_updated_at | timestamptz | DEFAULT now() |
| source_tags | text[] | DEFAULT '{}' |
| confidence_score | numeric(3,2) | DEFAULT 0.85 |
| created_at | timestamptz | DEFAULT now() |

#### `breeder_breeds`
Many-to-many lookup.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| breeder_id | uuid | FK breeders(id) ON DELETE CASCADE |
| breed | text | NOT NULL |

#### `auth_attempts`
Server-side brute-force tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| email_hash | text | |
| ip_hash | text | |
| succeeded | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |

### 4.2 Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **profiles**: users read/update own; admins read all
- **claims**: authenticated users insert; users read own; admins read/update all
- **removals**: authenticated users insert; users read own; admins read/update all
- **breeders**: public read active listings only (`public_listing`, `claimed_profile`); admins manage all
- **auth_attempts**: no public access (server-only)

---

## 5. Authentication & Authorisation

### 5.1 Roles

| Role | Capabilities |
|------|-------------|
| public | Search, browse directory, view policy pages, submit contact form |
| breeder | All public capabilities + submit claim/removal for own listing, view own submissions |
| admin | All breeder capabilities + full admin panel, review claims/removals, manage listings, hard delete |

### 5.2 How admin access is granted

Admin role is **never** self-assignable. It must be granted via:
1. Supabase dashboard direct SQL update, or
2. A secure server-side migration run by the site owner

### 5.3 Auth flows

**Signup**
1. User fills display name, email, password, confirms Terms/Privacy
2. `POST /api/auth/signup` validates with Zod, rate limits by IP and email
3. Supabase Auth creates user; trigger creates profile with role `breeder`
4. Supabase sends verification email via Resend
5. User sees "Check your email" page

**Email verification**
1. User clicks link in email from `noreply@breedwise.co.uk`
2. Link routes to `/auth/callback?code=...`
3. Server exchanges code for session
4. User is redirected to app

**Login**
1. `POST /api/auth/login` validates credentials
2. Checks for account lockout via `auth_attempts` table (5 failures in 30 min)
3. Checks `email_confirmed_at`; blocks unverified users with option to resend
4. Returns generic error messages (no email enumeration)
5. Redirects to `/admin` if role is admin, otherwise to home

**Password reset**
1. `POST /api/auth/forgot` accepts email
2. Returns identical success message regardless of email existence
3. Sends reset email from `noreply@breedwise.co.uk` (1-hour expiry)
4. User sets new password at `/auth/reset`

**Session management**
- Supabase Auth sessions stored in httpOnly cookies via `@supabase/ssr`
- Automatic token refresh via middleware (`lib/supabase/middleware.js`)
- Logout invalidates session immediately

---

## 6. Key User Flows

### 6.1 Search flow
1. User enters town/postcode and optional breed on homepage or `/search`
2. Client navigates to `/search?q={location}&breed={breed}`
3. Server renders `SearchPage` with results from `lib/breeders.js`
4. `SearchResults` component displays list or map view with filters
5. Analytics event tracked in localStorage

### 6.2 Claim flow
1. Breeder navigates to `/claim`
2. Must be logged in; otherwise shown auth prompt
3. Fills breeder slug, name, email, notes
4. `POST /api/claims` validates with Zod, checks auth, inserts into `claims` table
5. Emails sent: claim confirmation to breeder, admin notification to admin
6. Admin reviews in `/admin` and approves/rejects
7. Status update email sent to breeder on decision

### 6.3 Removal flow
1. Breeder navigates to `/request-removal`
2. Must be logged in
3. Fills breeder slug, name, reason, optional GDPR Article 17 checkbox
4. `POST /api/removals` validates, checks auth, inserts into `removals` table
5. Emails sent: removal confirmation to requester, admin notification
6. Admin reviews and approves (hides listing) or rejects
7. For GDPR erasure, admin can execute hard delete which archives the listing
8. Status update email sent on decision

### 6.4 Admin review flow
1. Admin logs in and navigates to `/admin`
2. Client-side role check redirects non-admins to home
3. Admin views claims and removals in review queue
4. Clicks approve/reject; PATCH request updates status
5. System sends status update email automatically
6. For removals, admin can additionally trigger hard delete for GDPR compliance

### 6.5 Google API refresh flow
1. Vercel Cron triggers `GET /api/cron/google-refresh` Sundays at 03:00 UTC
2. Endpoint verifies `Authorization: Bearer {CRON_SECRET}`
3. Fetches breeders with `google_place_id` from Supabase
4. Calls Google Places Details API for each
5. Updates permitted fields: name, address, phone, website, rating
6. Logs run result in `google_refresh_log`
7. Does NOT store review text or user-generated content

---

## 7. Email Flows

| Email | Trigger | Recipient | From | Content |
|-------|---------|-----------|------|---------|
| Verification | Supabase Auth signup | User | noreply@breedwise.co.uk | Verification link (24h expiry) |
| Password reset | Supabase Auth reset | User | noreply@breedwise.co.uk | Reset link (1h expiry) |
| Claim confirmation | Claim submitted | Claimant | noreply@breedwise.co.uk | Claim received, review timeline |
| Claim admin notification | Claim submitted | Admin | noreply@breedwise.co.uk | Summary + admin panel link |
| Removal confirmation | Removal submitted | Requester | noreply@breedwise.co.uk | Request received, GDPR note |
| Removal admin notification | Removal submitted | Admin | noreply@breedwise.co.uk | Summary + admin panel link |
| Claim status update | Admin updates claim status | Claimant | noreply@breedwise.co.uk | Approved/rejected/under review + reason |
| Removal status update | Admin updates removal status | Requester | noreply@breedwise.co.uk | Approved/rejected/under review + reason |
| Contact confirmation | Contact form submitted | User | noreply@breedwise.co.uk | Message received |

**Resend domain**: `breedwise.co.uk`

---

## 8. Environment Variables

| Variable | Purpose | Required for |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | local, preview, prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) | local, preview, prod |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) | local, preview, prod |
| `GOOGLE_PLACES_API_KEY` | Google Places API key (server-only) | local, preview, prod |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key (client maps) | local, preview, prod |
| `RESEND_API_KEY` | Resend API key | local, preview, prod |
| `RESEND_FROM_EMAIL` | Sender for transactional emails | local, preview, prod |
| `RESEND_ADMIN_EMAIL` | Admin notification recipient | local, preview, prod |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | local, preview, prod |
| `ADMIN_SECRET_KEY` | Extra admin route protection (optional) | prod |
| `CRON_SECRET` | Secures cron job endpoint | prod |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Feature flag for AdSense | prod (optional) |

See `.env.example` for a template.

---

## 9. Deployment

### 9.1 Local development setup

```bash
# Install dependencies
npm install

# Start Supabase locally
npx supabase start

# Copy environment variables
cp .env.example .env.local
# Fill in real values

# Run dev server
npm run dev
```

### 9.2 Database migrations

```bash
# Apply pending migrations
npx supabase migration up

# Reset local db (caution: deletes data)
npx supabase db reset
```

### 9.3 Deploy to Vercel

1. Push to Git repository connected to Vercel
2. Vercel auto-deploys on push
3. Configure environment variables in Vercel dashboard
4. Ensure `CRON_SECRET` is set for production

### 9.4 Rollback

- Use Vercel dashboard to promote a previous deployment
- Or revert commit and push

---

## 10. SEO Architecture

### 10.1 URL structure

| Pattern | Example | Page |
|---------|---------|------|
| `/` | `/` | Homepage |
| `/search?q={q}&breed={breed}` | `/search?q=Chichester&breed=Labrador` | Search results |
| `/breeder/{slug}` | `/breeder/chichester-labrador-kennels-chichester` | Profile |
| `/breeders/{slug}` | `/breeders/labrador-retriever` | Breed or location landing (detected at runtime) |
| `/breeders/{slug}/{subSlug}` | `/breeders/labrador-retriever/chichester` | Breed + location landing |
| `/{country}/{region}/{county}/{town}/dog-breeders` | `/england/west-sussex/west-sussex/chichester/dog-breeders` | Town landing |
| `/{country}/{region}/{county}/{town}/{breed}-breeders` | `/england/west-sussex/west-sussex/chichester/labrador-retriever-breeders` | Town + breed |

### 10.2 Dynamic metadata

Every page uses `generateMetadata` from `lib/seo/metadata.js`:
- Dynamic title and description
- Canonical URL
- Open Graph and Twitter cards
- `robots: index, follow` by default

### 10.3 Structured data

- **WebSite** + **Organization** schema on homepage
- **BreadcrumbList** on all inner pages
- **LocalBusiness** on breeder profile pages
- **FAQPage** where applicable

### 10.4 Sitemap & robots

- `/api/sitemap` generates XML sitemap dynamically
- `/api/robots` serves `robots.txt`
- Rewrites in `vercel.json` map `/sitemap.xml` and `/robots.txt` to API routes

---

## 11. Compliance & Legal

### 11.1 Policy pages

| Page | Coverage |
|------|----------|
| `/disclaimer` | Directory-only disclaimer, no endorsement, third-party data limits |
| `/terms` | Terms of use, user responsibility, prohibited use, liability |
| `/privacy` | UK GDPR, data collection, cookies, retention, erasure rights |
| `/editorial-policy` | Sourcing, impartiality, corrections |
| `/listing-policy` | Inclusion criteria, claim rules, removal rules |
| `/data-sources` | Public sources, Google API refresh, storage |
| `/corrections-removals` | Claim process, removal process, GDPR Article 17 |

### 11.2 UK GDPR

- Minimum data collection
- Email verification required
- RLS policies protect all user data
- Removal requests treated as potential Article 17 requests
- Hard delete available for explicit erasure
- Data retention: 6 years for claims/removals (legal/audit), active until deletion for accounts

### 11.3 Google API compliance

- Weekly refresh only
- No long-term storage of review text or user-generated content
- Attribution displayed on listings
- Caching restricted to permitted fields

---

## 12. Feature Flags

| Flag | How to enable | Default |
|------|--------------|---------|
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Set to `"true"` in Vercel env | `false` |

When enabled, homepage shows AdSense placeholder instead of "How BreedWise works" module.

---

## 13. Known Limitations & Future Work

- **Geographic scope**: Currently West Sussex demo data only. UK-wide expansion requires populating `breeders` and `breeder_breeds` tables with real data.
- **Analytics**: Client-side localStorage only. Future: server-side analytics with privacy-preserving aggregation.
- **Maps**: Static placeholder map on profiles. Future: interactive Google Map with attribution.
- **Premium listings**: Not yet implemented.
- **Real-time chat/messaging**: Not planned.
- **Breeder dashboard**: Claimed breeders cannot yet self-serve updates; all updates go through admin review.

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-05-10 | Initial schema and auth system |
| 2026-05-15 | Claims, removals, admin panel, Resend emails |
| 2026-05-20 | Google Places cron job, security headers, rate limiting |
| 2026-06-06 | Dynamic SEO landing pages (/breeders/{breed}, /breeders/{location}), admin status update emails, GDPR hard delete, PROJECT.md, production hardening |
