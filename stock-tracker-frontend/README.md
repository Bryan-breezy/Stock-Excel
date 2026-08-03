# Stock & Inventory Tracker — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind, wired to the Django
backend. Same shelf-tag / stock-room visual language as the mockup,
now backed by real data and mutations.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Runs at `http://localhost:3000`. Make sure the Django backend is running
(see the backend README) and `CORS_ALLOWED_ORIGINS` there includes
`http://localhost:3000` (it does by default).

Sign in with a superuser or any user you created via `/admin/` or
`createsuperuser` on the backend — the login screen calls
`POST /api/token-auth/`.

## Structure

```
src/
  app/
    login/page.tsx          sign-in screen
    (app)/layout.tsx         auth gate + mobile frame + bottom nav, wraps all 5 tabs
    (app)/dashboard/         summary cards, quick actions, "needs attention"
    (app)/products/          search, filter chips, shelf-tag cards, add/edit/stock sheets
    (app)/transactions/      stock move history, today/week/month filter
    (app)/reports/           summary + export buttons (export wiring is a stub — see below)
    (app)/settings/          business info (static) + sign out
  components/
    ui/                      Button, Input, Textarea, Field, Badge, Sheet — shared primitives
    layout/                  TopBar, BottomNav
    products/                ProductCard, Gauge, ProductFormSheet, StockMoveSheet
    dashboard/                MetricCard
  lib/
    api.ts                   one function per backend endpoint, typed end to end
    types.ts                 mirrors the Django serializers field-for-field
  store/
    auth.ts                  Zustand, persists the DRF token to localStorage
    ui.ts                    Zustand, controls which bottom sheet is open and for which product
```

## How data flows

- `ProductsPage` fetches `/api/products/` with `search` / `stock_status`
  query params on every keystroke (debounced) and filter chip change.
- Editing calls `PATCH /api/products/{id}/`; adding calls `POST`. `quantity`
  is intentionally not editable here — it matches the backend, where
  quantity only moves through stock in/out.
- The product card's in/out icons and the dashboard's quick actions open
  `StockMoveSheet`, which posts to `stock-in/` or `stock-out/` and then
  re-fetches the list, so the card, the dashboard totals, and the
  transaction history all stay consistent with the database.
- `useUIStore` is intentionally dumb — it just tracks which sheet is open
  and which product it's for, so both the Dashboard and Products pages can
  trigger the same sheets without prop-drilling.

## Known stubs / next steps

- **Export buttons** (Excel/PDF/CSV on Reports) aren't wired to a
  download yet. The backend's Excel workbook already exists at
  `EXCEL_WORKBOOK_PATH` — the simplest next step is a
  `GET /api/reports/export/` endpoint that streams that file back, or a
  Supabase Storage / S3 link if you move it off local disk.
- **Barcode field** exists on the product form but there's no scanner
  integration — add one if the admin device has camera access you want
  to use for lookups.
- **Supplier picker** on Add/Edit item currently isn't in the form (the
  backend supports it via `supplier` id) — add a `<select>` sourced from
  `api.suppliers.list()` if you want it there instead of just on stock-in.
