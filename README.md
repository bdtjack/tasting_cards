# Tasting Cards

Digital tasting card platform — QR codes that link to a branded, editable
guest-facing card instead of a printed one.

## What's here

This is a working scaffold of the core loop:

- **Database schema** (`prisma/schema.prisma`) — multi-tenant: every product
  belongs to a business via `businessId`, so many businesses share one
  database safely.
- **Business dashboard** (`/dashboard`) — product list with status badges
  and scan counts, plus an empty state for a brand-new account.
- **Product entry form** (`/dashboard/products/new`) — the fields agreed on
  earlier (name, category, subtitle, proof/ABV, aroma/palate/finish, price,
  buy link), with draft/publish states.
- **Guest-facing card** (`/[businessSlug]/[productSlug]`) — the public page
  a QR code points to. Themed per-business (primary/accent color), with a
  distinct "no longer available" state for archived products. The "Save
  card" button actually works now — it snapshots the real rendered card
  as a PNG the guest can download (via `html-to-image`), rather than
  re-creating a separate template that could drift out of sync.
- **Theme settings** (`/dashboard/settings`) — business name, category,
  logo, primary/accent colors, and the newsletter/mailing list link
  (shown as "Join the list" on every guest card — set once here, not
  per product), with a live preview that updates as you type. The card
  URL slug is shown but not editable here, since it's baked into every
  QR code already printed.
- **QR generation** — three kinds now, each downloadable as a plain
  black-and-white PNG:
  - `/api/qr/[businessSlug]/[productSlug]` — a single product's card
  - `/api/qr/menu/[businessSlug]` — the full menu
  - `/api/qr/flight/[businessSlug]/[flightSlug]` — one curated flight
- **Full menu page** (`/[businessSlug]`) — lists every published product
  (plus sold-out/archived ones, marked as such) and any flights, each
  linking into its own existing card. One QR for "everything we pour,"
  downloadable from the top of the dashboard.
- **Flights** (`/dashboard/flights`) — group a curated, ordered subset of
  published products into a named tasting (e.g. "Reserve Flight"), with
  its own guest-facing page and QR code, separate from both the full menu
  and any single product. `flights` is a reserved product slug so it can
  never collide with the `/[businessSlug]/flights/...` route.
- **Sharing** — on phones, the guest card's and flight card's Share
  buttons send the card itself as an image (falls back to copying the
  link on desktop). The shared logic lives in `lib/useCardShare.ts` so
  both cards behave identically. Each product/menu/flight page also sets
  each route's `opengraph-image.tsx` (serif name, gold divider, tasting
  notes, prices), using the Crimson Text font in `assets/fonts` (SIL Open
  Font License). A broken logo URL falls back to a plain thumbnail
  instead of breaking the preview.
- **Seed data** — Hidden Hills Farm and Vineyard, two products (Pinto 2022
  and Reserve Estate Red), and a sample "Reserve Flight" containing both.

## What's NOT here yet (by design)

- **CSV batch import.**
- **Scan analytics beyond a raw count** (peak times, etc).
- **Signup.** There's no self-serve "create a business account" flow —
  new businesses currently need a row inserted directly (e.g. via
  `npm run db:seed`, or `npx prisma studio` for a GUI). Fine while it's
  just Hidden Hills; worth building before a second business joins.
- **Logo file upload.** The theme settings page takes a logo *URL* (paste
  a link to an image hosted elsewhere), not a file upload. Simpler to
  build first; real file upload (with storage) is a reasonable next step.

## Getting started

```bash
npm install
```

Create a `.env` file with your Postgres connection string (see "Deploying
for real" below for how to get one from Neon for free):

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

Then set up the database:

```bash
npm run db:push    # creates all tables from the schema above
npm run db:seed    # adds Hidden Hills + 2 products + a sample flight
```

Run it:

```bash
npm run dev
```

If you already had this running before the menu/flights feature was
added, the schema changed (two new tables: `Flight` and `FlightItem`) —
run `npm run db:push` and `npm run db:seed` again against your existing
database to pick them up; it won't touch your existing products.

## Logging in

The dashboard now requires a real login. The seed script creates one
account:

- **URL:** http://localhost:3000/login
- **Email:** `owner@hiddenhills.example`
- **Password:** `changeme123`

Change that password before this goes anywhere near real use, especially
once deployed — there's a **Password** section at the bottom of
`/dashboard/settings` for this now (current password + new password +
confirmation, at least 8 characters).

Sessions last 30 days and are stored in the `Session` table — logging out
deletes the row and clears the cookie.

- Dashboard: http://localhost:3000/dashboard
- Full menu: http://localhost:3000/hidden-hills
- Guest card: http://localhost:3000/hidden-hills/pinto-2022
- Flight page: http://localhost:3000/hidden-hills/flights/reserve-flight
- QR downloads: `/api/qr/hidden-hills/pinto-2022`,
  `/api/qr/menu/hidden-hills`, `/api/qr/flight/hidden-hills/reserve-flight`

## Demoing on the same Wi-Fi (no deployment needed)

For an in-person demo where you and Hidden Hills are on the same Wi-Fi,
you can skip deploying entirely — but two things matter:

1. **Don't use `localhost` for anything you'll scan or click on a phone.**
   `localhost` means "this device" to whatever's reading it — on a phone,
   that's the phone itself, not your laptop. When you run `npm run dev`,
   the terminal prints two URLs:

   ```
   - Local:    http://localhost:3000
   - Network:  http://172.26.32.1:3000   <- use this one on the day
   ```

   Open the dashboard using the **Network** address (yours will be a
   different number) for the whole demo — not just for the QR code, but
   for browsing the dashboard at all. The QR download and the "View guest
   card" link both automatically encode whatever address you loaded the
   page from, so getting this one thing right makes everything else work
   without any other setup.

2. **Windows Firewall may prompt you the first time** another device
   tries to reach your laptop on port 3000. Allow it (on **both** Private
   and Public network types, since some Wi-Fi networks register as
   Public) — otherwise phones on the same Wi-Fi will get a timeout with
   no useful error message, which looks exactly like a broken app in the
   moment. Worth testing this from your own phone *before* the demo, not
   during it.

Once both of those are handled: go to a product's edit page
(`/dashboard/products/[id]/edit`), and there's now a QR code shown right
there with a **Download PNG** button — pull it up on a second screen, or
print it, and it's ready to scan.

## Deploying for real (Vercel + a hosted database)

This is the path once you need this reachable from anywhere — not just
same-Wi-Fi demos. It replaces local SQLite with a real hosted Postgres
database (SQLite's single-file approach doesn't work on Vercel — its
servers have no persistent disk between requests).

### 1. Create a free Postgres database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up (free tier is enough
   for this).
2. Create a new project. Once it's ready, find the **connection string**
   — it looks like:
   ```
   postgresql://user:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copy it somewhere safe for a moment — you'll use it twice, below.

### 2. Point your local project at it (one-time setup)

1. Open your `.env` file and replace the existing line with your real
   connection string from step 1:
   ```
   DATABASE_URL="postgresql://user:password@ep-something.../neondb?sslmode=require"
   ```
2. Push the schema and seed data to this real database:
   ```
   npm run db:push
   npm run db:seed
   ```
   This creates the tables and the Hidden Hills account on Neon directly
   — from this point on, your local dev server and the deployed app can
   both point at this same database if you want, or you can create a
   second Neon project later to keep dev/production data separate. For
   now, one is simpler.

### 3. Push the project to GitHub

Vercel deploys from a GitHub repository, so this needs to be one:

1. Create a new (private is fine) repository on [github.com](https://github.com).
2. In your project folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <the URL GitHub gives you>
   git push -u origin main
   ```
   The `.gitignore` in this project already excludes `.env`, so your
   database credentials won't end up on GitHub — but double check the
   commit doesn't include a `.env` file before pushing, just in case.

### 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub login is
   easiest — it can import repos directly).
2. **Add New Project** → select the repository you just pushed.
3. Before clicking Deploy, expand **Environment Variables** and add:
   - `DATABASE_URL` = the same Neon connection string from step 1
4. Click **Deploy**. It'll install dependencies (running `prisma
   generate` automatically, via the `postinstall` script), build, and
   give you a live URL like `https://tasting-cards-xyz.vercel.app`.

### 5. Test it

- Dashboard: `https://your-app.vercel.app/dashboard` (log in with the
  seeded credentials)
- Guest card: `https://your-app.vercel.app/hidden-hills/pinto-2022`
- Download a fresh QR code from the product's edit page — it'll now
  encode the real `https://your-app.vercel.app/...` address automatically,
  no `APP_BASE_URL` environment variable needed (that was only ever a
  same-Wi-Fi workaround; delete it from `.env` if it's still in there).

From here, this QR code works on any phone, on cellular data, anywhere —
not just in one room on one Wi-Fi network.

## Note on this being built in a sandboxed environment

This project was scaffolded in an environment with restricted network
access, so `npx prisma generate` couldn't download its query engine binary
here to fully verify the database layer end-to-end. Everything else was
type-checked and reviewed by hand. Running `npm install` on your own
machine (normal internet access) should resolve this immediately — if
`npm run db:push` fails, that's the first thing to check.

## A security note before deploying anywhere real

This project runs on **Next.js 16.3.5**. I initially built it on the 14.x
line, which turned out to be a mistake: 14.x reached end-of-life in
October 2025, and its final-ever security patch shipped in December 2025
(`14.2.35`). Vulnerabilities disclosed since then are only fixed in the
15.x and 16.x lines. Since 15.x itself loses support on October 21, 2026,
I upgraded straight to 16.x rather than patch onto a version that would
need re-upgrading again shortly.

`npm audit` currently reports 0 vulnerabilities against this dependency
set. That will change over time as new advisories are published — it's
worth running `npm audit` again periodically, especially before any real
deployment, since this ecosystem moves fast.

The upgrade to Next 16 also changed how dynamic route params work: they're
now delivered as a `Promise` that must be `await`-ed, rather than a plain
object (this affects `app/[businessSlug]/[productSlug]/page.tsx` and the
QR route handler). Keep this in mind if you add more dynamic routes later.
