# Tasting Cards

Digital tasting card platform — QR codes that link to a branded, editable
guest-facing card instead of a printed one.

## What's here

- **Database schema** (`prisma/schema.prisma`) — multi-tenant: every product
  and flight belongs to a business via `businessId`, and every dashboard
  page/action looks the business up from the login session
  (`lib/auth.ts` → `getCurrentBusiness()`), never from the URL or form.
- **Login** (`/login`) — one login per business, 30-day sessions stored in
  the `Session` table. Failed logins are rate-limited per email and per IP
  (`lib/loginThrottle.ts`, `LoginAttempt` table). Changing the password in
  settings signs out every other device.
- **Business dashboard** (`/dashboard`) — product list with status badges
  and view counts, plus the full-menu QR code. Views skip link-preview bots
  and the business's own visits while logged in.
- **Product entry** (`/dashboard/products/new`) — the business first picks
  what it's adding (wine, beer, spirit, cocktail — mixed businesses can add
  any; single-category ones add their own type plus cocktails), which sets
  the price fields. Name, category, subtitle, proof/ABV (with a per-product
  "show on card" checkbox, on by default for everything except wine),
  photo, description, aroma/palate/finish, prices; saved as a draft or
  published.
- **Guest-facing card** (`/[businessSlug]/[productSlug]`) — the public page
  a QR code points to, themed per business. Archived products stay live
  with a "no longer available" state. "Save card" downloads a PNG
  snapshot of the real rendered card; "Share" sends that image through the
  phone's share sheet (falling back to the link).
- **Theme settings** (`/dashboard/settings`) — business name, category,
  logo, primary/accent colors, heading font, mailing list link, share
  phrase, with a live preview. The 15 heading fonts are listed in
  `lib/fontOptions.ts` and self-hosted from `assets/fonts` (SIL Open Font
  License, see `assets/fonts/licenses`); they apply to names and prices on
  cards, the menu and share thumbnails, while tasting notes stay in the
  plain system font. Text colors are picked automatically from the theme
  (`lib/color.ts`) so cards stay readable on light or dark backgrounds.
- **Image uploads** — logos and product photos upload straight from the
  browser to Vercel Blob (`components/ImageUpload.tsx`,
  `app/api/upload/route.ts`), resized first, into a folder per business.
  Logos are PNG (the share-thumbnail generator can't draw WebP); photos
  are WebP. Replaced images are deleted automatically.
- **QR codes** — plain black-and-white PNGs:
  - `/api/qr/[businessSlug]/[productSlug]` — a single product's card
  - `/api/qr/menu/[businessSlug]` — the full menu
  - `/api/qr/flight/[businessSlug]/[flightSlug]` — one flight

  Every QR shows the address it points to on its dashboard page. See
  "Which address QR codes point to" below — this matters once codes are
  printed.
- **Full menu page** (`/[businessSlug]`) — published products (then
  sold-out ones) and any flights a guest can currently order.
- **Flights** (`/dashboard/flights`) — preset flights (the business picks
  and orders the products) and build-your-own flights (guests pick N
  products themselves; only a completion count is stored).
- **Share thumbnails** — each menu/product/flight page has an
  `opengraph-image.tsx` for link previews, using Crimson Text from
  `assets/fonts` (SIL Open Font License). Anything that goes wrong while
  drawing one falls back to a plain thumbnail.
- **Seed data** — Hidden Hills Farm and Vineyard, 10 wines, a "Reserve
  Flight" and a build-your-own flight.

## What's NOT here yet

- **Signup.** New businesses still need a row inserted directly (seed
  script or `npx prisma studio`). When signup is built, it must:
  normalize emails with `normalizeEmail()` (lib/auth.ts), and reject
  business slugs that are taken or reserved (`isReservedBusinessSlug()` in
  lib/slug.ts — words like `dashboard` or `login` would make that
  business's pages unreachable).
- **Billing.**
- **CSV batch import.**
- **Scan analytics beyond a view count.**

## Setup

You need a Postgres database (Neon's free tier works) and a Vercel Blob
store connected to the Vercel project.

```bash
npm install
```

Create a `.env` file with your Postgres connection string — use Neon's
**pooled** connection string (the host contains `-pooler`), since every
Vercel function opens its own connection:

```
DATABASE_URL="postgresql://user:password@ep-something-pooler.../neondb?sslmode=require"
```

Then set up the database:

```bash
npm run db:push    # creates/updates all tables and indexes from the schema
npm run db:seed    # adds Hidden Hills + 10 wines + a preset flight + a build-your-own flight
```

**Whenever `prisma/schema.prisma` changes, run `npm run db:push` once**
against the database before (or right after) deploying — Vercel builds
don't change the database themselves. Additive changes (new tables,
columns with defaults, indexes) are safe to push while the old code is
still live.

The seed prints the login password for `owner@hiddenhills.example` the
first time it creates the account (randomly generated, or set
`SEED_PASSWORD` to choose it). Re-running the seed never resets a password
you've since changed.

## Deploying (Vercel)

1. Import the GitHub repository into Vercel.
2. Add `DATABASE_URL` under **Environment Variables**.
3. Under **Storage**, connect a Blob store — that adds
   `BLOB_READ_WRITE_TOKEN` automatically.
4. Deploy. `npm install` runs `prisma generate` via the `postinstall`
   script.

### Which address QR codes point to

QR codes get printed, so they must always point at the real production
address. `lib/baseUrl.ts` decides, in this order:

1. `APP_BASE_URL`, if set.
2. Vercel's `VERCEL_PROJECT_PRODUCTION_URL` (set automatically on every
   deployment, previews included, to the project's production domain).
3. The address the dashboard was opened on (local development only).

**Once you have a custom domain, set `APP_BASE_URL` (e.g.
`https://pourtags.com`) in Vercel's Production environment variables,
and redeploy, before printing any QR codes.** Check the "Points to …" line
under any QR code in the dashboard to confirm.

## Security notes

- Runs on Next.js 16.x (14.x is end-of-life). Run `npm audit` periodically,
  especially before onboarding new businesses.
- Dynamic route params in Next 15+/16 are a `Promise` that must be
  `await`-ed — keep this in mind when adding routes.
- Before going live: revisit dev/demo credentials (seeded accounts,
  placeholder secrets).
