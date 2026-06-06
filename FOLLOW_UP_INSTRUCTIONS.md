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

The Privacy Policy mentions cookies but there is no visible cookie-consent banner yet. Implement a lightweight banner that:
- Appears on first visit
- Records consent in `localStorage`
- Blocks non-essential analytics until consent is given
- Links to `/privacy`

This is required under UK GDPR + PECR.

---

## 6. Post-Launch Monitoring Checklist

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
| Security headers | Use [securityheaders.com](https://securityheaders.com) |

---

## Deployment History

| Date | Commit | Status | Notes |
|------|--------|--------|-------|
| 2026-06-06 | `6e94aa1` | ❌ FAILED | Next.js 14.2.3 vulnerabilities blocked by Railway |
| 2026-06-06 | `4f4f9b8` | ❌ FAILED | Same CVEs (redeploy of old patch) |
| 2026-06-06 | `9bc791f` | ✅ SUCCESS | Upgraded Next.js to 14.2.35 |
| 2026-06-06 | `69a80f4` | ✅ SUCCESS | Updated follow-up docs |
| 2026-06-06 | `8a0df584` | ✅ SUCCESS | Real Supabase anon key + Resend DNS |
