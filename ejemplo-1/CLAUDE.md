# CLAUDE.md

Este archivo proporciona guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Comandos

- Arrancar el servidor: `npm start` (o `node src/index.js`) — escucha en el puerto 3000 (se puede sobrescribir con la variable de entorno `PORT`).
- Todavía no hay suite de tests, build ni linter configurados.

## Arquitectura

API mínima con Express, módulos CommonJS (`"type": "commonjs"` en package.json).

El código tiene que estar en la carpeta `src`.
Dentro de `src` vamos a tener la siguiente estructura:

- index.js
- controllers:
    - informes.controller.js
- models:
    - informe.model.js
- routes:
    - informes.routes.js
- repositories:
    - informes.repository.js
- services:
    - informes.service.js
- utils:
    - db.js

### Modelo de datos

Tabla `informes`: `id, titulo, contenido, id_autor, id_cliente, precio, estado`. `estado` está restringido mediante `CHECK` a uno de estos valores: `creado`, `investigando`, `cerrado`. Todavía no existe una tabla de usuarios — `id_autor`/`id_cliente` son enteros simples sin restricción de clave foránea.

### Endpoints

- `GET /health` — comprobación de estado, devuelve `{ status: 'ok' }`.
- `GET /informes` — devuelve todas las filas de la tabla `informes` en formato JSON.

## Reglas

Todas las dependencias en package.json tienen que estar fijadas a una versión concreta.

## Guia de estilos de la API

Si tienes que hacer algo relacionado con la paginación, mira en `./docs/api-guidelines/api-pagination.md`