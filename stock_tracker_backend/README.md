# Stock & Inventory Tracker — Backend

Django REST Framework API for the mobile stock tracker, matching the PRD:
Postgres (or Supabase) as the source of truth, with an Excel workbook kept
in sync in real time on every create, update, and delete.

## Stack

- Django 5 + Django REST Framework
- PostgreSQL (works as-is against a Supabase connection string too)
- openpyxl for the Excel sync
- Token auth (swap for JWT/Supabase Auth later if needed — see Notes)

## Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # then fill in DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The Excel workbook is created automatically on first write at the path
in `EXCEL_WORKBOOK_PATH` (defaults to `media/exports/inventory.xlsx`) —
open it any time to see products, transactions, suppliers, and the
formula-only dashboard sheet update live.

## Auth

Token auth is enabled by default:

```bash
POST /api/token-auth/       # { "username", "password" } -> { "token" }
```

Use the returned token as `Authorization: Token <token>` on every
subsequent request. DRF's browsable login (`/api/auth/login/`) is also
available for testing endpoints in-browser.

Every user gets a `Profile` with a `role` (`admin` / `manager` / `viewer`)
auto-created on signup. Set the role via `/admin/` or the Django shell:

```python
user.profile.role = "admin"
user.profile.save()
```

- **Viewer**: read-only on everything.
- **Manager**: can create/edit products, suppliers, and run stock in/out.
- **Admin**: everything Manager can do, plus deleting products.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/products/` | list/create. Query params: `search`, `category`, `supplier`, `stock_status=low\|out`, `ordering` |
| GET/PUT/PATCH/DELETE | `/api/products/{id}/` | delete is admin-only |
| POST | `/api/products/{id}/stock-in/` | `{ quantity, supplier?, invoice_number?, purchase_cost?, remarks? }` |
| POST | `/api/products/{id}/stock-out/` | `{ quantity, issued_to?, reason?, remarks? }` — rejects if `quantity` exceeds current stock |
| GET/POST | `/api/suppliers/` | |
| GET | `/api/transactions/` | read-only. Query params: `product`, `type`, `period=today\|week\|month` |
| GET | `/api/dashboard/` | totals for the Dashboard screen's summary cards |
| GET | `/api/reports/` | totals + fast/slow moving products for the Reports screen |

`quantity` on `Product` is read-only in the API — it only ever changes
through `stock-in` / `stock-out`, so every quantity change is guaranteed
to leave a `Transaction` audit trail (mirrors PRD section 14, "Update").

## Notes / things to decide next

- **Excel sync is synchronous** (runs inline via Django signals on save).
  Fine for a single admin device; if multiple people write concurrently,
  move `inventory/services/excel_sync.py` calls into a Celery task queued
  from the signal instead, to avoid file lock contention.
- **Auth**: token auth is wired up as the simplest option. If you go with
  Supabase for the DB, consider Supabase Auth or JWT instead — the
  `permissions.py` role checks work the same either way since they read
  off `request.user.profile.role`.
- **Barcode/image fields** are on `Product` but there's no barcode-scan
  endpoint yet — add one if the mobile app needs camera-based lookup.
