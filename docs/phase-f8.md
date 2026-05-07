# Phase F8 — Admin authentication & shell

This document describes how **`carsparepartsfrontend`** implements **admin sign-in**, **JWT storage**, **route protection**, the **admin chrome** (sidebar + main), and **global 401 handling** for the admin app. It complements the high-level checklist in **`docs/FRONTEND_PHASES.md`** (§ Phase F8).

**Login route:** `GET /admin/login` — `src/app/(admin)/admin/login/page.tsx`.

**Protected admin routes** live under `src/app/(admin)/admin/(protected)/…` and render inside **`AdminShell`** once the session is valid.

---

## Goals

| Area | Behavior |
|------|----------|
| **Login** | Form posts **`POST /api/auth/login`** with `username` + `password` (see backend contract). Response must include a **JWT**; the client persists it and then loads **`GET /api/admin/me`**. |
| **Token storage** | Access token is kept in **`sessionStorage`** under a fixed key (see `src/lib/api/adminToken.ts`). Tab/session close clears it; this is an MVP choice (httpOnly cookies would be a hardening follow-up). |
| **Authenticated API** | All admin REST calls go through **`adminApi`** (`src/lib/api/adminClient.ts`). A request interceptor adds **`Authorization: Bearer <token>`** for every path except login. |
| **401 handling** | Any **401** from admin APIs (except login) clears the token and runs a registered handler that sends the user to **`/admin/login`** (`setAdminUnauthorizedHandler` + `AdminAuthProvider`). |
| **Protected layout** | On mount, **`AdminProtectedLayoutClient`** calls **`refreshSession()`** (`GET /api/admin/me`). Until a user is known, a minimal loading state is shown; if unauthenticated, **`router.replace("/admin/login")`**. |
| **Shell** | Successful auth wraps pages in **`AdminShell`**: **`AdminSidebar`** + scrollable **`<main>`** for feature views. |
| **Logout** | **`POST /api/auth/logout`** is attempted (ignored if missing); token is always cleared client-side; navigate to **`/admin/login`**. |
| **Post-login redirect** | Successful **`login()`** navigates to **`/admin/dashboard`**. |

---

## Backend contract (reference)

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/auth/login` | Body: `username`, `password`. Response: **`token`** (JWT string) plus any user fields the backend returns. |
| `GET` | `/api/admin/me` | Returns current **`AdminUser`** when `Authorization` is valid; **401** if not. |
| `POST` | `/api/auth/logout` | Optional; frontend tolerates absence or errors. |

Admin CRUD routes (`/api/admin/...`) are covered in later phases; they all expect the same Bearer token.

---

## Architecture (data flow)

```mermaid
flowchart LR
  subgraph ui [Admin UI]
    LP[AdminLoginPageClient]
    PL[AdminProtectedLayoutClient]
    SH[AdminShell]
    SB[AdminSidebar]
  end
  subgraph ctx [Context]
    APV[AdminAuthProvider]
    UA[useAuth]
  end
  subgraph api [API layer]
    AUTH[auth.ts services]
    AA[adminApi]
    TKN[adminToken]
  end
  subgraph be [Backend]
    LG[/api/auth/login]
    ME[/api/admin/me]
    LO[/api/auth/logout]
  end

  LP --> UA
  APV --> AUTH
  AUTH --> AA
  AUTH --> TKN
  AA --> LG
  AA --> ME
  AA --> LO
  PL --> UA
  PL --> SH
  SH --> SB
  SB --> UA
```

---

## File inventory

### App Router

| File | Role |
|------|------|
| `src/app/(admin)/admin/layout.tsx` | Root admin layout: full-height wrapper + **`AdminLayoutProviders`**. |
| `src/app/(admin)/admin/login/page.tsx` | Renders **`AdminLoginPageClient`**. |
| `src/app/(admin)/admin/(protected)/layout.tsx` | Renders **`AdminProtectedLayoutClient`** around all protected admin pages. |
| `src/app/(admin)/admin/(protected)/dashboard/page.tsx` | Post-login landing (`AdminDashboardView`). |

### Auth & layout components

| File | Role |
|------|------|
| `src/admin/components/AdminLayoutProviders.tsx` | Wraps the tree with **`AdminAuthProvider`**. |
| `src/admin/context/AdminAuthContext.tsx` | **`useAuth`**: `user`, `status`, `login`, `logout`, `refreshSession`; registers **401** redirect handler. |
| `src/admin/components/AdminLoginForm.tsx` | Username/password form; calls **`login()`** from context. |
| `src/admin/components/AdminLoginPageClient.tsx` | Login page shell. |
| `src/admin/components/AdminProtectedLayoutClient.tsx` | Session gate + **`AdminShell`**. |
| `src/admin/components/AdminShell.tsx` | Sidebar + main content column. |
| `src/admin/components/AdminSidebar.tsx` | Nav links (Dashboard, Inventory, Vehicle Library, Categories, Settings) + **Log out**. |
| `src/admin/components/AdminNavLink.tsx` | Active-state link for sidebar items. |

### API layer

| File | Role |
|------|------|
| `src/lib/api/adminClient.ts` | **`adminApi`** axios instance: base URL, JSON default headers, **Bearer** injection, **401** → clear token + handler, errors → **`ApiError`**. |
| `src/lib/api/adminToken.ts` | **`getAdminAccessToken`** / **`setAdminAccessToken`** (`sessionStorage`). |
| `src/lib/api/services/auth.ts` | **`loginRequest`**, **`fetchAdminMe`**, **`logoutRequest`**. |
| `src/lib/api/types/auth.ts` | **`AdminUser`**, **`AdminLoginResponse`** (types). |

---

## UX & security notes

1. **Token in `sessionStorage`** — simple for local dev and demos; for production, prefer **httpOnly, Secure, SameSite** cookies and CSRF strategy coordinated with the backend.
2. **`withCredentials: true`** on **`adminApi`** — allows cookie-based auth later without changing every call site.
3. **Login path exemption** — the interceptor skips attaching a token (or treats failures differently) for **`/api/auth/login`** so failed attempts do not wipe a prior session incorrectly; **401** on other routes clears storage.

---

## Verification

- `npm run lint`
- Manual: open **`/admin/inventory`** unauthenticated → redirect to **`/admin/login`**; sign in → land on dashboard; reload protected page → still authenticated (same tab); call an endpoint that returns **401** → redirect to login; **Log out** → token cleared and login page shown.

---

## Future / follow-ups

- Move JWT to **httpOnly** cookie + align CORS/credentials with backend.
- Optional **refresh token** flow if the API adds one.
- **Remember me** (longer-lived session) only with secure storage design.

---

## Related

- Roadmap: **`docs/FRONTEND_PHASES.md`** — § Phase F8.
