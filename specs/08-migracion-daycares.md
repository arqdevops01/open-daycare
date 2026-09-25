# SPEC 08 — Migración de la tabla `daycares`

> **Status:** Implementado
> **Depends on:** SPEC 07
> **Date:** 2026-09-25
> **Objective:** Crear y poblar la tabla `daycares` en el proyecto Supabase aplicando el contrato fijado por SPEC 07 en una única migración versionada.

## Scope

**In:**

- Una única migración versionada, aplicada contra el proyecto Supabase remoto mediante `apply_migration` del servidor MCP.
- Un archivo de migración versionado en el repositorio, en `supabase/migrations/20260925140421_create_daycares_table.sql`, con el mismo SQL aplicado en el remoto.
- El DDL exacto de `daycares` tal como lo fijó SPEC 07: `id uuid`, `name text`, `created_at timestamptz`.
- RLS habilitado, cero policies y revocación de privilegios para `anon` y `authenticated`.
- Inserción de las cuatro guarderías de SPEC 07 con UUIDs generados por `gen_random_uuid()`.
- Verificación posterior: historia de migración, estructura de columnas, RLS, ausencia de policies, ausencia de privilegios y contenido de la tabla.
- Verificación de que el archivo versionado coincide con el SQL registrado en la historia remota.
- Revisión de advisors de seguridad y rendimiento tras aplicar.

**Out of scope (for future specs):**

- Reemplazar `KIDS`, `ROOMS`, providers o cualquier mock en memoria por lecturas reales.
- Generar tipos de TypeScript con `supabase generate types` o integrar un cliente de Supabase en la app.
- Crear `users`, `rooms`, `children` o cualquier otra tabla del esquema de referencia.
- Escribir policies RLS, autorización por tenant, roles o permisos de negocio.
- Instalar Supabase CLI, ejecutar `supabase init`, `supabase link` o `db push`.
- Agregar `updated_at`, índices, triggers o `UNIQUE (name)`.
- Habilitar el acceso de la app a la tabla. RLS sin policies la deja inutilizable desde el cliente, y es el comportamiento acordado en SPEC 07.

## Data model

Esta spec no introduce estructuras nuevas: materializa en la base el contrato que SPEC 07 ya fijó. El SQL es idéntico al registrado en SPEC 07 y se envía íntegro, en este orden, dentro de la misma migración.

```sql
create table daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint daycares_name_not_blank check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

alter table daycares enable row level security;
revoke all privileges on table daycares from anon, authenticated;

insert into daycares (name) values
  ('Guardería Sala Soles'),
  ('Guardería Estrellitas'),
  ('Guardería Gigantes'),
  ('Guardería Arcoíris');
```

El mismo SQL, sin reescribir ni reordenar, se versiona en el repositorio como `supabase/migrations/20260925140421_create_daycares_table.sql`. El nombre de archivo deriva de la versión y el nombre registrados en `supabase_migrations.schema_migrations`, de modo que el archivo y la historia remota son el mismo hecho visto de dos maneras.

Convenciones heredadas de SPEC 07:

- La tabla se llama `daycares` y no se antepone ningún schema, por lo que resuelve a `public`.
- Los nombres de tabla y columnas quedan en inglés; los valores de `name` en español.
- `id` se genera con `gen_random_uuid()`. No se fija ningún UUID, incluido el de Sala Soles.
- `created_at` es `timestamptz` con default `now()`.
- No existe `updated_at` ni `UNIQUE (name)`.
- La migración no declara `id` en el `insert`: los cuatro UUID los produce el default.

## Implementation plan

1. Confirmar el estado inicial del proyecto: cero migraciones aplicadas y cero tablas en `public`. Si ya existiera una tabla `daycares`, detener la implementación y revisar el conflicto con el usuario.
2. Ejecutar `apply_migration` con nombre `create_daycares_table` y el SQL completo del plan. Una sola llamada: tabla, RLS, revocación y fixtures van en la misma operación versionada.
3. Verificar la historia de migración: la entrada `create_daycares_table` aparece aplicada y es la única.
4. Verificar la estructura: `daycares` existe en `public` con exactamente tres columnas, sus tipos, nullability y defaults, y el constraint `daycares_name_not_blank` presente.
5. Verificar la seguridad: RLS habilitado, cero rows en `pg_policies` para `daycares`, y sin privilegios de `anon` ni `authenticated` en la tabla.
6. Verificar los datos: la tabla contiene exactamente cuatro filas, con nombres que coinciden carácter a carácter con los cuatro fixtures, UUIDs distintos y `created_at` no nulo.
7. Correr los advisors de seguridad y de rendimiento y confirmar que no reportan hallazgos nuevos atribuibles a `daycares`.
8. Confirmar que el árbol de trabajo del repositorio no cambió: `git status` sigue mostrando únicamente los archivos de specs.
9. Versionar el SQL aplicado en `supabase/migrations/20260925140421_create_daycares_table.sql`, tomado literalmente de la entrada `create_daycares_table` en `supabase_migrations.schema_migrations`, y verificar que `git status` sólo muestra ese archivo nuevo además de los specs.

## Acceptance criteria

- [ ] La migración aplicada se llama `create_daycares_table` y el proyecto queda con exactamente una entrada en su historia de migraciones.
- [ ] La tabla se llama `daycares`, resuelve a `public` y no está calificada con ningún schema en el SQL.
- [ ] `daycares` tiene exactamente tres columnas: `id`, `name` y `created_at`. No existe `updated_at`.
- [ ] `id` es `uuid`, primary key, `not null`, con default `gen_random_uuid()`.
- [ ] `name` es `text`, `not null`, y tiene el constraint `daycares_name_not_blank` que rechaza valores formados solo por espacios.
- [ ] `created_at` es `timestamptz`, `not null`, con default `now()`.
- [ ] RLS está habilitado en `daycares` (`pg_class.relrowsecurity = true`).
- [ ] `pg_policies` devuelve cero filas para `daycares`.
- [ ] Ni `anon` ni `authenticated` tienen ningún privilegio sobre `daycares` en `information_schema.role_table_grants`.
- [ ] La tabla contiene exactamente cuatro filas.
- [ ] Los cuatro `name` son `Guardería Sala Soles`, `Guardería Estrellitas`, `Guardería Gigantes` y `Guardería Arcoíris`, con la acentuación exacta.
- [ ] Los cuatro `id` son UUID distintos y ninguno viene de un valor fijo: los generó el default.
- [ ] Los cuatro `created_at` son no nulos.
- [ ] Los advisors de seguridad y rendimiento no reportan hallazgos nuevos sobre `daycares`.
- [ ] `git status` no muestra ningún archivo nuevo o modificado fuera de `specs/` y `supabase/migrations/`. El único archivo SQL versionado es `supabase/migrations/20260925140421_create_daycares_table.sql`.
- [ ] El contenido del archivo versionado coincide con el SQL registrado en `supabase_migrations.schema_migrations` para `create_daycares_table`.
- [ ] `lib/kids.ts`, `KIDS`, `ROOMS`, providers, Context, componentes y rutas quedan sin cambios.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** aplicar con `apply_migration` del servidor MCP. El proyecto no tiene `supabase/` inicializado, no hay Supabase CLI instalado y sólo existe `SUPABASE_DB_PASSWORD` en el entorno, así que el flujo de la CLI agregaría instalación, `init` y `link` sin beneficio para una única migración.
- **Sí:** versionar un archivo `.sql` en el repositorio, en `supabase/migrations/`. Revisión posterior: se mantiene la fuente de verdad en este spec, pero además se deja un respaldo local comparable contra la historia remota, que se regenera con `supabase db pull` cuando la CLI esté disponible. El riesgo de desincronización pasa a estar cubierto por el paso 9 del plan, que compara el archivo contra `supabase_migrations.schema_migrations`.
- **No:** `supabase init` ni `supabase/config.toml`. La carpeta `supabase/migrations/` se crea a mano con el único archivo de esta spec. Quien corra `supabase init` o `supabase db push` más adelante debe verificar que no intente re-aplicar la versión `20260925140421`, que ya está registrada en la historia remota.
- **Sí:** aplicar contra el proyecto remoto directamente. Es la primera migración de un proyecto sin tablas ni datos, y una dev branch agregaría costo y pasos sin proteger nada.
- **No:** iterar el SQL con `execute_sql` antes de aplicar. El SQL está determinista y completo en SPEC 07; iterar sobre el remoto dejaría estado sin historia de migración.
- **No:** Supabase CLI, `supabase init`, `supabase link` o `db push`. Sólo se versiona el archivo de la migración ya aplicada.
- **Sí:** tabla, RLS, revocación y fixtures en una misma migración, como exige SPEC 07.
- **Sí:** RLS habilitado y cero policies. Se acepta que la tabla quede ilegible desde el cliente: es el diseño acordado en SPEC 07 hasta que exista `users` y un spec de autorización por tenant.
- **No:** policies RLS de ningún tipo en esta spec.
- **No:** conceder privilegios a `service_role` ni a otros roles. `service_role` ya tiene `bypassrls` y no necesita ningún `grant`.
- **No:** `GRANT` explícito a `anon` o `authenticated`. La revocación posterior a la creación basta y evita exponer la tabla.
- **Sí:** conservar el `revoke` aunque la tabla se cree en la misma migración. Los privilegios por defecto de Supabase en `public` se aplican en el momento del `create table`, así que la revocación debe ir explícita.
- **No:** tipos generados, cliente de Supabase en la app, ni reemplazo de `KIDS`/`ROOMS`. Los mocks siguen siendo la fuente de verdad de la UI.
- **No:** `updated_at`, índices, triggers, `UNIQUE (name)` ni relaciones con otras tablas.
- **No:** el resto del modelo de datos de la referencia. Cada tabla en su propia spec.

## Risks

| Risk | Mitigation |
| --- | --- |
| El SQL se aplica con un error y queda historia de migración que no se puede revertir limpiamente | El SQL es determinista y corto, y se Copia literalmente del contrato de SPEC 07 sin improvisar. Ante un fallo, detenerse y consultar al usuario antes de reintentar. |
| Los `default privileges` de Supabase conceden acceso a `anon`/`authenticated` y la tabla queda expuesta por el Data API | El `revoke` explícito viaja en la misma migración y el paso 5 lo verifica contra `information_schema.role_table_grants`. |
| Un advisor reporta RLS habilitado sin policies como un problema | Se acepta: es el estado deseado según SPEC 07. Cualquier hallazgo se documenta, no se "corrige" agregando policies. |
| Los fixtures se interpretan como guarderías reales de producción | `Guardería Sala Soles` es el único nombre que la app ya muestra, y sigue siendo un dato de desarrollo. No se deriva comportamiento especial de ninguna fila. |
| El archivo `.sql` versionado se desincroniza del SQL realmente aplicado en la historia remota | El nombre del archivo deriva de la versión y el nombre de la entrada de `supabase_migrations.schema_migrations`, y el paso 9 compara el contenido del archivo contra esa misma entrada. `supabase db pull` regenera el archivo cuando la CLI esté disponible. |
| El proyecto remoto queda con una tabla inaccesible para la app y alguien asume que es un bug | La app no consume la tabla en esta etapa. Cualquier lectura real va en una spec posterior con policies. |

## What is **not** in this spec

- Conectar la app a Supabase, generar tipos o reemplazar `KIDS` y `ROOMS`.
- Policies RLS, `users`, roles o autorización por tenant.
- `rooms`, `children` y el resto de las tablas del esquema de referencia.
- `updated_at`, índices, triggers, `UNIQUE (name)` o relaciones.
- Supabase CLI, `supabase init`, `supabase link` o `db push`.
- Habilitar acceso a la tabla desde el cliente.

Cada uno de esos, si llega, va en su propia spec.
