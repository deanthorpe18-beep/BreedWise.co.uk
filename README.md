# BreedWise.co.uk

UK-wide pet breeder directory — dogs, cats, birds, fish, reptiles, and small pets. BreedWise is a **directory only**; we do not sell animals or endorse breeders.

**Live site:** [https://breedwise.co.uk](https://breedwise.co.uk)

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router, React 18) |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL (eu-west-2) |
| Auth | Supabase Auth (email/password) |
| Payments | Stripe (Bronze / Silver / Gold memberships) |
| Email | Resend |
| Hosting | Railway |

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| File | Purpose |
|------|---------|
| [PROJECT.md](./PROJECT.md) | Architecture, schema, auth, security, deployment (source of truth) |
| [FOLLOW_UP_INSTRUCTIONS.md](./FOLLOW_UP_INSTRUCTIONS.md) | Manual setup tasks (DNS, Stripe, Supabase dashboard) |
| [.env.example](./.env.example) | Required environment variables |

> **Note:** `BREEDWISE_BUILD_SUMMARY.md` is an archived Phase 1 prototype doc and does not reflect the current Supabase-backed application.

## Key features

- **Search** — location + breed + animal type, tier-weighted ranking
- **Breeder profiles** — public listings with Google Places enrichment
- **Claims** — breeders verify ownership; admin approval workflow
- **Memberships** — Stripe subscriptions (Bronze / Silver / Gold)
- **Buyer accounts** — save breeders, compare listings, messaging
- **Admin panel** — claims queue, analytics, SEO tools, outreach, CMS
- **Breed encyclopedia** — rich breed pages at `/breeds/[slug]`

## Scripts

Operational scripts in `scripts/` require environment variables (no hardcoded keys):

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GOOGLE_PLACES_API_KEY=... node scripts/seed-uk-wide.js
```

See `scripts/_env.js` for required variables.

## Health checks

- Public: `GET /api/health`
- Admin: System Health tab in `/admin` (Stripe config, migration status, analytics)
