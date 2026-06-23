# StartupForge — Client (Next.js)

The **client** of the StartupForge platform: a startup team-builder where
founders post ideas, collaborators apply, and admins moderate.

> Companion server: [`../code2startup_server`](../code2startup_server) (Express + MongoDB).
> Monorepo root: [`../README.md`](../README.md).

## Stack

| Layer            | Tech                                            |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router) + React 19              |
| Styling          | Tailwind CSS v4 + HeroUI v2.6 + Lucide icons    |
| Animation        | Framer Motion 11 + Swiper 11                    |
| Auth             | Better Auth 1.6 (email/password + Google)       |
| Client libs      | MongoDB driver 6.12, jose 5 (JWT share)         |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` at the project root:

```bash
# Public site URL (used by Better Auth + Stripe redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server base URL — the client calls this for all data
NEXT_PUBLIC_SERVER_URL=http://localhost:5000

# Better Auth — must match the value in the server's .env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<paste the SAME secret as the server's BETTER_AUTH_SECRET>
BETTER_AUTH_GOOGLE_CLIENT_ID=<optional Google OAuth client id>
BETTER_AUTH_GOOGLE_CLIENT_SECRET=<optional Google OAuth client secret>

# MongoDB (Better Auth's adapter reads this directly)
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/code2startup
```

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 4. Production build

```bash
npm run build
npm start
```

## Available scripts

| Script        | Purpose                                  |
| ------------- | ---------------------------------------- |
| `npm run dev` | Start Next.js dev server (Turbopack).    |
| `npm run build` | Production build.                      |
| `npm start`   | Run the production build.                |
| `npm run lint` | Run ESLint (next/core-web-vitals).      |

## App routes

| Path                       | Purpose                                            | Auth                |
| -------------------------- | -------------------------------------------------- | ------------------- |
| `/`                        | Landing — hero slider + featured startups/opps    | public              |
| `/browse-startups`         | Searchable + filterable grid of startups          | public              |
| `/browse-opportunities`    | Searchable + filterable grid of open roles         | public              |
| `/startup/[id]`            | Public startup profile                            | public              |
| `/opportunity/[id]`        | Public opportunity detail (Apply when signed in)   | public              |
| `/login`, `/register`      | Better Auth email/password + Google                | guest only          |
| `/forgot-password`         | Password reset                                     | guest only          |
| `/dashboard`               | Role-aware dashboard router                        | signed-in           |
| `/dashboard/founder`       | Founder CRUD (startups, opportunities, apps)       | role: **founder**   |
| `/dashboard/collaborator`  | My applications + browse + apply                   | role: **collaborator** |
| `/dashboard/admin`         | Admin overview / users / startups / transactions   | role: **admin**     |
| `/pricing`                 | Stripe checkout entry                              | signed-in           |
| `/about`, `/how-it-works`, `/blog`, `/careers`, `/contact` | Marketing pages | public |
| `/privacy`, `/terms`, `/cookies`, `/gdpr` | Legal pages               | public              |

## Project structure

```
src/
  app/                       Next.js App Router
    dashboard/               Role-protected dashboards
      founder/               _components/ = per-tab UI bits
      collaborator/
      admin/
    browse-startups/, browse-opportunities/   Search + filter + paginate
    api/auth/[...all]/route.js                Better Auth handler
  components/                Shared client UI (hero slider, skeleton, pagination, …)
  lib/                       Auth client, API helper, fetch wrappers
  assets/                    Static images (slider backgrounds, logos)
```

## Notable features

- **Auth (Better Auth)** — email/password + Google social, MongoDB adapter,
  JWT plugin shares a secret with the server so HTTP-only cookies + Bearer
  tokens both verify.
- **Role-aware dashboards** — `/dashboard` routes the user to the right
  experience based on `session.user.role`.
- **Search & filter** — debounced text + selects on `/browse-*` pages.
- **Pagination** — shared `Pagination` component + per-page selector,
  driven by `?page=&limit=` on the server.
- **Animations** — Framer Motion entrance + hover on hero, featured
  startups, featured opportunities, and "Why Join Us" sections.
- **Loading & error UI** — top-level `loading.js` and `error.js` plus
  per-route skeletons in `dashboard/`, `browse-*`, `startup/[id]`,
  `opportunity/[id]`.
- **404** — custom illustrated `not-found.js` with quick links.

## Deployment

The client is a standard Next.js 16 app — deploy to Vercel, Netlify,
or any Node 20+ host:

```bash
npm run build
npm start
```

Make sure `NEXT_PUBLIC_SERVER_URL` points at a reachable API host and
that `BETTER_AUTH_SECRET` matches between client and server.
