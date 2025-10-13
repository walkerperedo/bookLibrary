# Book Library — Live Demo & Test Guide

**Live URL:** https://book-library-livid-seven.vercel.app/books

---

## Run the Test Suite

**Prerequisites**
- Node.js 18+
- npm

**Install & run tests**
```bash
npm install
npm test
# optional: watch mode
npm run test:watch
```

**What’s included in tests**
- Jest + React Testing Library setup (`jest.config.js`, `jest.setup.ts`).
- Unit tests for critical components (e.g., `BookCard`, `FilterBar`, `Paginator`, `ReadingTracker`) and a custom hook (`useDebounce`).
- Mocks for external pieces such as `next/image`, `next/navigation`, `fetch`, and Zustand stores (stores reset between tests).

---

## Authentication Flow (Token-based, via Next.js Route Handlers)

This app uses a full token-based auth flow against a REST API (Platzi Fake Store API) **via server-side proxy endpoints**.
Tokens are **never exposed to client JavaScript**; they are stored as **HttpOnly cookies**.

### Steps

1. **Login**
   - Client calls `POST /api/auth/login` with email & password.
   - The route handler calls the external API (`/auth/login`) and then fetches the user profile.
   - On success, the server sets two cookies:
     - `access_token` (HttpOnly, Secure, SameSite=Lax)
     - `refresh_token` (HttpOnly, Secure, SameSite=Lax)
   - The JSON response includes only the **profile** (no tokens).

2. **Session**
   - Client hydrates profile via `GET /api/auth/profile`.
   - Protected pages are enforced by **`middleware.ts`**:
     - If no `access_token`, user is redirected to `/login?returnTo=/desired/path`.

3. **Automatic Refresh**
   - When a request receives `401` from `/api/auth/profile`, the client calls `POST /api/auth/refresh`.
   - On success, the server rotates cookies and the original request is retried.

4. **Logout**
   - Client calls `POST /api/auth/logout`.
   - Server clears both cookies and the client clears the in-memory profile.

### State & Availability

- **User profile** is stored in a Zustand store (persisted). **Tokens are never stored in JS.**
- **Availability is global per browser** (shared `inventory` store in `localStorage`) so if *John* borrows a book, *Maria* (on the same browser) sees it as **On loan** and can **Reserve**.
- **Per-user history** (loans, reservations, wishlist, reading status) is stored under user-specific keys in `localStorage` (e.g., `byUser["user:123"]`).

---

## Local Development

```bash
npm install
npm run dev
# open http://localhost:3000
```