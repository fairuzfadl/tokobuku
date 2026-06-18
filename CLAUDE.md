# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `tokobuku/` directory (the Laravel root).

```bash
# Full dev environment (server + queue + logs + Vite HMR, all concurrent)
composer dev

# Build frontend assets for production (required after any JS/JSX change when not using dev server)
npm run build

# Run tests
composer test
# or
php artisan test
# Single test file
php artisan test tests/Feature/ExampleTest.php

# Database
php artisan migrate
php artisan migrate:fresh --seed   # reset + seed all data
php artisan db:seed --class=SettingSeeder

# Code formatting (PHP)
./vendor/bin/pint

# Queue worker (needed for invoice generation, email, Midtrans callbacks)
php artisan queue:listen --tries=1

# Tinker (REPL)
php artisan tinker
```

**Critical:** When `public/hot` exists, Laravel loads JS from the Vite dev server. If the dev server is not running, pages show blank. Delete `public/hot` to force production build mode.

## Architecture

This is a **Laravel 12 + Inertia.js v2 + React 18** bookstore SPA. Laravel handles routing, auth, and data; Inertia bridges them to React pages without a separate API layer.

### Controller namespacing

Controllers are split into four namespaces that map to distinct concerns:
- `App\Http\Controllers\Admin\*` — back-office management (CRUD for books, orders, users, etc.)
- `App\Http\Controllers\Catalog\*` — public storefront (book listing + detail, category pages)
- `App\Http\Controllers\Commerce\*` — transactional (cart, checkout, orders, wishlist, reviews)
- `App\Http\Controllers\User\*` — account (profile, addresses, notifications)
- `App\Http\Controllers\Payment\*` — Midtrans webhook handler only

### Service layer

Business logic lives in `app/Services/`:
- `OrderService` — creates an order from a cart inside a DB transaction; uses `lockForUpdate()` for stock race-condition safety; fires `OrderPlaced` event.
- `CartService` — resolves cart by user or session (guest checkout is supported).
- `VoucherService` — validates voucher eligibility and calculates discount.
- `MidtransService` — creates Snap payment tokens.
- `InvoiceService` — generates PDF invoices via `barryvdh/laravel-dompdf`.

### Event/Listener pipeline

Order lifecycle events (`OrderPlaced`, `OrderPaid`, `OrderCancelled`, `OrderShipped`) trigger listeners that send emails and, on `OrderPaid`, dispatch `GenerateInvoicePdf` job. Midtrans webhook (`POST /payment/webhook`) dispatches `ProcessMidtransCallback` job on the `high` queue to keep the response under Midtrans's 10-second window.

### Shared Inertia props

`HandleInertiaRequests::share()` injects these into every page's props:
- `auth.user` — id, name, email, role, avatar (null for guests)
- `cart_count` — resolved for user or session-based guest cart
- `wishlist_ids` — array of book IDs in the user's wishlist
- `flash.success` / `flash.error` — server-set flash messages
- `settings` — site_name, midtrans_snap_url, midtrans_client_key

**Important:** `usePage().url` (not `usePage().props.url`) is the current pathname in Inertia v2.

### Frontend layout system

Three layouts wrap all pages:
- `AdminLayout` — dark sidebar nav, flash auto-dismiss (4 s), active-route highlight via `usePage().url`
- `MainLayout` — public storefront header with cart count and wishlist state from Zustand stores
- `GuestLayout` / `AuthenticatedLayout` — Breeze scaffolding for auth pages

### State management (frontend)

Zustand is used only for UI synchronization, not persistence:
- `useCartStore` (count) — synced from `cart_count` Inertia prop
- `useWishlistStore` (ids) — synced from `wishlist_ids` Inertia prop

All mutations go through Inertia router calls, which refresh the shared props automatically.

### Book model specifics

- Full-text search via MySQL `MATCH(title, synopsis) AGAINST(? IN BOOLEAN MODE)` — the `scopeSearch` on `Book`.
- `book_type` is `physical | digital | both`. Stock validation and file fields apply conditionally.
- `getFinalPriceAttribute` applies `discount_percent` if `discount_until` is in the future.
- `cover_image` stores a full URL (from `Storage::disk('public')->url($path)`). On update, `handleFileUploads()` in `Admin\BookController` unsetting `cover_image` from validated data when no new file is uploaded is intentional — it prevents overwriting the existing URL with null.

### Admin `Route::resource` pattern

Admin resources use `Route::resource(...)` which generates a `show` route. Every resource controller **must** implement `show()` or that route crashes with a 500. Controllers without `show`: `VoucherController`, `ReviewController` (index-only, no detail page by design).

### Settings

`Setting::get($key, $default)` and `Setting::set($key, $value)` use a 24-hour cache keyed as `settings.{key}`. `Setting::set` calls `Cache::forget` for the specific key. Admin saves all at once via `POST /admin/settings`.

### File storage

All uploaded files use `Storage::disk('public')`. Path convention:
- Book covers: `books/covers/`
- Book digital files (PDF): `books/digital/`
- Banners: `banners/`
- User avatars: `avatars/{user_id}/`

Stored URLs are full URLs from `Storage::disk('public')->url($path)`.

### Payment flow

1. Checkout → `OrderService::createFromCart()` → `MidtransService::createSnapToken()` → redirect to `/checkout/payment/{orderNumber}`
2. Payment page loads Midtrans Snap JS and opens the payment widget using the snap token.
3. After payment, Midtrans POSTs to `/payment/webhook` → `ProcessMidtransCallback` job updates order status and fires `OrderPaid` event.

### Order number format

`TKB-{YYYYMMDD}-{000001}` — generated by `OrderService::generateOrderNumber()`.

---

## Implemented Features

### Storefront (public + user)
| # | Feature | Route(s) | Status |
|---|---------|----------|--------|
| 1 | Homepage — featured books, new arrivals, categories, banner | `home` | ✅ Working |
| 2 | Catalog — list, filters (category, author, price, rating, type, sort), MySQL full-text search, pagination | `catalog.index` | ✅ Working |
| 3 | Book detail — info, reviews, add to cart, wishlist toggle | `catalog.show` | ✅ Working |
| 4 | Category page | `category.show` | ✅ Working |
| 5 | Cart — guest + auth, add / update quantity / remove | `cart.*` | ✅ Working |
| 6 | Checkout — address, shipping cost (manual), voucher, Midtrans Snap | `checkout.*` | ✅ Working |
| 7 | Payment — Snap popup, redirect on success/fail | `checkout.payment` | ✅ Working |
| 8 | Order history — list, status filter | `orders.index` | ✅ Working |
| 9 | Order detail — timeline, items, cancel (pending only), download invoice PDF | `orders.show` | ✅ Working |
| 10 | Digital file download (completed orders only) | `orders.download` | ✅ Working |
| 11 | Wishlist — toggle, view list | `wishlist.*` | ✅ Working |
| 12 | Reviews — submit via axios (requires completed order, pending moderation) | `reviews.store` | ✅ Working |
| 13 | User profile — update name/phone, change password, avatar upload | `profile.*` | ✅ Working |
| 14 | Addresses — CRUD, set default | `profile.addresses.*` | ✅ Working |
| 15 | Notifications — list, mark read, mark all read | `notifications.*` | ✅ Working |
| 16 | Auth — register, login, forgot/reset password, email verification | `login` etc. | ✅ Working |

### Admin panel (`/admin`)
| # | Feature | Route(s) | Status |
|---|---------|----------|--------|
| 17 | Dashboard — stats (today/month), 30-day sales chart, recent orders, low-stock count | `admin.dashboard` | ✅ Working |
| 18 | Books — list + search, CRUD, cover/PDF upload, toggle active | `admin.books.*` | ✅ Working |
| 19 | Categories — CRUD, parent/child, show with sub-categories + books | `admin.categories.*` | ✅ Working |
| 20 | Authors — CRUD, show with books list | `admin.authors.*` | ✅ Working |
| 21 | Publishers — CRUD, show with books list | `admin.publishers.*` | ✅ Working |
| 22 | Orders — list + filter, detail, update status (ship/complete/cancel/refund), tracking number, download invoice | `admin.orders.*` | ✅ Working |
| 23 | Users — list + search, detail with recent orders, toggle active/admin role | `admin.users.*` | ✅ Working |
| 24 | Vouchers — CRUD (percent/fixed discount, date range, usage limits) | `admin.vouchers.*` | ✅ Working |
| 25 | Banners — CRUD, image upload, scheduling (starts_at/ends_at), show detail | `admin.banners.*` | ✅ Working |
| 26 | Reviews — list, approve, delete | `admin.reviews.*` | ✅ Working |
| 27 | Reports — sales chart, top books, stats, CSV export with date filter | `admin.reports.*` | ✅ Working |
| 28 | Settings — edit grouped key-value settings (general, payment, shipping, etc.) | `admin.settings.*` | ✅ Working |

---

## Known Bugs

All previously identified bugs and limitations have been resolved. See history below.

### Resolved (2026-04-30)

**BUG-1: `Catalog/Show.jsx` — discount_until not checked client-side** ✅ Fixed
- `isDiscountActive` now checks both `discount_percent > 0` AND `discount_until` is null or in the future before applying the discounted price display.

**BUG-2: `VoucherController::update()` ignores most form fields** ✅ Fixed
- `update()` validation expanded to match `store()` — all fields (code, type, value, min_order, max_discount, max_uses, starts_at, expires_at, is_active) are now saved.

**BUG-3: `ProfileController::updateAvatar` — old avatar file not deleted** ✅ Fixed
- `parse_url()` + `str_replace('/storage/', '')` strips the URL to a relative path before calling `Storage::disk('public')->exists/delete`.

**LIMIT-1: Guest cart not merged on login** ✅ Fixed
- `AuthenticatedSessionController::store()` now captures the session ID before `regenerate()` and calls `CartService::mergeGuestCart($user, $sessionId)` after authentication.

**LIMIT-2: Banner active scope ignores date range** ✅ Fixed
- `Banner::scopeActive()` now filters `starts_at <= now()` and `ends_at >= now()` (null values treated as open-ended).

**LIMIT-3: Homepage shows banner as text-only, no image** ✅ Fixed
- Homepage hero now renders `banner.image` as a full-width `<img>` with a `bg-black/40` overlay for the title/subtitle text. Falls back to a gradient if no image.

**LIMIT-4: Shipping cost always 0** ✅ Fixed
- Added `flat_shipping_cost` (default 15000) to `SettingSeeder` and Settings admin.
- `CheckoutController::index()` reads both `flat_shipping_cost` and `free_shipping_threshold` from `Setting::get()` and passes them as Inertia props.
- `Checkout/Index.jsx` computes the shipping cost from props, shows "Gratis" when the free-shipping threshold is met, and displays a progress hint for how much more is needed.
- Order summary total now correctly adds shipping cost.

**LIMIT-5: Review rating stats not auto-updated** ✅ Fixed
- `AdminReviewController` now calls `syncBookRating(int $bookId)` after both `approve()` and `destroy()`, which recalculates `rating_avg` and `rating_count` from all approved reviews for that book.
