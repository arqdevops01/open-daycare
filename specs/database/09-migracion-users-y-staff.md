# SPEC 09 — Migración de la tabla `users` y usuario staff

> **Status:** Aprobado
> **Depends on:** SPEC 08
> **Handoff:** Una spec de auth podrá leer `users` por `auth.uid()`, crear el trigger `AFTER INSERT` sobre `auth.users` y escribir las policies RLS por tenant que hoy faltan.
> **Date:** 2026-09-25
> **Objective:** Crear los enums `user_role` y `user_status` junto con la tabla `users` y un único usuario staff de prueba en Guardería Sala Soles, aplicando todo el DDL en una sola migración versionada y dejando la tabla sin policies RLS.

## Scope

**In:**

- Una única migración versionada, aplicada contra el proyecto Supabase remoto con `apply_migration` del servidor MCP, llamada `create_users_table`.
- Los dos enums que la tabla necesita: `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`).
- La tabla `users` con las diez columnas de la referencia: `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at` y `updated_at`.
- `id` como PK y FK a `auth.users(id)` `ON DELETE CASCADE`: un usuario de Supabase Auth es un usuario de la app, y al borrarse la cuenta de Auth desaparece el perfil.
- `daycare_id` como FK a `daycares`: muchos usuarios por guardería, una guardería por usuario.
- Una función trigger reutilizable `set_updated_at()` en `public` más el trigger `BEFORE UPDATE` sobre `users`.
- Índice en `users (daycare_id)`, la columna por la que filtrará toda policy de tenant futura.
- RLS habilitado, cero policies y revocación de privilegios de `anon` y `authenticated` sobre la tabla y sobre la función.
- Un único usuario staff real de prueba, creado con `execute_sql` (fuera de la historia de migraciones) con su usuario de `auth.users` verificado, su identidad de email y su fila en `public.users` apuntando a Guardería Sala Soles.
- Verificación posterior: historia de migración, enums, estructura, trigger, seguridad, fila del staff, advisors y sincronía del archivo versionado.

**Out of scope (for future specs):**

- `invitations`, `rooms`, `children`, `parent_children` y el resto de las tablas de la referencia. No se toca nada del flujo de invitaciones.
- El trigger `AFTER INSERT` sobre `auth.users` que autogenera la fila de perfil, y el contrato de `raw_user_meta_data` que lo alimenta.
- Cualquier policy RLS, autorización por tenant, roles de negocio o permisos.
- `supabase-js`, `@supabase/ssr`, cliente en la app, tipos generados de TypeScript o reemplazo de `KIDS`/`ROOMS` y los demás mocks.
- Login, sesiones, recuperación de contraseña o verificación de credenciales desde la app: `/login` y `/activate-account` siguen siendo mockups navigables.
- Usuarios `parent` o filas con `status = 'pending'`: no hay invitaciones que los produzca.
- Supabase CLI, `supabase init`, `supabase link` o `db push`.
- Un segundo staff, o un staff por guardería.

## Data model

DDL exacto de la migración `create_users_table`, en el mismo estilo sin calificar schema que fijó SPEC 08:

```sql
set search_path = public;

create type user_role as enum ('staff', 'parent', 'admin');
create type user_status as enum ('pending', 'active');

create function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  daycare_id uuid not null references daycares (id),
  role user_role not null,
  status user_status not null default 'active',
  full_name text not null constraint users_full_name_not_blank check (btrim(full_name) <> ''),
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_daycare_id_idx on users (daycare_id);

create trigger users_set_updated_at
before update on users
for each row
execute function set_updated_at();

alter table users enable row level security;
revoke all privileges on table users from anon, authenticated;
revoke all on function set_updated_at() from anon, authenticated;
```

Convenciones:

- Los nombres de objetos y columnas van en inglés; el único valor en español es el `full_name` de prueba y el nombre de la guardería destino.
- Ninguna tabla del schema `public` se califica en el SQL. El `set search_path = public;` inicial es lo que garantiza que `users` resuelva a `public.users` y no a `auth.users`, que existe y colisiona por nombre.
- `id` no se genera con `gen_random_uuid()`: lo aporta Supabase Auth. La PK es la identidad de la cuenta.
- `role` es `not null` y sin default: el rol se declara siempre explícitamente. `status` sí lleva default `'active'`, como dice la referencia.
- `full_name` no admite valores formados sólo por espacios, igual que `daycares.name` en SPEC 08.
- `avatar_url` es la única columna de texto nullable: la foto es opcional.
- `set_updated_at()` es reutilizable: las próximas tablas con `updated_at` la reutilizan en lugar de duplicar la función.
- No se declara `email` ni `password_hash`: los gestiona `auth.users`.

El usuario staff se crea con `execute_sql`, en un único bloque transaccional e idempotente, con la contraseña provista por quien ejecuta el spec y no tomada del repositorio:

```sql
do $$
declare
  v_user_id uuid;
  v_email constant text := 'jpisfil@netcloudsensei.com';
  v_daycare_id uuid;
begin
  select id into v_daycare_id from daycares where name = 'Guardería Sala Soles';
  if v_daycare_id is null then
    raise exception 'Guardería Sala Soles no existe';
  end if;

  select id into v_user_id from auth.users where email = v_email;
  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      v_email, crypt('<password>', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"JPisfil"}'::jsonb, now(), now(), ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, email, created_at, updated_at
    ) values (
      v_user_id::text, v_user_id,
      jsonb_build_object('email', v_email, 'email_verified', true,
                         'phone_verified', false, 'sub', v_user_id::text),
      'email', v_email, now(), now()
    );
  end if;

  insert into users (id, daycare_id, role, status, full_name)
  values (v_user_id, v_daycare_id, 'staff', 'active', 'JPisfil')
  on conflict (id) do nothing;
end;
$$;
```

`Guardería Sala Soles` se localiza por nombre, nunca por UUID fijo: SPEC 08 dejó sus UUID generados por el default y no fijó ninguno.

## Implementation plan

1. **Preflight.** Confirmar que la historia de migraciones tiene exactamente una entrada (`20260925140421_create_daycares_table`), que no existen los tipos `user_role`/`user_status` ni la tabla `users`, que `daycares` tiene sus cuatro filas y exactamente una llamada `Guardería Sala Soles`, que `auth.users` está vacía y que `crypt` y `gen_salt` existen. Si `users` ya existiera, detener la implementación y revisar el conflicto con el usuario.
2. **Migración.** Ejecutar `apply_migration` con nombre `create_users_table` y el DDL completo del plan. Una sola llamada: enums, función, tabla, índice, trigger, RLS y revocaciones van en la misma operación versionada.
3. **Historia.** Verificar que `create_users_table` aparece aplicada y que el proyecto queda con exactamente dos entradas.
4. **Enums.** Verificar que `user_role` existe en `public` con exactamente `('staff','parent','admin')` en ese orden y `user_status` con `('pending','active')`.
5. **Estructura.** Verificar que `users` tiene exactamente diez columnas con los tipos, nullability, defaults y check constraint del contrato; que `id` referencia `auth.users(id)` con `ON DELETE CASCADE`; que `daycare_id` referencia `daycares(id)`.
6. **Trigger e índice.** Verificar que existen la función `public.set_updated_at()`, el trigger `users_set_updated_at` `BEFORE UPDATE ... FOR EACH ROW` sobre `users` y el índice `users_daycare_id_idx`.
7. **Seguridad.** Verificar RLS habilitado, cero filas en `pg_policies` para `users`, sin privilegios de `anon`/`authenticated` sobre la tabla y sin privilegio `EXECUTE` de esos roles sobre `set_updated_at()`.
8. **Usuario staff.** Crear la cuenta con `execute_sql` usando el bloque de arriba y la contraseña real. Los tres inserts (cuenta de Auth, identidad de email y perfil) van en la misma transacción, y el paso es idempotente si se vuelve a correr.
9. **Verificación del staff.** Confirmar que `users` tiene exactamente una fila, con `role = 'staff'`, `status = 'active'`, `full_name = 'JPisfil'`, `avatar_url` nulo, `notify_on_post` y `daily_summary_enabled` en `true`, `daycare_id` apuntando a `Guardería Sala Soles`, el mismo `id` que la fila de `auth.users`, `email_confirmed_at` no nulo y una identidad con `provider = 'email'`.
10. **Prueba del trigger.** Ejecutar `update users set updated_at = timestamptz '2000-01-01 00:00:00+00' where id = <id del staff>` y volver a leer la columna: debe haber quedado en `now()`, no en 2000. Esto valida tanto el trigger como que la revocación de `EXECUTE` no lo dejó sin efecto.
11. **Advisors.** Correr los advisors de seguridad y de rendimiento y confirmar que no reportan hallazgos nuevos atribuibles a `users` o a `set_updated_at()`.
12. **Versionado.** Confirmar que `git status` no muestra cambios fuera de `specs/` y `supabase/migrations/`, y versionar el SQL realmente aplicado en `supabase/migrations/<version>_create_users_table.sql`, tomado literalmente de la entrada `create_users_table` de la historia remota. El `<version>` es el que registre `apply_migration`; no se inventa ni se fija de antemano.

## Acceptance criteria

- [ ] La migración aplicada se llama `create_users_table` y el proyecto queda con exactamente dos entradas en su historia de migraciones.
- [ ] Existen `user_role` y `user_status` en `public`, con respectivamente `('staff','parent','admin')` y `('pending','active')`, y ningún otro enum nuevo en el proyecto.
- [ ] La tabla se llama `users`, resuelve a `public` y no está calificada con ningún schema en el SQL.
- [ ] `users` tiene exactamente diez columnas: `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at` y `updated_at`. No existe `email` ni `password_hash`.
- [ ] `id` es `uuid` primary key `NOT NULL`, sin default, con FK a `auth.users(id)` y `ON DELETE CASCADE`.
- [ ] `daycare_id` es `uuid NOT NULL` con FK a `daycares(id)`.
- [ ] `role` es `user_role NOT NULL` y no tiene default.
- [ ] `status` es `user_status NOT NULL` con default `'active'`.
- [ ] `full_name` es `text NOT NULL` con el constraint `users_full_name_not_blank` que rechaza valores formados sólo por espacios.
- [ ] `avatar_url` es `text` y admite `NULL`.
- [ ] `notify_on_post` y `daily_summary_enabled` son `boolean NOT NULL` con default `true`.
- [ ] `created_at` y `updated_at` son `timestamptz NOT NULL` con default `now()`.
- [ ] Existe el índice `users_daycare_id_idx` sobre `users (daycare_id)`.
- [ ] Existe la función `public.set_updated_at()` y el trigger `users_set_updated_at` es `BEFORE UPDATE ... FOR EACH ROW`.
- [ ] Tras un `update` de prueba, `updated_at` vale `now()` y no el valor forzado: el trigger está activo.
- [ ] RLS está habilitado en `users` (`pg_class.relrowsecurity = true`).
- [ ] `pg_policies` devuelve cero filas para `users`.
- [ ] Ni `anon` ni `authenticated` tienen ningún privilegio sobre `users` en `information_schema.role_table_grants`, ni privilegio `EXECUTE` sobre `set_updated_at()` en `information_schema.role_routine_grants`.
- [ ] `auth.users` contiene una fila con el email del staff, `email_confirmed_at` no nulo, `raw_app_meta_data` con `provider = 'email'`, y `auth.identities` tiene la identidad correspondiente con `provider = 'email'`.
- [ ] La contraseña del staff no aparece en ningún archivo versionado del repositorio.
- [ ] `users` contiene exactamente una fila, con el `id` igual al de la cuenta de Auth, `role = 'staff'`, `status = 'active'`, `full_name = 'JPisfil'`, `avatar_url` nulo, `notify_on_post` y `daily_summary_enabled` en `true`, y `daycare_id` apuntando a la guardería `Guardería Sala Soles`.
- [ ] `daycares` sigue teniendo sus cuatro filas y no fue modificada.
- [ ] Los advisors de seguridad y rendimiento no reportan hallazgos nuevos sobre `users` ni sobre `set_updated_at()`.
- [ ] `git status` no muestra archivos nuevos o modificados fuera de `specs/` y `supabase/migrations/`. El único archivo SQL versionado es el de esta migración.
- [ ] El contenido del archivo versionado coincide con el SQL registrado en la historia remota para `create_users_table`.
- [ ] `lib/kids.ts`, `KIDS`, `ROOMS`, providers, Context, componentes, rutas, `/login` y `/activate-account` quedan sin cambios.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** un solo spec que contracta y migra. SPEC 07 fue contrato puro porque no ejecutaba DDL; enums, tabla, trigger y seed forman una unidad y una sola migración.
- **Sí:** sólo `user_role` y `user_status`. Los otros cuatro enums de la referencia llegan con las tablas que los usan.
- **Sí:** un solo spec de migración para `users`; el patrón contrato → migración queda para casos donde el contrato realmente no se aplica.
- **Sí:** `id` como FK a `auth.users(id)` `ON DELETE CASCADE`, sin columna propia. La cuenta de Auth y el perfil de dominio son la misma fila, y no se duplica email ni hash.
- **Sí:** el usuario staff es un usuario real de Supabase Auth, con contraseña verificada e identidad de email, no una fila huérfana en `public.users`. Es la única forma de que el login funcione cuando exista la spec de auth.
- **Sí:** la contraseña se pasa al ejecutar el bloque de `execute_sql` y **no** se versiona. Es una credencial real de una persona, no un dato de desarrollo: queda en el `.sql` de la migración sólo el marcador `<password>`.
- **Sí:** el DDL viaja en la migración versionada; el seed del staff va con `execute_sql`. Así la historia de migraciones queda reproducible sin filtrar la contraseña, y la parte con credenciales es un paso explícito y auditable del spec.
- **Sí:** RLS habilitado y cero policies, igual que `daycares` en SPEC 07/08. La tabla queda inaccesible desde el cliente y eso es lo acordado hasta que exista la spec de autorización por tenant.
- **Sí:** `daycare_id NOT NULL`. La guardería es la raíz del tenant: un usuario sin guardería no pertenece a ningún lado y rompería el aislamiento antes de existir las policies.
- **Sí:** `role NOT NULL` sin default, para que el rol sea siempre una decisión explícita. `status` sí lleva default `'active'` porque la referencia lo define así y el estado previo al signup vive en `invitations`.
- **Sí:** `full_name NOT NULL` con check anti-espacios, alineado con el criterio que SPEC 08 fijó para `daycares.name`.
- **Sí:** función `set_updated_at()` reutilizable en lugar de lógica de trigger por tabla. Las próximas tablas con `updated_at` la reutilizan.
- **Sí:** `revoke` de `EXECUTE` sobre la función para `anon` y `authenticated`. Los default privileges de `public` en este proyecto otorgan `EXECUTE` a ambos roles sobre toda función nueva; el paso 10 verifica que el trigger sigue disparando.
- **Sí:** índice en `users (daycare_id)`. Es la columna por la que toda policy de tenant futura va a filtrar, y una FK sin índice obliga a escanear la tabla en cada borrado o join de guardería.
- **Sí:** la guardería del staff se localiza por nombre y no por UUID fijo, porque SPEC 08 dejó los UUID generados por el default.
- **Sí:** `full_name = 'JPisfil'`, derivado del email y sin inventar datos personales de nadie.
- **No:** el trigger `AFTER INSERT` sobre `auth.users`. Su contrato de `raw_user_meta_data` y el permiso de escritura del rol de Auth pertenecen a la spec de auth, donde la app por fin manda esa metadata.
- **No:** `invitations` ni nada del flujo de invitación, pese a que `user_status.pending` quedaría sin uso por ahora. Un enum puede tener un valor que hoy ninguna fila usa.
- **No:** usuarios `parent`, filas `pending` ni un segundo staff. No hay flujo que los produzca.
- **No:** policies RLS de ningún tipo, ni siquiera una de lectura de la propia fila.
- **No:** tipos de TypeScript generados, `supabase-js`, cliente en la app, ni reemplazo de `KIDS`/`ROOMS`. Consistente con SPEC 08: los mocks siguen siendo la fuente de verdad de la UI.
- **No:** Supabase CLI, `supabase init`, `supabase link` o `db push`. Sólo se versiona el archivo de la migración ya aplicada.
- **No:** el resto del modelo de datos de la referencia. Cada tabla en su propia spec.

## Risks

| Risk | Mitigation |
| --- | --- |
| Un `insert` directo en `auth.users` deja una cuenta que no puede iniciar sesión (falta la fila en `auth.identities`, falta `raw_app_meta_data` con el provider, o el email queda sin confirmar) | Los tres inserts van en la misma transacción que el perfil, con los valores que espera GoTrue, y el paso 9 los verifica uno por uno antes de dar por buena la cuenta. |
| La contraseña del staff queda escrita en un archivo versionado | El DDL viaja en la migración y el seed con `execute_sql`; en el spec sólo aparece el marcador `<password>`. El paso 8 exige la contraseña real y el criterio de aceptación exige que no aparezca en el repo. |
| `create table users` sin schema resuelve a `auth.users`, que ya existe, y la migración falla o crea la tabla en el schema equivocado | El `set search_path = public;` es la primera sentencia de la migración, y el paso 5 comprueba que la tabla está en `public`. |
| El `revoke` de `EXECUTE` sobre `set_updated_at()` deja al trigger sin efecto en un `update` | El paso 10 fuerza un `updated_at` antiguo y verifica que el trigger lo sobrescribe con `now()`. Si fallara, la corrección es una migración correctiva que devuelve el privilegio, no un edit del archivo. |
| Los default privileges de `public` conceden `SELECT`/`INSERT` sobre `users` a `anon`/`authenticated` y la tabla queda expuesta por el Data API | El `revoke` explícito viaja en la misma migración y el paso 7 lo verifica contra `information_schema.role_table_grants`. |
| Un advisor reporta RLS habilitado sin policies, o una función ejecutable, como un problema sobre `users` | Se acepta y se documenta: es el estado acordado por SPEC 07/08. Ningún hallazgo se "corrige" agregando policies en esta spec. |
| El nombre `users` se confunde con `auth.users` al escribir SQL a mano | Toda verificación califica el schema (`public.users`, `auth.users`) y la spec deja explícito que sólo existe una tabla `users`, en `public`. |
| El staff queda siendo el único usuario y cualquier prueba posterior de multi-tenant no tiene con quién compararse | Aceptado: esta spec habilita la tabla, no el aislamiento. Los usuarios de prueba adicionales llegan con la spec de RLS, que es donde el aislamiento se demuestra. |
| La guardería del staff se resuelve por nombre y `daycares.name` no es única | El preflight del paso 1 exige exactamente una fila con ese nombre, y el bloque de seed lanza excepción si no la encuentra. |

## What is **not** in this spec

- `invitations`, `rooms`, `children`, `parent_children`, `posts` y el resto de las tablas de la referencia.
- El trigger `AFTER INSERT` sobre `auth.users` y el contrato de `raw_user_meta_data`.
- Policies RLS, autorización por tenant, roles de negocio y permisos.
- Login, sesiones, recuperación de contraseña y el contrato de `/login` y `/activate-account`.
- `supabase-js`, `@supabase/ssr`, tipos generados de TypeScript y el reemplazo de `KIDS`/`ROOMS`.
- Supabase CLI, `supabase init`, `supabase link` o `db push`.
- Usuarios `parent`, filas `pending` y más de un staff.

Cada uno de esos, si llega, va en su propia spec.
