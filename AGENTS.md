<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

##MCPs

- Playwright Screenshots y Cualquier cosa Relacionada a Playwright tienen que estar en la carpeta .playwright
- Context7 Usaremos este mcp para traer la documentación actualizada del Framework
- Supabase MCP (servidor `supabase`): para operar sobre el proyecto de Supabase — ejecutar SQL, aplicar migraciones (`apply_migration` para DDL), leer logs (ClickHouse), revisar advisors de seguridad/rendimiento, generar tipos TypeScript, desplegar Edge Functions, etc. Antes de tocar la base, cargar el skill `.agents/skills/supabase`.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run lint` — ESLint (config `eslint.config.mjs`, core-web-vitals + typescript)
- `npm run build` — build de producción (el único paso que ejecuta typecheck; no hay script `typecheck` aparte)
- No hay framework de tests ni script de test en el repo. No inventes lenguaje: verifica con `npm run build` + `npm run lint`.

## Stack y quirks

- **Este es un proyecto Next.js 16** (`next@16.3.5`) con breaking changes respecto a versiones anteriores. ANTES de escribir código, lee la guía relevante en `node_modules/next/dist/docs/` (App Router, convenciones de archivos, APIs nuevas).
- App Router: todo vive en `app/`. Sigue siendo el scaffold de `create-next-app` (solo `layout.tsx` y `page.tsx`, sin rutas propias todavía).
- **Tailwind v4**: NO hay `tailwind.config.js`. El tema se configura en `app/globals.css` con `@import "tailwindcss"` y `@theme inline`. La paleta/customización de este proyecto va ahí.
- Alias de rutas: `@/*` → raíz del repo (ver `tsconfig.json`).
- `CLAUDE.md` solo re-importa `AGENTS.md` (no duplicar contenido ahí).

## Flujo de trabajo: spec-driven

- Las features grandes se desarrollan con los skills `.agents/skills/spec` (diseñar spec) y `.agents/skills/spec-impl` (implementarla aprobada). Nacen de `klerith/fernando-skills` y están fijados en `skills-lock.json`.
- Las specs viven en `specs/` con naming `NN-slug.md` y estados `Draft → Approved/Aprobado → Implemented`. La carpeta `specs/` aún no existe; se crea con el primer spec.
- `spec-impl` exige estado que signifique "Approved" y trabaja en ramas `spec-NN-slug` (controlado por `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto).
- Agente `spec-verifier` (definido en `.opencode/agent/spec-verifier.md`): verifica los criterios de aceptación de un spec al terminar una implementación. Revisa, corrige y marca los checks (`- [ ]`/`- [x]`), valida pantallas con Playwright (evidencias en `.playwright/`) contra `References/pantallas/`, corre build/lint, revisa la consola del navegador y contrasta las APIs de código con las recomendaciones de Next.js 16 (Context7 + `node_modules/next/dist/docs/`). El código queda en la rama `spec-NN-slug`; lo invocas con `task` (subagent `spec-verifier`) cuando quieras validar un spec o al terminar una implementación.
- Idioma: el repo trabaja en español (mensajes, specs, pantallas). Respeta el idioma del prompt usuario.

## Supabase

- Los skills de Supabase están instalados en `.agents/skills/supabase` y `.agents/skills/supabase-postgres-best-practices` (vienen de `supabase/agent-skills`, fijados en `skills-lock.json`).
- Skill **supabase** (`.agents/skills/supabase`): CARGAR SIEMPRE que la tarea toque Supabase — auth (login, sesiones, JWT, cookies, RLS), Database, Edge Functions, Realtime, Storage, Vectors, Cron, Queues, integraciones SSR (`supabase-js`, `@supabase/ssr`) en Next.js, migraciones, debugging y logs. La skill incluye: verificar contra el changelog oficial antes de implementar, checklist de seguridad (nunca usar `user_metadata` en authz, `SECURITY DEFINER` evita RLS, políticas RLS correctas, etc.), guía del CLI y del MCP server, y flujo de migraciones.
- Skill **supabase-postgres-best-practices** (`.agents/skills/supabase-postgres-best-practices`): cargar ANTES de escribir/modificar cualquier cosa en Postgres — DDL (crear/alterar tablas y columnas), diseño de esquema, migraciones, políticas RLS y sus tests, índices, triggers, funciones, pg_cron/pgmq, pgvector, y diagnóstico de rendimiento (queries lentas, EXPLAIN, conexiones, locks, bloat). Reglas organizadas por prioridad (`query-`, `conn-`, `security-`, `schema-`, `lock-`, `data-`, `monitor-`, `advanced-`).
- La referencia de esquema objetivo del proyecto está en `../07-DB-Schema/opendaycare-database-schema.md` (registrada como referencia `docs` en `opencode.json`). Es SOLO referencia — no está implementada aún en la base.
- Flujo de migraciones: verificar primero si el proyecto usa esquemas declarativos (`supabase/schemas/` o `schema_paths` en `config.toml`); si no, flujo imperativo con `execute_sql` (MCP) para iterar y generar la migración con `supabase db pull` cuando esté lista. No usar `apply_migration` para iterar, ya que escribe historia de migración en cada llamada.

## Referencias de diseño (fuente de verdad visual)

- `References/pantallas/*.dc.html` — mockups HTML estáticos de todas las pantallas del producto (login, feed, avisos, niños, mi-cuenta, resumen-dia, etc.). Son el target visual a replicar en la app.
- `References/screenshots/*.png` — capturas equivalentes de esas pantallas.
- Sistema de diseño: fuentes Google **Fredoka** (títulos) y **Nunito** (texto), paleta cálida: fondo `#f6ecdf`, texto `#3f362e` (los `.dc.html` llevan el CSS de referencia dentro).
- `support.js` es GENERADO por el runtime `dc-runtime` — no editar.

## Reglas de código
- Usa código limpio, nombres, funciones, variables, etc. en ingles.