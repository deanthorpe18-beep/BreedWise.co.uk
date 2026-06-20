# BreedWise — Follow-Up Instructions

> This file lists every task that requires credentials, DNS changes, legal review, business decisions, or manual configuration **outside the codebase**.  
> Last updated: 2026-06-06

---

## ✅ COMPLETED — Railway Deployment

**Status: LIVE** at [https://breedwise.co.uk](https://breedwise.co.uk)

- Railway project: `BreedWise.co.uk`
- Service ID: `a8412acf-f8e1-4f66-b117-a6f213c2c2bc`
- Environment: `production`
- Latest deployment: `SUCCESS` (commit `9bc791f`)

---

## ✅ COMPLETED — Environment Variables

All environment variables have been set in Railway:

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set (real key) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `GOOGLE_PLACES_API_KEY` | ✅ Set |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `RESEND_FROM_EMAIL` | ✅ Set |
| `RESEND_ADMIN_EMAIL` | ✅ Set |
| `NEXT_PUBLIC_SITE_URL` | ✅ Set |
| `CRON_SECRET` | ✅ Set |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | ✅ Set |
| `ADMIN_SECRET_KEY` | ✅ Set |

---

## ✅ COMPLETED — DNS Records for Resend

Cloudflare DNS records added for `breedwise.co.uk`:

| Type | Name | Value |
|------|------|-------|
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@breedwise.co.uk` |

Existing Resend DKIM already present:
| TXT | `resend._domainkey` | Resend DKIM public key |

> **Note:** It can take up to 24 hours for DNS propagation. Verify in Resend dashboard.

---

## 1. Resend Domain Verification

1. Log into [resend.com](https://resend.com)
2. Go to **Domains**
3. Verify `breedwise.co.uk` shows green/verified
4. If not verified yet, wait for DNS propagation (up to 24 hours)

---

## 2. Supabase Auth Dashboard Configuration

Log into your Supabase project: `https://supabase.com/dashboard/project/zbvwqsjgasgxpphljahs`

### 2.1 Auth settings
Navigate to **Authentication → Settings** and verify:

| Setting | Required Value |
|---------|---------------|
| Site URL | `https://breedwise.co.uk` |
| Additional Redirect URLs | `https://breedwise.co.uk/auth/callback` |
| Enable email confirmations | ✅ ON (mandatory) |
| Confirm email template sender | `noreply@breedwise.co.uk` |
| Reset password template sender | `noreply@breedwise.co.uk` |
| JWT Expiry | `3600` (seconds, or your preference) |

### 2.2 Disable unused providers
Navigate to **Authentication → Providers**:
- Turn OFF all OAuth providers (Google, GitHub, etc.) unless explicitly needed later
- Turn OFF Phone Auth unless explicitly needed later

### 2.3 First admin user
After signing up your first account via the live site:

1. Go to **Table Editor → profiles**
2. Find your user record
3. Change `role` from `breeder` to `admin`

Or run this SQL in the **SQL Editor**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<your-user-uuid>';
```

> **Security warning:** Never expose the admin role assignment via client-side code or public API.

---

## 3. Google Places API

- Enable billing on the Google Cloud project
- Restrict the API key to HTTP referrers: `https://breedwise.co.uk/*`

---

## 4. Legal Review

Before going live, have a solicitor review:
- `app/privacy/page.js`
- `app/terms/page.js`
- `app/disclaimer/page.js`
- `app/corrections-removals/page.js`

Key areas to review:
- Liability limitations
- GDPR compliance wording
- Consumer rights references
- Accuracy of third-party data disclaimers

---

## 5. Cookie Consent Banner

✅ **Implemented** — `app/components/CookieConsent.js` shows on first visit, logs consent to `cookie_consents` table via `/api/cookie-consent`, and analytics tracking (`lib/analytics-client.js`) is gated behind consent.

---

## 6. Stripe Subscriptions

### Setup checklist

1. Create a Stripe account and switch to **Live** mode when ready
2. Add to Railway environment:
   - `STRIPE_SECRET_KEY` — from Stripe Dashboard → Developers → API keys
   - `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard → Webhooks → endpoint `https://breedwise.co.uk/api/webhooks/stripe`
3. In admin (`/admin` → Tiers tab), click **Sync to Stripe** for all tiers (creates products/prices in DB)
4. Verify in admin **System Health** tab — Stripe check should show 3/3 tiers with price IDs

### Webhook events handled

`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Breeder flow

Claim listing → `/breeder/[slug]/subscription` → Stripe Checkout → webhook updates `breeder_subscriptions` and `membership_tier`

---

## 7. Security — rotate exposed credentials

**Action required:** Service role keys and Google API keys were previously hardcoded in `scripts/`. These have been removed, but if this repo was ever pushed to a remote:

1. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase Dashboard → Settings → API
2. Rotate `GOOGLE_PLACES_API_KEY` in Google Cloud Console
3. Update Railway environment variables with new keys

---

## 8. Migration 028 (breeder availability)

Run in Supabase SQL Editor if not yet applied:

```sql
-- Contents of supabase/migrations/028_breeder_availability.sql
ALTER TABLE public.breeders
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'
CHECK (availability_status IN ('available', 'waitlist', 'not_available', 'paused'));
```

Verify via admin **System Health** tab.

---

## 9. Post-Launch Monitoring Checklist

| Check | How |
|-------|-----|
| Resend emails sending | Sign up a test account, check inbox |
| Supabase Auth working | Sign up, verify email, log in, log out |
| Admin panel accessible | Log in with admin role, visit `/admin` |
| Claim flow end-to-end | Submit claim, approve in admin, check email |
| Removal flow end-to-end | Submit removal, approve in admin, check email |
| Google Places cron job | Check `google_refresh_log` table weekly |
| Sitemap valid | Visit `/sitemap.xml`, validate with Google Search Console |
| robots.txt correct | Visit `/robots.txt` |
| Stripe subscriptions | Admin → System Health; test checkout on a claimed listing |
| Migration 028 applied | Admin → System Health → "Migration 028" check |

---

## Deployment History

| Date | Commit | Status | Notes |
|------|--------|--------|-------|
| 2026-06-06 | `6e94aa1` | ❌ FAILED | Next.js 14.2.3 vulnerabilities blocked by Railway |
| 2026-06-06 | `4f4f9b8` | ❌ FAILED | Same CVEs (redeploy of old patch) |
| 2026-06-06 | `9bc791f` | ✅ SUCCESS | Upgraded Next.js to 14.2.35 |
| 2026-06-06 | `69a80f4` | ✅ SUCCESS | Updated follow-up docs |
| Security headers | Use [securityheaders.com](https://securityheaders.com) |

---

*Last updated: 2026-06-20*
