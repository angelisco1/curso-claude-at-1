# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Resttek — a restaurant management platform: an admin panel, an employee app (kitchen/bar/floor), and a customer ordering app, all backed by a single Node.js/Express API. It is a course project (`base-curso-desarrollo-con-ia`) and its `docs/` folder is unusually thorough — read the relevant doc before making non-trivial changes rather than re-deriving behavior from code alone.

- [`docs/arquitectura/arquitectura-general.md`](docs/arquitectura/arquitectura-general.md) — monorepo layout, data flow, auth flow
- [`docs/arquitectura/arquitectura-api.md`](docs/arquitectura/arquitectura-api.md) — backend architecture, endpoints, error handling, path aliases
- [`docs/arquitectura/arquitectura-frontend.md`](docs/arquitectura/arquitectura-frontend.md) — frontend architecture per app, state patterns, interceptors
- [`docs/dominio/modelo-datos.md`](docs/dominio/modelo-datos.md) — SQLite schema
- [`docs/dominio/glosario.md`](docs/dominio/glosario.md) — domain terms and roles
- [`docs/revisiones/`](docs/revisiones) — known doc-vs-code inconsistencies already found by prior audits (worth checking before trusting a doc claim blindly)

## Commands

Monorepo managed with npm workspaces (`packages/*`); a single `npm install` from the root installs everything.

```bash
npm run seed          # populate SQLite with sample data (packages/api/src/scripts/seed.ts), idempotent (INSERT OR IGNORE)

npm run dev:api        # API on :3000 (tsx watch)
npm run dev:admin      # web-admin on :4200 (ng serve --proxy-config proxy.conf.json)
npm run dev:empleados  # web-empleados on :4201
npm run dev:clientes   # web-clientes on :4202

npm test               # runs the API test suite (vitest run), from root or packages/api
cd packages/api && npm run test:watch   # vitest watch mode
```

- There is no root lint/build script; Angular apps build individually with `ng build` inside each package.
- No test files exist for any frontend package; only `packages/api` has tests, and they are unit tests only (no HTTP integration tests, despite `supertest` being a listed dependency).
- Frontends proxy `/api` to `http://localhost:3000` in dev (`proxy.conf.json` in each package), so start the API first.
- After changing the DB schema in `runInitialMigrations()` (`packages/api/src/config/database.ts`), delete `packages/api/resttek.db` and reseed — there is no migrations framework, only `CREATE TABLE IF NOT EXISTS`.
- Changes to `web-shared` require restarting the consuming frontend's dev server (it's consumed straight from source, no build step, and Angular won't hot-reload it).

## Architecture

### Backend (`packages/api/src`) — two coexisting styles

- **Hexagonal + DDD**, only for `employee` (`src/contexts/employee/{domain,application,infrastructure}`): the sole domain entity (`Employee`, private constructor + `create()` factory), the only two Value Objects (`Email`, `Role`), and the only three use-case classes (`LoginUseCase`, `CreateEmployeeUseCase`, `RegisterClientUseCase`). Repository interfaces here are prefixed `I` (`IEmployeeRepository`).
- **By-layer**, for `restaurant`, `dish`, `ingredient`, `order`: cross-cutting `models/`, `repositories/`, `services/`, `controllers/`, `routes/` folders, one file per domain each. No behavior-bearing entities — `Restaurant`/`Dish`/`Ingredient`/`Order` are plain interfaces; validation lives in `services/` (e.g. `buildX()` helpers) and in `normalizeX()` functions in `models/`. Repository interfaces here have no `I` prefix and live in the same file as their SQLite implementation.
- `src/contexts/shared/` is not a business bounded context — just the `Email` value object and Express middlewares/`errorHandler`.
- Path aliases (`@config/*`, `@shared/*`, `@employee/*`, `@models/*`, `@repositories/*`, `@services/*`, `@controllers/*`, `@routes/*`, `@scripts/*`, `@errors/*`) map to `src/*`; imports use `.js` extensions (ESM, `nodenext`).
- Error handling: `AppError` subclasses in `errors/DomainErrors.ts`; `errorHandler` maps by class name (404 for `*NotFoundError` except `OrderNotFoundError`, which falls through to 400). `OrderController` is the one controller that doesn't call `next(error)` — it has its own try/catch, so its error responses don't follow the shared 404 rules.
- Everyone (including customers) is a row in `employees` — there is no separate customers table. A customer is `role = 'cliente'`, `restaurant_id = null`. Ordering `quantity: 3` of a dish creates 3 separate `order_items` rows (`quantity: 1` each) so kitchen staff can track each unit's status independently.
- Route files wire their own dependencies inline (repository → service → controller → router) except `employee`, whose wiring is centralized in `contexts/employee/infrastructure/http/dependencies.ts`.
- `Database` (`config/database.ts`) is a plain exported instance (`dbConfig`), not a `getInstance()` singleton. DB file is `packages/api/resttek.db`, or `:memory:` when `NODE_ENV=test`.

### Frontend — three Angular 21 apps + one shared library, not uniformly structured

- All three apps are standalone-components/signals/zoneless, feature-based, but **not identically organized**:
  - `web-admin` / `web-empleados`: each feature has `models/`, `pages/`, `services/`, `store/` (a signal-backed store service wraps HTTP calls via `firstValueFrom`; components only talk to the store).
  - `web-clientes`: centralizes models/services in `core/`; features are standalone components. The Store pattern is **not** the norm here — only `CartStore` exists (purely local, no HTTP). Everything else (`restaurant-list`, `restaurant-menu`, `cart`, `my-orders`, `order-detail`) calls services directly with `.subscribe()`. Polling for order status is done with raw `setInterval`/`clearInterval` in components (10s for `my-orders`, 5s for `order-detail`), unlike `web-empleados`'s `OrderStore.startPolling()` (30s).
- `@resttek/web-shared` (consumed straight from `src/`, no build step) centralizes `API_URL` token, `AuthService`/`AuthStore`/`authGuard`, `authInterceptor`/`errorInterceptor`, and `Login`/`Register` components. Its `base.css` design system is **not actually imported anywhere** — each app has its own duplicated `styles.css` copy (`web-empleados`'s has 46 extra lines); treat any shared-style edit as needing to be replicated in all three.
- `API_URL` injection is inconsistent: `web-clientes` services and `web-shared`'s `AuthService` inject the `API_URL` token; `web-admin`/`web-empleados` services import `environment.apiUrl` directly instead.
- Auth: JWT in `localStorage` via `AuthStore` (signals), attached by `authInterceptor`; `errorInterceptor` clears session and redirects to `/login` on 401; `authGuard` only checks session presence, not role — role-based UI filtering (e.g. `web-empleados`'s `ShellComponent.canSeeCocina/canSeeBarra/canSeeSalon`) is nav-only, not a real access restriction (the API's `authorize()` middleware is the actual enforcement).
- Role value stored/sent is `manager`, not `gerente` ("gerente" is only the UI label).
