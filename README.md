# Booky — Web Library with Next.js (App Router)

A full-featured library app to **explore** books, **search/filter**, **borrow**, **reserve**, **manage a wishlist**, and **sign in** against a real REST backend. Built with **Next.js (App Router + RSC)**, **TypeScript**, **Zustand**, **Tailwind**, and **Jest + React Testing Library**.

> Catalog: Open Library (public) · Auth/Profile: Platzi Fake Store API (REST)

---

Features

- **Splash / Login / Catalog** with App Router & Server Components.
- **Search & Filters**: by title/keywords, author, category (subjects) and **sorting** (date, author, popularity).
- **Pagination** with server-side fetch/sort and **ISR** for performance.
- **Book details** `/books/[id]` with authors, description, subjects.
- **Loans** (borrow/renew/return) with **persistance**.
- **Reservations** with strict business rules:
  - **One global reservation per book** (per browser profile).
  - The reservation **window** starts at the **dueAt** of the current loan (or at early return) and lasts **14 days**.
  - While a reservation is active: no one can borrow or reserve (except the **reserver** during their window *and* if the book is `AVAILABLE`).
  - **Borrow now** only appears/enables **after** the previous loan ends **and** you are within your window.
- **Wishlist** with optional browser **notifications** when a title becomes available.
- **Authentication** with **JWT** via **Next Route Handlers**:
  - `POST /api/auth/login` → sets **HttpOnly cookies (access/refresh)**.
  - `GET /api/auth/profile` on server + **auto-refresh** token on the client.
  - `POST /api/auth/logout` → clears cookies.
  - Middleware guarding private routes.
- **Testing**: unit tests for critical components and a custom hook with Jest + RTL.
- **Code quality**: TypeScript, ESLint, **SOLID / KISS / YAGNI**, domain modules (DDD‑lite).

---

## Live Demo

- **Live URL**: https://book-library-livid-seven.vercel.app/books
- **Demo credentials**: `john@mail.com` / `changeme` (Platzi API demo)

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, RSC, Route Handlers, Middleware, ISR)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State**: Zustand + `persist` (`localStorage`)
- **Auth**: HttpOnly cookies (access/refresh) via internal Route Handlers
- **Testing**: Jest, React Testing Library, `jest-environment-jsdom`
- **Linting**: ESLint (Next + TS)
- **Dev bundler**: Turbopack (`next dev --turbo`)

---

## 🗄️ Architecture (DDD‑lite & URL-as-State)

```
.
├─ app/
│  ├─ login/
│  ├─ books/           # catalog & details
│  │  └─ [id]/
│  ├─ wishlist/
│  ├─ loans/
│  ├─ reservations/
│  └─ api/auth/        # route handlers: login/profile/refresh/logout
├─ components/         # UI (BookCard, FilterBar, Paginator, ReadingTracker, Header, Watchers)
├─ hooks/              # useDebounce, useHydrated
├─ lib/                # helpers (date, notify)
├─ modules/
│  ├─ books/
│  │  ├─ domain/       # types, sort, availability
│  │  ├─ mappers/      # openlibrary.mapper
│  │  └─ services/     # openlibrary.search / work
│  ├─ inventory/       # global (per browser): loans + single reservation per book
│  ├─ loans/           # per-user: history (issue/renew/return delegates to inventory)
│  ├─ reservations/    # (legacy per-user) — now reservations are in inventory
│  ├─ wishlist/        # per-user
│  ├─ reading/         # per-user (reading status)
│  ├─ users/           # user store (profile)
│  └─ auth/            # auth client (fetch with auto-refresh)
└─ __tests__/          # Jest + RTL
```

**Key design points**
- **Global availability per browser**: `modules/inventory` (in `localStorage`) tracks `ON_LOAN`, `dueAt`, and the **single global reservation** `{ reservedBy, startAt, endAt, title, coverUrl }`.
- **Per-user history** (`byUser[userKey]`): loans, wishlist, reading; `userKey` = `user:{id}` or `guest`.
- **Reservation rules** enforced **inside inventory** (source of truth). Components consult `canBorrow()` / `getItem()` / `reservation`.

---

## Setup & Run

### Requirements
- Node.js **18+** (18.18+ or 20.x recommended)
- npm 9+ (or pnpm 8+)

### Install
```bash
git clone <repo-url>
cd booky
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Useful scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

> **Note**: For local testing of login, HttpOnly cookies work on `http://localhost`. In production use **HTTPS** (cookies are `Secure`).

---

## 🔐 Authentication & Internal API

**Flow**
1. `POST /api/auth/login` → proxy to Platzi `/auth/login`, set **HttpOnly cookies** `access_token` + `refresh_token`, return **profile**.
2. `GET /api/auth/profile` → server-side call to Platzi with `access_token`.
3. `POST /api/auth/refresh` → refresh tokens, reset cookies.
4. `POST /api/auth/logout` → clear cookies.

**Client** (`modules/auth/client.ts`)
- `fetchJson()` retries once after `401` by calling `/api/auth/refresh`.

**Guards**
- `middleware.ts` redirects to `/login?returnTo=...` if `access_token` cookie is missing for private routes (`/books`, `/wishlist`, `/loans`, `/reservations`).

---

##  Catalog

- Advanced search (`/modules/books/services/openlibrary.ts`):
  - Combines keywords + `author:` + `subject:` (category).
  - Pagination (`page`) and **ISR** (`revalidate=60`).
- Minimal mapping to `Book` type (title, authors, year, cover, popularity).
- Filter UI: author, category (subjects), sort (date, author, popularity).
- **URL-as-state**: `?q=&author=&category=&sort=&page=`.

---

## Loans, Reservations & Availability

- **Inventory (global)** — `localStorage: inventory:v1`
  - `borrow/return/renew` and **single `reserve` per book** with **14-day** window.
  - Rules:
    - With an active reservation:  
      - Before `startAt`: **nobody** can borrow.  
      - Between `startAt..endAt`: **only the reserver** can borrow, and only if the book is `AVAILABLE`.  
      - When the reserver borrows, the reservation is cleared.
- **Loans (per-user)** — `loans:v2`
  - Keeps **user history**; actions delegate to `inventory` to enforce rules.
- **Reservations page** — lists **active** reservations by filtering `inventory.items` where `reservation.reservedBy === userKey`.
  - **Borrow now** enabled only if **inside window** and the item is **AVAILABLE**.

---

## Testing

- **Setup**: `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `whatwg-fetch`, `next/jest`.
- **Coverage**: critical components and a hook (see `__tests__/`):
  - `BookCard.test.tsx`: borrow / return / reserve (mock inventory & user).
  - `FilterBar.test.tsx`: filters → `router.replace`.
  - `Paginator.test.tsx`: page navigation.
  - `ReadingTracker.test.tsx`: reading state/progress.
  - `useDebounce.test.ts`: debouncing with `jest.useFakeTimers()`.
- **Store reset**: utility `test/resetStores.ts` clears `localStorage` and resets Zustand between tests.

Run:
```bash
npm test
npm run test:watch
```

---

## Best Practices

- **SOLID**: services and stores with single responsibility (books/auth/inventory/loans…).
- **KISS / YAGNI**: minimal API surface, frontend-first, `localStorage` as the single source where applicable.
- **SSR/RSC**: heavy data fetch on the server; client components focused on interaction.
- **Avoid hydration mismatch**: `useHydrated()` for client-only text and URL-driven state.
- **Accessibility**: labeled form controls, adequate hit targets, contrast on chips/badges.

---

## Main Routes

- `/` Splash / Landing
- `/login` Authentication
- `/books` Catalog (search/filters/sort/pagination)
- `/books/[id]` Detail + Reading tracker
- `/wishlist` Wishlist
- `/loans` My loans
- `/reservations` My reservations (with “Borrow now” during the active window)

