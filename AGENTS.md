<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

##MCPs

- Playwright Screenshots y Cualquier cosa Relacionada a Playwright tienen que estar en la carpeta .playwright
- Context7 Usaremos este mcp para traer la documentación actualizada del Framework
- Supabase MCP (servidor `supabase`): para operar sobre el proyecto de Supabase — ejecutar SQL, aplicar migraciones (`apply_migration` para DDL), leer logs (ClickHouse), revisar advisors de seguridad/rendimiento, generar tipos TypeScript, desplegar Edge Functions, etc. Antes de tocar la base, cargar el skill `.agents/skills/supabase`. Ojo: el MCP es para operar/administrar la base; la app la consume con los clientes oficiales de Supabase (ver "Paquetes oficiales de Supabase" abajo).

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
- **Acceso a datos: solo clientes oficiales de Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) mediante los helpers de `lib/supabase/`. Ver la regla dura en la sección Supabase.
- `CLAUDE.md` solo re-importa `AGENTS.md` (no duplicar contenido ahí).

## Flujo de trabajo: spec-driven

- Las features grandes se desarrollan con los skills `.agents/skills/spec` (diseñar spec) y `.agents/skills/spec-impl` (implementarla aprobada). Nacen de `klerith/fernando-skills` y están fijados en `skills-lock.json`.
- Las specs viven en `specs/` con naming `NN-slug.md` y estados `Draft → Approved/Aprobado → Implemented`.
- **Regla dura: si una spec tiene que ver con la base de datos, va en `specs/database/`, nunca en la raíz de `specs/`.** Aplica a cualquier spec que toque el esquema/DB: DDL (tablas, columnas, tipos, vistas), índices, constraints, políticas RLS, functions, triggers, migraciones, seeds/datos, permisos/RBAC, o que sea requisito/consumidor de cambios de esquema. Naming igual (`specs/database/NN-slug.md`) y numeración independiente y continua dentro de la carpeta (la primera es `01-`). Crea `specs/database/` si no existe. Las specs de UI/feature sin cambios de base siguen en `specs/`. Cuando sea ambigua, pregunta antes de escribir.
- `spec-impl` exige estado que signifique "Approved" y trabaja en ramas `spec-NN-slug` (controlado por `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto).
- Agente `spec-verifier` (definido en `.opencode/agent/spec-verifier.md`): verifica los criterios de aceptación de un spec al terminar una implementación. Revisa, corrige y marca los checks (`- [ ]`/`- [x]`), valida pantallas con Playwright (evidencias en `.playwright/`) contra `References/pantallas/`, corre build/lint, revisa la consola del navegador y contrasta las APIs de código con las recomendaciones de Next.js 16 (Context7 + `node_modules/next/dist/docs/`). El código queda en la rama `spec-NN-slug`; lo invocas con `task` (subagent `spec-verifier`) cuando quieras validar un spec o al terminar una implementación.
- Idioma: el repo trabaja en español (mensajes, specs, pantallas). Respeta el idioma del prompt usuario.

## Supabase

- Los skills de Supabase están instalados en `.agents/skills/supabase` y `.agents/skills/supabase-postgres-best-practices` (vienen de `supabase/agent-skills`, fijados en `skills-lock.json`).
- Skill **supabase** (`.agents/skills/supabase`): CARGAR SIEMPRE que la tarea toque Supabase — auth (login, sesiones, JWT, cookies, RLS), Database, Edge Functions, Realtime, Storage, Vectors, Cron, Queues, integraciones SSR (`supabase-js`, `@supabase/ssr`) en Next.js, migraciones, debugging y logs. La skill incluye: verificar contra el changelog oficial antes de implementar, checklist de seguridad (nunca usar `user_metadata` en authz, `SECURITY DEFINER` evita RLS, políticas RLS correctas, etc.), guía del CLI y del MCP server, y flujo de migraciones.
- Skill **supabase-postgres-best-practices** (`.agents/skills/supabase-postgres-best-practices`): cargar ANTES de escribir/modificar cualquier cosa en Postgres — DDL (crear/alterar tablas y columnas), diseño de esquema, migraciones, políticas RLS y sus tests, índices, triggers, funciones, pg_cron/pgmq, pgvector, y diagnóstico de rendimiento (queries lentas, EXPLAIN, conexiones, locks, bloat). Reglas organizadas por prioridad (`query-`, `conn-`, `security-`, `schema-`, `lock-`, `data-`, `monitor-`, `advanced-`).
- La referencia de esquema objetivo del proyecto está en `../07-DB-Schema/opendaycare-database-schema.md` (registrada como referencia `docs` en `opencode.json`). Es SOLO referencia — no está implementada aún en la base.

### Paquetes oficiales de Supabase para hablar con la base de la app (OBLIGATORIO)

**Regla dura: todo acceso a datos desde la app se hace con los clientes oficiales de Supabase para Next.js. Nada de SQL crudo, ORM, HTTP directo a PostgREST, ni `fetch` contra la API a mano.** Si necesitas una consulta que los clientes no cubren, créala como RPC/función en Postgres (con su migración) y llámala con `supabase.rpc(...)`.

- **Paquetes (ya instalados, no instalar otros ni forks):** `@supabase/ssr` (`createBrowserClient` / `createServerClient` — sesiones por cookies) y `@supabase/supabase-js` (el cliente que los anteriores envuelven: auth, PostgREST, Realtime, Storage, Functions). Fija las versiones y commitea el lockfile al instalar/actualizar.
- **Credenciales:** siempre las de la app y desde env — `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key, nunca la `service_role`/secret key en código de cliente; jamás la expongas al navegador). Ver `.env.template`.
- **Clientes ya factorizados en `lib/supabase/` — reutilízalos, no los re-declares en cada archivo:**
  - `lib/supabase/server.ts` → Server Components, Server Actions y Route Handlers. Firma actual: `createClient(cookieStore)`, donde `cookieStore = await cookies()`.
  - `lib/supabase/client.ts` → Client Components. `createClient()` sin argumentos.
  - `lib/supabase/proxy.ts` → `proxy.ts` (raíz), que refresca la sesión con `supabase.auth.getClaims()` en cada request.
- **Tipos:** los clientes se tipan con el tipo `Database` generado desde el esquema real. Tras cada migración que cambie el esquema, refresca los tipos con `supabase_generate_typescript_types`, actualiza el tipo local en `lib/database.types.ts` y úsalo en los `createClient<Database>(...)`. No escribas tipos a mano ni uses `any` en las respuestas de la base.
- **Consultas:** usa siempre el builder de PostgREST con select anidados y filtros declarados (`.select('*, children(*)')`, `.eq(...)`, `.in(...)`), no ensembles N+1. Para operaciones de escritura usa los métodos del cliente (`insert`, `update`, `upsert`, `delete`) y encadena filtros de seguridad: `insert` sin `.select()` no devuelve la fila; todo `update`/`delete` exige un `eq`/`match` explícito para no tocar filas ajenas.
- **Auth y autorización:** el refresh en `proxy.ts` mantiene las cookies vivas pero NO autoriza nada. Valida sesión/rol en cada Server Component, Server Action y Route Handler (`.auth.getClaims()` y, si necesitas el perfil, la tabla de perfiles). La autorización real la resuelve RLS en Postgres: el cliente nunca debe depender de ocultar datos en la UI.
- **La RLS manda:** si una consulta desde la app devuelve 0 filas o da error de `permission denied`, el problema está en las políticas RLS (o en que el JWT no lleva el rol esperado), no en el código de la app. Revisa `supabase_get_advisors` / las políticas antes de "arreglarlo" en el cliente.
- **Verifica contra la doc oficial antes de inventar:** la skill `.agents/skills/supabase` cubre el patrón SSR y sus checklists; ante dudas de API usa Context7 (`/supabase/supabase`) o https://supabase.com/docs/guides/auth/server-side/nextjs. No copies patrones viejos (p. ej. `@supabase/auth-helpers-nextjs` o `@supabase/nextjs`): aquí va `@supabase/ssr`.
- **No subas `service_role` al cliente.** Si una tarea necesita saltar RLS (jobs, scripts de administración, Edge Functions), se hace del lado servidor explícitamente y con su propia revisión de seguridad.

### Migraciones (OBLIGATORIO siempre que se toque la base)

**Regla dura: NUNCA manipules la base de datos sin una migración que lo registre.** Cualquier cambio en Postgres —DDL (crear/alterar tablas, columnas, tipos, vistas), índices, constraints, políticas RLS, functions, triggers, extensiones, seeds de datos, o cambios de permisos/RBAC— debe quedar recorded en `supabase/migrations/` y aplicado en la historia del proyecto remoto. Si el cambio existe solo en la base y no en un archivo `.sql`, el trabajo está incompleto.

- **Alcance:** aplica a toda tarea que escriba en la base, sin excepción: aunque el cambio sea de una línea, aunque lo hagas con `execute_sql`, aunque parezca "solo para probar". Los datos de prueba/fixtures también van en migración (o en un script de seed versionado), nunca a mano.
- **Flujo (imperativo, el que usa este proyecto):** (1) explorar el estado actual con `list_tables`/`execute_sql`; (2) **iterar con `execute_sql` (MCP)**, que no escribe historia; (3) cuando el SQL esté estable y validado, aplicar la migración definitiva con `apply_migration` (`supabase_apply_migration`, `name` en `snake_case`); (4) confirmar con `list_migrations`; (5) dejar el archivo local sincronizado en `supabase/migrations/<version>_<name>.sql` con el MISMO SQL aplicado.
- **Nunca uses `apply_migration` para iterar o experimentar:** cada llamada escribe una entrada permanente en la historia de migraciones y no se puede deshacer. Si una migración salió mal, corrígela con `execute_sql` (DDL correctivo) y vuelve a aplicar una nueva.
- **Archivos locales:** este proyecto NO usa esquemas declarativos (no hay `supabase/config.toml` ni `supabase/schemas/`); la historia vive en `supabase/migrations/`. Mantén ese directorio como espejo de la historia remota — `supabase link` + `supabase db pull` sirve para regenerarlo/actualizarlo desde el proyecto remoto, no para reemplazar la migración que acabas de crear a mano.
- **Antes de escribir SQL:** carga los dos skills de Supabase (`supabase` y `supabase-postgres-best-practices`) y respeta sus checklists (RLS correctamente redactada, nada de `user_metadata` en authz, cuidado con `SECURITY DEFINER`, índices para los accesos declarados en las políticas).
- **Regenerar tipos:** tras cada migración que cambie el esquema, refresca los tipos TypeScript (`supabase_generate_typescript_types`) y commitéalos junto al código.
- En un spec, la migración es parte de la implementación: se commitea en la rama `spec-NN-slug` junto al código que la usa, y el `spec-verifier` la revisa. Toda spec de base de datos se escribe en `specs/database/` (ver la regla dura en la sección de flujo spec-driven).

## Referencias de diseño (fuente de verdad visual)

- `References/pantallas/*.dc.html` — mockups HTML estáticos de todas las pantallas del producto (login, feed, avisos, niños, mi-cuenta, resumen-dia, etc.). Son el target visual a replicar en la app.
- `References/screenshots/*.png` — capturas equivalentes de esas pantallas.
- Sistema de diseño: fuentes Google **Fredoka** (títulos) y **Nunito** (texto), paleta cálida: fondo `#f6ecdf`, texto `#3f362e` (los `.dc.html` llevan el CSS de referencia dentro).
- `support.js` es GENERADO por el runtime `dc-runtime` — no editar.

## Reglas de código
- Usa código limpio, nombres, funciones, variables, etc. en ingles.