# SPEC 07 — Contrato de datos de guarderías

> **Status:** Aprobado
> **Depends on:** Ninguna
> **Date:** 2026-09-25
> **Objective:** Definir el contrato de datos de la tabla `daycares` —tres columnas con defaults seguros, RLS privado y cuatro guarderías iniciales— para que una spec posterior aplique la migración sin alterar los mocks actuales.

## Scope

**In:**

- Contrato de la tabla `daycares`, nombrada exactamente así y sin cualificar el schema.
- Tres columnas alineadas con `../07-DB-Schema/opendaycare-database-schema.md`: `id`, `name` y `created_at`.
- Defaults seguros: UUID generado para `id`, nombre obligatorio y no vacío, y timestamp con zona horaria generado por defecto.
- Baseline de seguridad para la futura migración: RLS habilitado, sin policies y sin privilegios para `anon` o `authenticated`.
- Contrato de cuatro guarderías iniciales: `Guardería Sala Soles`, `Guardería Estrellitas`, `Guardería Gigantes` y `Guardería Arcoíris`.
- Handoff explícito para una spec posterior, que será la responsable de crear y aplicar la migración.

**Out of scope (for future specs):**

- Ejecutar DDL, `INSERT`, `apply_migration`, `db push` o cualquier otra operación sobre Supabase.
- Crear archivos de migración, enlace con Supabase CLI o instalar Supabase CLI.
- Cambiar `lib/kids.ts`, `KIDS`, `ROOMS`, providers, Context, componentes, rutas o pantallas.
- Generar tipos de Supabase o integrar la tabla con la aplicación.
- Crear `users`, políticas RLS, roles, permisos de negocio o relaciones con otras tablas.
- Agregar `updated_at`, índices adicionales o una restricción de unicidad para `name`.
- Implementar el resto del modelo de datos de la referencia.

## Data model

Contrato ilustrativo para la futura migración; esta spec no ejecuta el SQL.

```sql
create table daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint daycares_name_not_blank check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

alter table daycares enable row level security;
revoke all privileges on table daycares from anon, authenticated;
```

Fixtures requeridos por la futura migración:

```sql
insert into daycares (name) values
  ('Guardería Sala Soles'),
  ('Guardería Estrellitas'),
  ('Guardería Gigantes'),
  ('Guardería Arcoíris');
```

Convenciones:

- El nombre de la tabla y de los campos permanece en inglés: `daycares`, `id`, `name` y `created_at`.
- Los valores de `name` preservan los nombres visibles en español del producto.
- Los cuatro UUID se generan mediante `gen_random_uuid()`; esta spec no fija UUIDs estables, incluido el de Sala Soles.
- `created_at` usa `timestamptz` y se genera con `now()`.
- `name` no puede ser `NULL` ni contener únicamente espacios.
- RLS queda habilitado sin policies. `anon` y `authenticated` no reciben privilegios sobre la tabla.
- No se agrega `updated_at` porque la fila de `daycares` en la referencia solo define `created_at`.
- No se declara `UNIQUE (name)` porque la referencia no define unicidad para este campo.

## Implementation plan

1. **Contrato de estructura.** Mantener en esta spec la definición exacta de `daycares`, sus tres columnas, tipos, nullability, defaults y restricciones. No modificar archivos de runtime.
2. **Contrato de seguridad y datos.** Registrar RLS sin policies, la ausencia de acceso para `anon`/`authenticated` y las cuatro filas requeridas. No crear DDL, DML ni migración en esta spec.
3. **Handoff.** Una spec posterior debe declarar dependencia de SPEC 07, implementar la tabla y sus fixtures en una misma migración y verificar el resultado antes de reemplazar cualquier mock.

## Acceptance criteria

- [ ] La especificación usa exclusivamente `daycares` como nombre de la tabla y no antepone un schema.
- [ ] El contrato define exactamente `id uuid`, `name text` y `created_at timestamptz`, sin `updated_at`.
- [ ] `id` es PK con default `gen_random_uuid()`.
- [ ] `name` es `NOT NULL` y no admite valores formados únicamente por espacios.
- [ ] `created_at` es `NOT NULL` y tiene default `now()`.
- [ ] La futura migración debe habilitar RLS, crear cero policies y revocar privilegios de `anon` y `authenticated`.
- [ ] La futura migración debe insertar exactamente `Guardería Sala Soles`, `Guardería Estrellitas`, `Guardería Gigantes` y `Guardería Arcoíris`.
- [ ] La futura migración debe generar los cuatro UUID y no asumir un UUID fijo para Sala Soles.
- [ ] Ningún archivo de aplicación, mock, provider, componente o ruta cambia como parte de esta spec.
- [ ] No se crea ningún archivo de migración y no se realiza ninguna operación sobre la base remota.
- [ ] La spec de migración posterior queda identificada como dependiente de SPEC 07.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

## Decisions

- **Yes:** SPEC 07 es un contrato de datos sin implementación ejecutable. La migración se diseña y aplica en otra spec.
- **Yes:** la tabla se llama `daycares`, sin anteponer un schema.
- **Yes:** los mocks y el estado en memoria de la aplicación permanecen intactos. La base de datos no reemplaza `KIDS` en esta etapa.
- **Yes:** se conserva la referencia de la tabla `daycares`: `id`, `name` y `created_at`.
- **Yes:** los defaults y constraints quedan fijados para que la futura migración no introduzca supuestos nuevos.
- **Yes:** RLS queda habilitado desde la primera migración, pero sin policies porque todavía no existe `users` para aislar guarderías por tenant.
- **Yes:** la futura migración crea la tabla e inserta las cuatro guarderías en una misma operación versionada.
- **Yes:** Sala Soles es un fixture de desarrollo requerido, no una guardería principal ni un UUID reservado.
- **No:** `updated_at`, trigger de modificación, `UNIQUE (name)` u otros índices. No aparecen en el contrato de referencia acordado.
- **No:** migración remota o local, Supabase CLI, tipos generados, acceso desde la app o policies en este spec.

## Risks

| Risk | Mitigation |
| --- | --- |
| Los mocks y el futuro modelo Supabase pueden divergir | La spec de migración debe declarar dependencia de SPEC 07 y validar el mapeo antes de reemplazar cualquier mock. |
| RLS sin policies deja la tabla inutilizable desde la app | Aceptado por diseño: el acceso se habilitará cuando exista `users` y exista un spec de autorización tenant. |
| La ausencia de `UNIQUE (name)` permite duplicados | Aceptado porque la referencia no define unicidad; agregar una restricción solo cuando exista una regla de negocio explícita. |
| Los fixtures pueden interpretarse como guarderías reales | Mantenerlos identificados como datos de desarrollo y no derivar comportamiento especial de Sala Soles. |

## What is **not** in this spec

- DDL, DML o cualquier cambio en Supabase.
- Archivos de migración, Supabase CLI o instalación de dependencias.
- Cambios en mocks, componentes, rutas, providers, tipos o estilos.
- Policies RLS, usuarios, roles o autorización por tenant.
- `updated_at`, unicidad, índices o relaciones con otras tablas.
- El resto de las tablas y enums del esquema de referencia.

Cada uno de esos, si llega, va en su propia spec.
