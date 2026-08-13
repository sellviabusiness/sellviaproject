# SellVia Frontend

Next.js (App Router) + Tailwind + an auth-provider abstraction over Ory Kratos. Currently
implements **Feature 1: Unified Authentication** only — see
`Docs/Frontend/Playbooks/01-authentication.md` for scope.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **By default this runs against a local
mock auth provider — no real Kratos required.** See "Auth modes" below.

## Auth modes

Every auth screen goes through one abstraction, `authProvider` (`src/lib/auth/provider.ts`),
which is either the mock implementation or real Ory Kratos — picked by one env var, nothing
else in the app knows or cares which:

```
NEXT_PUBLIC_AUTH_PROVIDER=mock     # default — local mock, no backend needed
NEXT_PUBLIC_AUTH_PROVIDER=kratos   # real Ory Kratos, needs NEXT_PUBLIC_ORY_KRATOS_URL set for real
```

### Mock mode (current default)

Simulates Ory Kratos's own self-service flow contract (same flow/state/node shapes) closely
enough that the real rendering/submission code in `AuthFlowForm` never has to know it isn't
talking to real Kratos. Backed by `localStorage` (a tiny fake user directory) and a plain,
clearly-named, non-httpOnly dev cookie (`sellvia_mock_session`) so server-side route
guards (redirect-if-authed / redirect-if-not) work exactly like they will for real.

- **Demo login:** `demo@sellvia.test` / `password123` (pre-seeded, already verified)
- **Registering a new account** works too — it's saved to `localStorage` for the rest of the
  browser session
- **Recovery / verification code:** always `123456`
- Artificial ~500ms delay on every call so loading states are actually visible

None of this is real security — passwords sit in plaintext in `localStorage`, the session
cookie isn't signed and isn't httpOnly. It exists solely to make the UI end-to-end testable
before a real Kratos environment exists. See "Switching to real Kratos" below.

### Kratos mode

Set `NEXT_PUBLIC_AUTH_PROVIDER=kratos` and `NEXT_PUBLIC_ORY_KRATOS_URL` to a real Kratos
project's SDK URL. Every auth page still renders but shows a clear "not configured" message
instead of a form if the URL is missing — it does not fake success.

## Switching to real Kratos later

1. Set `NEXT_PUBLIC_AUTH_PROVIDER=kratos` and a real `NEXT_PUBLIC_ORY_KRATOS_URL`.
2. That's it for every screen/component in this feature — they all go through `authProvider`
   (`src/lib/auth/provider.ts`) and `getServerSession` (`src/lib/auth/session.ts`), which
   switch implementation based on that one env var.
3. `src/lib/auth/mock/*` becomes dead code at that point — safe to delete, or leave for local
   dev without a Kratos environment.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, hand-written shadcn-style primitives in `src/components/ui`
- `@ory/client` — used by the real Kratos provider only; the mock provider has no dependency on
  it beyond reusing its TypeScript types for shape-compatibility
- `next-themes` for the dark/light toggle

## Structure

```
src/
  app/
    login/ register/ forgot-password/ reset-password/ verify-email/   ← Feature 1 routes
    dashboard/                                                        ← placeholder landing only
  components/
    auth/        ← AuthCard, AuthFlowForm (generic node renderer), RoleSelector, ...
    ui/          ← Button, Input, Label, Card, Alert
    theme/       ← ThemeProvider, ThemeToggle
  lib/
    auth/
      types.ts, config.ts, errors.ts, flow-utils.ts   ← shared contract + utilities
      provider.ts, session.ts                         ← the mode switch (client/server)
      kratos/      ← real Ory Kratos implementation
      mock/        ← local mock implementation (no backend)
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
