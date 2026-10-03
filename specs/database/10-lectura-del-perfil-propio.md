# SPEC-DB-10 — Lectura del perfil propio desde `public.users`

> **Status:** Implementado
> **Depends on:** SPEC 09, SPEC 10 (autenticación)
> **Handoff:** Una spec de onboarding podrá agregar el trigger `AFTER INSERT` sobre `auth.users` (hoy sin fila posible para un usuario nuevo) y las policies por tenant sobre `daycare_id`. Esta spec sólo abre la lectura de la propia fila.
> **Date:** 2026-10-03
> **Objective:** Permitir que la app lea la fila del usuario autenticado en `public.users` mediante una policy RLS de lectura propia y el `grant` que la habilita, y usar su `full_name` para el nombre y la inicial del avatar en la Sidebar y para el saludo del feed, en lugar de los literales del mockup.

## Por qué existe este spec

SPEC 10 conectó `/login` a Supabase Auth de verdad, pero `requireUser()` valida la sesión y **descarta** el `JwtPayload`: ningún dato del usuario llega al árbol de render. El nombre que se ve en pantalla viene de `lib/feed.ts`, que copió los literales del mockup — `name: "Caro Giménez"`, `initial: "C"` y `greeting: "Buenas, Caro"`. Con la sesión real de `jpisfil@netcloudsensei.com` abierta, la app muestra el nombre de otra persona.

SPEC 09 creó `public.users` con el usuario staff real ya cargado (`full_name = 'JPisfil'`, `role = 'staff'`), pero la dejó con RLS habilitado, **cero policies** y los privilegios revocados para `anon` y `authenticated`. Verificado en el proyecto: `information_schema.role_table_grants` no lista a `authenticated` para esa tabla. Aunque se cableara, hoy la lectura fallaría con `permission denied for table users`.

Este spec es el handoff que SPEC 09 dejó anotado y el que SPEC 10 declaró fuera de alcance. Es la primera lectura real de una tabla desde la app.

## Scope

**In:**

- Una única migración versionada, aplicada con `apply_migration` y llamada `create_users_self_read_policy`, con dos sentencias: el `grant select` que la tabla necesita y la policy RLS que lo limita a la propia fila.
- `lib/database.types.ts` (nuevo): los tipos generados desde el esquema real del proyecto, no escritos a mano.
- Los tres clientes de `lib/supabase/` tipados con el genérico `Database`, para que `.from("users")` quede verificado por TypeScript.
- `lib/users.ts` (nuevo): el helper `getCurrentUserProfile()` con la única consulta de perfil de la app.
- `components/Sidebar.tsx`, `components/FeedHeader.tsx` y `components/NewPostComposer.tsx`: el nombre, la inicial y el saludo pasan a ser props en lugar de leerse del módulo de mocks.
- `components/FeedContent.tsx`: recibe el perfil y lo reparte a los dos componentes hijos que hoy leen el mock.
- `lib/feed.ts`: se borran `SIDEBAR.user.name`, `SIDEBAR.user.initial` y `FEED_HEADER.greeting`, junto con los campos de sus tipos, para que el mock no pueda reintroducirse por descuido.
- Las tres páginas que montan `Sidebar` pasan de `await requireUser()` a `const profile = await getCurrentUserProfile()`.

**Out of scope (for future specs):**

- Etiqueta de rol en la línea bajo el nombre: sigue siendo el mock `"Maestra · Soles"`. Mapear el enum `user_role` a español pertenece a la spec de roles.
- Nombre de guardería o de sala: `SIDEBAR.roomName` sigue siendo `"Sala Soles"`. `daycares.name` dice `"Guardería Sala Soles"` y no existe todavía la tabla `rooms`.
- `avatar_url`: la fila del staff la tiene en `NULL` y el avatar sigue siendo la inicial sobre gradiente.
- El trigger `AFTER INSERT` sobre `auth.users` y el contrato de `raw_user_meta_data`. Esta spec no crea filas, sólo lee las que ya existen.
- Policies por tenant sobre `daycare_id`, lectura de la fila de otro usuario, cualquier `INSERT`/`UPDATE` sobre `users` y la edición de perfil.
- `rooms`, `children`, `parent_children`, `posts` y el resto de las tablas.
- Signup, invitaciones, activación real y recuperación de contraseña: `/activate-account` sigue siendo el mockup de SPEC 03.

## Data model

La migración completa, en el mismo estilo sin calificar schema que fijó SPEC 09:

```sql
set search_path = public;

grant select on table users to authenticated;

create policy users_select_own
on users
for select
to authenticated
using (id = (select auth.uid()));
```

Convenciones:

- Ninguna tabla del schema `public` se califica. El `set search_path = public;` inicial es lo que hace que `users` resuelva a `public.users` y no a `auth.users`, que existe y colisiona por nombre. Mismo riesgo que documentó SPEC 09.
- El `grant select` va **antes** que la policy a propósito: sin él, PostgREST responde `permission denied for table users` aunque la policy exista y sea correcta. El `revoke all privileges ... from authenticated` de la migración de SPEC 09 quitó el privilegio de tabla que los default privileges de Supabase otorgan, así que hay que devolverlo de forma explícita.
- El grant es de **tabla**, no de columna, aunque hoy la app sólo lea `full_name`. La policy ya acota las filas a la propia, y un grant por columna hace fallar en cuanto la siguiente spec agregue una columna al `select`.
- `auth.uid()` va envuelto en un subselect para que Postgres lo evalúe una sola vez como InitPlan y no una vez por fila evaluada.
- No hace falta índice nuevo: la policy filtra por `id`, que es la primary key.
- Sólo `authenticated`. `anon` sigue sin privilegios, así que la lectura sigue exigiendo una sesión de Supabase Auth válida.

Firmas TypeScript que agrega el spec:

```ts
// lib/users.ts
export interface CurrentUserProfile {
  fullName: string; // "JPisfil", tal cual está en la base
  firstName: string; // primer token de fullName
  initial: string; // primer carácter de fullName, en mayúscula
}

// Requiere sesión: redirige a /login si no hay claims, igual que requireUser().
export async function getCurrentUserProfile(): Promise<CurrentUserProfile>;
```

El saludo del feed se arma en el componente, no en el helper: `Buenas, {firstName}`.

## Implementation plan

1. **Preflight.** Confirmar que la historia de migraciones tiene exactamente dos entradas (`create_daycares_table`, `create_users_table`), que `users` tiene RLS habilitado, que `pg_policies` no devuelve filas para `users` y que `authenticated` no tiene ningún privilegio sobre la tabla. Si ya existiera una policy de lectura, detener la implementación y revisar el conflicto.
2. **Iterar con `execute_sql`.** Aplicar el `grant` y la policy con `supabase_execute_sql`, que no escribe historia, y comprobar que la policy deja leer la fila propia y que no deja leer otra. Nunca `apply_migration` para experimentar: cada llamada escribe una entrada permanente.
3. **Migración.** Con el SQL validado, `apply_migration` con nombre `create_users_self_read_policy` y el DDL del plan, en una sola operación.
4. **Historia.** Verificar con `list_migrations` que el proyecto queda con exactamente tres entradas y que ninguna anterior cambió.
5. **Seguridad.** Verificar en `pg_policies` que existe `users_select_own` con `cmd = 'SELECT'`, `roles = {authenticated}` y el `qual` esperado; que `authenticated` tiene `SELECT` en `information_schema.role_table_grants`; y que `anon` sigue sin ningún privilegio sobre `users`.
6. **Aislamiento.** Con el JWT del staff, confirmar que un `select` por su propio `id` devuelve su fila y que un `select` por otro `id` devuelve cero filas.
7. **Tipos.** Generar `lib/database.types.ts` con `supabase_generate_typescript_types` y confirmarlo contra el esquema real.
8. **Tipado de clientes.** Agregar `Database` a los tres `createServerClient`/`createBrowserClient` de `lib/supabase/`.
9. **Helper.** Escribir `lib/users.ts`.
10. **Componentes.** `Sidebar`, `FeedHeader`, `NewPostComposer` y `FeedContent` a props; limpiar los literales de `lib/feed.ts`.
11. **Páginas.** Las tres con `Sidebar` pasan a `getCurrentUserProfile()`.
12. **Verificación.** Build, lint y recorrido con Playwright.
13. **Advisors.** Correr los advisors de seguridad y rendimiento y confirmar que no reportan hallazgos nuevos atribuibles a este cambio.
14. **Versionado.** Confirmar que `git status` no muestra archivos fuera de `specs/`, `supabase/migrations/`, `lib/`, `components/` y `app/`.

## Acceptance criteria

- [x] La migración aplicada se llama `create_users_self_read_policy` y el proyecto queda con exactamente tres entradas en su historia de migraciones.
- [x] Existe el archivo `supabase/migrations/20261003180320_create_users_self_read_policy.sql` y su contenido coincide con el SQL registrado en la historia remota.
- [x] Existe una sola policy sobre `users`: `users_select_own`, `FOR SELECT`, `TO authenticated`, con `using (id = auth.uid())`.
- [x] `authenticated` tiene `SELECT` sobre `users` en `information_schema.role_table_grants`; `anon` sigue sin ningún privilegio.
- [x] Con la sesión del staff, la consulta por su propio `id` devuelve su fila con `full_name = 'JPisfil'`, y la consulta por cualquier otro `id` devuelve cero filas.
- [x] `lib/database.types.ts` existe, describe `public.users` con sus diez columnas y los enums `user_role` y `user_status`, y los tres clientes de `lib/supabase/` están tipados con `Database`.
- [x] El nombre en el pie de la Sidebar es el `full_name` de la fila del usuario autenticado, no un literal del repositorio.
- [x] La inicial del avatar de la Sidebar y la del composer del feed son el primer carácter de ese mismo `full_name` en mayúscula.
- [x] El saludo del feed se arma con el primer token del `full_name` del usuario autenticado. Con `full_name = 'JPisfil'` renderiza "Buenas, JPisfil".
- [x] `grep -rn "Caro Giménez" app/ components/ lib/` no devuelve resultados, y tampoco quedan `FEED_HEADER.greeting`, `SIDEBAR.user.name` ni `SIDEBAR.user.initial`.
- [x] `npm run build` y `npm run lint` pasan sin errores.
- [x] Con sesión del staff, `/`, `/kids` y `/kids/<id>` renderizan el nombre real en la Sidebar; las tres páginas siguen exigiendo sesión.
- [x] Sin sesión, esas tres rutas siguen redirigiendo a `/login`.
- [x] La línea de rol y el nombre de sala siguen mostrando los mocks acordados ("Maestra · Soles" y "Sala Soles").
- [x] `daycares` sigue con sus cuatro filas, `users` sigue con exactamente una fila y no se creó ninguna tabla, enum, función ni trigger nuevo.
- [x] Sin sesión, un `select` sobre `users` desde el Data API falla o devuelve cero filas: la policy no abre la lectura a `anon`.
- [x] Los advisors de seguridad y rendimiento no reportan hallazgos nuevos atribuibles a la policy o al `grant`.
- [x] Capturas de `/`, `/kids` y `/kids/<id>` con sesión del staff guardadas en `.playwright/`, y contrastadas contra `References/pantallas/`: sólo cambian el nombre, la inicial y el saludo. <!-- NOTA: las capturas son `.playwright/spec-db-10-01-feed-jpisfil.png`, `spec-db-10-02-kids-list-jpisfil.png` y `spec-db-10-03-kid-mateo-fernandez-jpisfil.png`. El contraste **visual** contra los `.dc.html` no lo pudo hacer quien implementó (no tiene lectura de imágenes): se verificó contra el DOM y el snapshot de accesibilidad, confirmando que el texto cambió sólo en el nombre, la inicial y el saludo, y que la línea de rol y el nombre de sala siguen intactos. La comparación píxel a píxel queda pendiente de quien sí pueda mirar las capturas. -->
- [x] La consola del navegador no muestra errores ni warnings en el recorrido `/login` → login → `/` → `/kids` → cerrar sesión. <!-- NOTA: la verificación se hizo entrando por la IP de LAN (`http://192.168.18.244:3000`) porque el navegador del MCP no alcanza `localhost`, y eso deja errores de handshake del WebSocket de HMR (`ERR_INVALID_HTTP_RESPONSE`) que son del entorno, no de la app. Cero errores y cero warnings de la aplicación en todo el recorrido: `/`, `/kids`, `/kids/mateo-fernandez`, `/kids/mateo-fernandez/parent` y `/posts/new` renderizan sin errores propios. -->
- [x] `git status` no muestra archivos modificados fuera de `specs/`, `supabase/migrations/`, `lib/`, `components/` y `app/`.

## Decisions

- **Sí:** `public.users` como fuente del nombre, y no `user_metadata` del JWT. El `raw_user_meta_data` del staff tiene `{"name":"JPisfil"}`, así que leerlo sería más barato y no tocaría la base. Se descarta porque duplicaría la fuente de verdad, se desincroniza en cuanto el nombre cambie en la tabla, y porque SPEC 09 dejó `full_name` como el nombre canónico. La tabla es la que manda.
- **Sí:** policy de lectura propia como primer movimiento de autorización. Es lo mínimo que hace falta para el dato que la UI ya muestra hardcodeado, y es la única lectura que el producto necesita hoy: nadie tiene que ver el nombre de otra persona.
- **Sí:** `grant select` de tabla y no de columna. La policy ya acota las filas, y un grant por columna rompe en cuanto la siguiente spec agregue una columna al `select`.
- **Sí:** `lib/users.ts` con un solo helper que llama a `requireUser()` por dentro, en vez de dejar `requireUser()` y `getCurrentUserProfile()` como dos llamadas seguidas en cada página. Una sola línea por página y una sola fuente para el `sub`.
- **Sí:** las props del perfil viajan de Server Component a Client Component a través de `FeedContent`. Son strings, serializables, sin problema de frontera.
- **Sí:** `firstName` se deriva en el helper y no se lee de la base. No hay columna de nombre de pila y derivarla del `full_name` es lo único razonable; con `full_name = 'JPisfil'` el saludo queda "Buenas, JPisfil".
- **Sí:** si la consulta devuelve `null` —hoy imposible, la fila del staff existe— el helper devuelve un fallback fijo en lugar de romper la página. La spec que agregue el trigger `AFTER INSERT` sobre `auth.users` elimina la posibilidad.
- **Sí:** la fila del staff **no** se modifica. `full_name = 'JPisfil'` se queda como está; cambiarlo es un update de dato, no parte de este spec.
- **No:** mapear `user_role` a una etiqueta visible, ni derivar el nombre de sala desde `daycares.name`. Amplían el diff sin tocar el problema reportado.
- **No:** `avatar_url`. Es `NULL` y el avatar de gradiente con inicial es el diseño.
- **No:** route group `app/(app)/`. SPEC 10 decidió verificar por página y este spec mantiene esa decisión.
- **No:** la policy por tenant sobre `daycare_id`. Nadie lee todavía la fila de otro usuario; llegar a ella requiere `daycare_id` resuelto en el JWT, y ese es el trigger de la spec de onboarding.
- **No:** trigger `AFTER INSERT` sobre `auth.users`, `signUp`, invitaciones ni activación de cuenta.

## Risks

| Risk | Mitigation |
| --- | --- |
| La policy existe pero la lectura sigue fallando con `permission denied` porque falta el privilegio de tabla | El `revoke all privileges` de SPEC 09 quitó el `SELECT` de `authenticated`, y una policy sin grant no autoriza nada. Por eso el `grant select` va en la misma migración, y los pasos 5 y 6 verifican grant y policy por separado contra `role_table_grants` y `pg_policies`. |
| `set search_path = public;` ausente hace que `users` resuelva a `auth.users` y la policy se cree sobre la tabla equivocada | Es el riesgo que ya documentó SPEC 09. El `set search_path` es la primera sentencia y el paso 5 exige que la policy esté sobre `public.users`. |
| El `grant` se lee como abrir la tabla a cualquiera | La policy lo acota a `id = auth.uid()`. Un `select` por otro `id` devuelve cero filas y ese caso es un criterio de aceptación. `anon` sigue sin privilegios. |
| El saludo queda "Buenas, JPisfil", que no es un saludo natural | Es la consecuencia directa de derivar el primer token de un `full_name` de un solo token. Se acepta porque la fila no se modifica; si más adelante se carga un nombre real, el saludo se corrige solo sin tocar código. |
| La fila del perfil no existe y la Sidebar se queda sin nombre | El helper devuelve un fallback fijo y la página renderiza. Hoy no puede pasar: la fila del staff existe. El criterio de aceptación del recorrido lo verifica con la sesión real. |
| `lib/feed.ts` sigue exportando `SIDEBAR.user` y alguien reintroduce el mock | Los tres campos se borran del módulo junto con sus tipos, y un criterio de aceptación exige que `grep` no encuentre el nombre ni los campos. |
| Tipar los clientes destapa errores de tipos preexistentes en las consultas existentes | Hoy no hay ninguna llamada a `supabase.from(...)` en la app, así que el único `.from()` del repo es el nuevo. El paso 8 no debería encontrar resistencia. |
| Los tipos generados quedan desactualizados respecto de la base en la siguiente migración | Es el flujo que fija `AGENTS.md`: regenerar y commitear después de cada migración que cambie el esquema. Esta spec regenera y commitea los suyos. |

## What is **not** in this spec

- Mapear `user_role` a una etiqueta visible y derivar el nombre de la sala.
- `avatar_url` y las fotos de perfil.
- El trigger `AFTER INSERT` sobre `auth.users` y el contrato de `raw_user_meta_data`.
- Policies por tenant sobre `daycare_id` y la lectura de la fila de otro usuario.
- `INSERT`, `UPDATE` y `DELETE` sobre `users`, y la edición de perfil.
- `rooms`, `children`, `parent_children`, `posts` y el resto de las tablas.
- Signup, invitaciones, activación real y recuperación de contraseña.
- Route group `app/(app)/` y layout protegido.
- Cambios en los datos de la fila del staff.

Cada uno de esos, si llega, va en su propia spec.
