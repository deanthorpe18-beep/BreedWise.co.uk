# BreedWise — Follow-Up Instructions

> This file lists every task that requires credentials, DNS changes, legal review, business decisions, or manual configuration **outside the codebase**.  
> Last updated: 2026-06-06

---

## 1. DNS Records for Resend (breedwise.co.uk)

Before Resend can send emails from `breedwise.co.uk`, you must add DNS records to your domain registrar / DNS provider.

### 1.1 Verify domain in Resend dashboard
1. Log into [resend.com](https://resend.com)
2. Go to **Domains** → **Add Domain**
3. Enter `breedwise.co.uk`
4. Resend will give you specific DKIM / SPF records to add

### 1.2 Required DNS records (generic — confirm exact values in Resend dashboard)

**SPF record** (TXT on root domain):
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM record** (TXT — Resend provides the exact value):
```
Type: TXT
Host: resend._domainkey
Value: <provided by Resend>
```

**DMARC record** (recommended, TXT on root domain):
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@breedwise.co.uk
```

> **Note:** It can take up to 24 hours for DNS propagation. Resend will show "Verified" once complete.

---

## 2. Supabase Dashboard Configuration

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

## 3. Vercel Environment Variables

In the [Vercel Dashboard](https://vercel.com/deanthorpe18-beep/breedwise.co.uk) → **Settings → Environment Variables**, ensure every variable below is set for **Production** (and Preview if you want preview deployments to work):

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zbvwqsjgasgxpphljahs.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<your-anon-key>` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-service-role-key>` | ✅ |
| `GOOGLE_PLACES_API_KEY` | `AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA` | ✅ |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | `AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA` | ✅ |
| `RESEND_API_KEY` | `re_9yuXRkY5_DRPeriigencBAc4eAMqgSaM1` | ✅ |
| `RESEND_FROM_EMAIL` | `noreply@breedwise.co.uk` | ✅ |
| `RESEND_ADMIN_EMAIL` | `admin@breedwise.co.uk` | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://breedwise.co.uk` | ✅ |
| `CRON_SECRET` | `<generate-strong-random-string>` | ✅ |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false` | ✅ |
| `ADMIN_SECRET_KEY` | `<generate-strong-random-string>` | Optional |

> **How to generate a strong random string for CRON_SECRET / ADMIN_SECRET_KEY:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 4. Google Cloud / Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Find the project with the Places API key
3. Navigate to **APIs & Services → Credentials**
4. Restrict the API key:
   - **HTTP referrers (websites):**
     - `https://breedwise.co.uk/*`
     - `https://*.vercel.app/*` (for preview deployments)
   - **API restrictions:** Allow only **Places API (New)** and **Maps JavaScript API**
5. Ensure billing is enabled on the project

---

## 5. Legal Review

Before going live, have a solicitor review these policy pages for UK compliance:

- `/privacy` → `app/privacy/page.js`
- `/terms` → `app/terms/page.js`
- `/disclaimer` → `app/disclaimer/page.js`
- `/corrections-removals` → `app/corrections-removals/page.js`

Key areas to review:
- Liability limitations
- GDPR compliance wording
- Consumer rights references
- Accuracy of third-party data disclaimers

---

## 6. Cookie Consent Banner

The Privacy Policy mentions cookie usage but there is **no visible cookie-consent banner** yet. You should implement a lightweight banner that:

1. Appears on first visit
2. Records consent in `localStorage`
3. Blocks non-essential analytics until consent is given
4. Links to `/privacy`

This is required under UK GDPR + PECR.

---

## 7. Vercel Build Failure — What Was Fixed

Your previous deployment failed with two errors:

### Error 1: Conflicting dynamic routes
**Cause:** Next.js does not allow `app/breeders/[breed]/page.js` and `app/breeders/[location]/page.js` at the same path level because they use different parameter names.

**Fix:** Merged into a single `app/breeders/[slug]/page.js` that detects whether the slug is a breed or location and renders the appropriate content. URLs remain unchanged:
- `/breeders/labrador-retriever` ✅
- `/breeders/chichester` ✅

### Error 2: Resend module instantiation during build
**Cause:** `lib/emails/resend.js` created `new Resend()` at the module level. During static generation, if `RESEND_API_KEY` was missing or the module loaded in an unexpected context, it threw.

**Fix:** Changed to lazy instantiation (`getResend()`) so the client is only created when an email function is actually called at runtime.

### Error 3: `useSearchParams()` without Suspense
**Cause:** Next.js 14 App Router requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary during static generation.

**Fix:** Wrapped `ResetPasswordForm` in a `<Suspense>` boundary in `app/auth/reset/page.js`.

---

## 8. How to Verify the Fix Deployed

1. Go to [Vercel Dashboard → Deployments](https://vercel.com/deanthorpe18-beep/breedwise.co.uk/deployments)
2. Look for the latest deployment from `main`
3. Status should show **Ready** (green dot) instead of **Error**
4. Click **Visit** to confirm the site loads
5. Test these URLs:
   - `https://breedwise.co.uk/breeders/labrador-retriever`
   - `https://breedwise.co.uk/breeders/chichester`
   - `https://breedwise.co.uk/breeders/labrador-retriever/chichester`

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
| Security headers | Use [securityheaders.com](https://securityheaders.com) |

---

## 10. Contact & Support

- **BreedWise domain:** breedwise.co.uk
- **Supabase project:** zbvwqsjgasgxpphljahs
- **Resend dashboard:** resend.com
- **Vercel dashboard:** vercel.com/deanthorpe18-beep/breedwise.co.uk
