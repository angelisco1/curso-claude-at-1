# Resttek — Guía de Onboarding

## ¿Para qué sirve?

**Resttek** es una plataforma de gestión de restaurantes con tres aplicaciones web sobre una única API:

- **web-admin** — panel de administración (gestión de restaurantes, platos, ingredientes, empleados).
- **web-empleados** — app operativa para cocina, barra y salón (seguir y actualizar el estado de los pedidos).
- **web-clientes** — app para que los clientes finales vean la carta y hagan pedidos.

Las tres apps consumen la misma API REST y comparten el mismo dominio: restaurantes, platos, ingredientes, pedidos y empleados.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js + **Express 5** + **TypeScript**, ejecutado con `tsx` |
| Base de datos | **SQLite** (`sqlite3`), en memoria en tests |
| Auth | **JWT** (`jsonwebtoken`) + `bcrypt` para contraseñas |
| Testing backend | **Vitest** + `supertest` |
| Frontend | **Angular 21** (standalone components + signals) |
| UI | `lucide-angular` para iconos |
| Monorepo | **npm workspaces** (un solo `npm install` para todo) |

## Organización del proyecto

Monorepo con 5 paquetes bajo `packages/`:

```
packages/
├── api/            # Backend Express + TS (puerto 3000)
├── web-admin/      # Angular, panel admin (puerto 4200)
├── web-empleados/  # Angular, app empleados (puerto 4201)
├── web-clientes/   # Angular, app clientes (puerto 4202)
└── web-shared/     # Librería Angular compartida: auth, interceptors, componentes comunes
```

Los tres frontends dependen de `web-shared`, pero no dependen entre sí. Todos hacen proxy de `/api` hacia la API en desarrollo.

### Backend (`packages/api/src`)

Conviven dos estilos arquitectónicos:

- **Por capas** (`restaurant`, `dish`, `ingredient`, `order`): carpetas transversales `models/`, `repositories/`, `services/`, `controllers/`, `routes/`.
- **Hexagonal / DDD** (`employee`): capas `domain/`, `application/`, `infrastructure/` bajo `src/contexts/employee/`.

### Frontend

Arquitectura *feature-based*: `web-admin` y `web-empleados` agrupan cada feature en `models/`, `pages/`, `services/`, `store/`; `web-clientes` centraliza en `core/`.

## Documentación ampliada

Para más detalle, consulta la carpeta [`docs/`](./docs):

- [`docs/arquitectura/arquitectura-general.md`](./docs/arquitectura/arquitectura-general.md) — visión general, flujo de datos, auth.
- [`docs/arquitectura/arquitectura-api.md`](./docs/arquitectura/arquitectura-api.md) — detalle del backend.
- [`docs/arquitectura/arquitectura-frontend.md`](./docs/arquitectura/arquitectura-frontend.md) — detalle del frontend.
- [`docs/dominio/modelo-datos.md`](./docs/dominio/modelo-datos.md) — esquema de datos.
- [`docs/dominio/glosario.md`](./docs/dominio/glosario.md) — glosario de dominio.

Para arrancar el entorno y credenciales de prueba, consulta el [`README.md`](./README.md) de la raíz.
