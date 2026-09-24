# SPEC 04 — Agregar niño (con salas Lunas y Estrellas)

> **Status:** Implementado
> **Depends on:** SPEC 02, SPEC 03
> **Date:** 2026-09-24
> **Objective:** Implementar `References/pantallas/agregar-nino.dc.html` como `/kids/new` (card full-screen sin sidebar; alergias y notas médicas opcionales; salas Soles/Lunas/Estrellas) y hacer que «Guardar» agregue el niño a la lista compartida en memoria con React Context, visible en el listado y el perfil durante la sesión.

## Scope

**In:**

- Ruta `/kids/new` (`app/kids/new/page.tsx`): réplica del mockup, card centrada full-screen sobre `bg-canvas`, sin `Sidebar`, con header propio "Cancelar · Agregar niño · Guardar".
- Botón "Agregar niño" de `/kids` pasa de `href="#"` a `Link href="/kids/new"`.
- `components/AddKidForm.tsx` (client): campos NOMBRE COMPLETO (required), FECHA DE NACIMIENTO (required, `dd/mm/aaaa`), SALA (`<select>` nativo estilizado con `ROOMS`, default "Soles"), ALERGIAS (opcional), NOTAS MÉDICAS (opcional, textarea). "Cancelar" → `/kids` sin agregar; "Guardar" (submit) valida, agrega y navega a `/kids`.
- Estado compartido en memoria: `components/KidsProvider.tsx` (React Context, client) montado en `app/layout.tsx`, seed = constante `KIDS` de `lib/kids.ts`, expone `kids` y `addKid`. `KidsList` y el perfil leen del context.
- Perfil funcional en sesión: `components/KidProfileLoader.tsx` (client) recibe `id`, lo busca en el context y renderiza `KidProfile`; si no existe, `notFound()`. `/kids/[id]` mantiene `generateStaticParams` con los 8 ids estáticos; los ids creados en sesión se renderizan on-demand (navegación SPA).
- `lib/kids.ts`: constante `ROOMS = ["Soles", "Lunas", "Estrellas"]` y helper `createKid(input)` que deriva los campos de `Kid`. `ROOMS` solo se consume en el formulario; las demás pantallas no cambian.
- Single source de la búsqueda/count: el listado "SALA SOLES · N niños" usa `kids.length` del context.

**Out of scope (for future specs):**

- Base de datos o persistencia durable (decisión explícita del usuario: la conexión a BD va en otro spec; acá es estado de sesión que se pierde al recargar).
- Edición de un niño: "Editar" del perfil sigue inerte.
- Reflejar Lunas/Estrellas en el feed, la `Sidebar` ("Sala Soles") o las secciones del listado.
- Vinculación de padres: los niños nuevos nacen con `parents: []` (chip VINCULAR del listado).
- Alergias como chips interactivos: el input queda como texto del mockup ("Ej. Maní, Lactosa").
- Responsive móvil propio: réplica del desktop del template.

## Data model

```ts
// lib/kids.ts — adiciones
export const ROOMS = ["Soles", "Lunas", "Estrellas"] as const;
export type Room = (typeof ROOMS)[number];

export interface NewKidInput {
  name: string;          // "Martina López"
  birthDate: string;     // "dd/mm/aaaa" en bruto
  room: Room;            // "Soles" | "Lunas" | "Estrellas"
  allergies?: string;    // "Maní, Lactosa" (opcional)
  medicalNotes?: string; // opcional
}

export function createKid(input: NewKidInput): Kid {
  // id: slug kebab del nombre (si ya existe, se anexa sufijo numérico)
  // initial: primera letra del nombre; avatarClasses: paleta rotada entre las existentes
  // age: años cumplidos calculados desde birthDate; birthDate: "12 mar 2022" (mes en español)
  // admission: mes/año actual ("sep 2026")
  // allergyChip: primer token de allergies en mayúsculas si existe; allergies: texto tal cual
  // medicalNotes: no es campo de Kid actual; se descarta por ahora (pendiente del spec de persistencia)
  // parents: []
}
```

```tsx
// components/KidsProvider.tsx (client)
interface KidsContextValue {
  kids: Kid[];
  addKid: (input: NewKidInput) => void; // createKid + append
}
// useState(KIDS) como valor inicial; montado en app/layout.tsx
```

Convenciones: identificadores y variables en inglés (regla de `AGENTS.md`); textos de pantalla en español. Nota: el modelo `Kid` actual no tiene campo para notas médicas; mientras no exista persistencia, las notas médicas se ingresan pero no se guardan (se documenta en Decisions como pendiente del spec de BD).

## Implementation plan

1. **Modelo y helpers.** En `lib/kids.ts`: agregar `ROOMS`, `Room`, `NewKidInput`, `createKid` (slug, initial, avatar, cálculo de edad, formato `birthDate`, `admission`, `allergyChip`) y deps de meses en español. Paso aditivo, nada se rompe.
2. **Context en el layout.** Crear `components/KidsProvider.tsx` y envolver `{children}` en `app/layout.tsx`. Todo sigue funcionando: el seed `KIDS` replica el comportamiento actual.
3. **Tokens (si faltan).** Comprobar en `@theme` de `app/globals.css` el color de "Cancelar" (`#94887B`); añadirlo solo si no existe un token equivalente (`muted`/`soft`). Estilos de `<select>` y focus reusando `field-border`/`field-focus` de SPEC 03. Paso aditivo.
4. **Ruta `/kids/new`.** Crear `components/AddKidForm.tsx` (client): inputs con `required`, `<select>` con `ROOMS`, textarea de notas, `onSubmit` → `addKid` + `router.push("/kids")`; dispara error inline si `dd/mm/aaaa` no es parseable. Crear `app/kids/new/page.tsx`: shell full-screen con la card del mockup (header con Link "Cancelar" y botón submit "Guardar"). En `/kids` (`app/kids/page.tsx`): convertir "Agregar niño" en `Link href="/kids/new"` y dejar que `KidsList` reciba/lea los kids del context.
5. **Listado en vivo.** En `components/KidsList.tsx`: leer `kids` del context (contador "SALA SOLES · N niños" y grid sobre los datos en memoria).
6. **Perfil dinámico.** Crear `components/KidProfileLoader.tsx` (client): busca por `id` en el context, renderiza `KidProfile` o `notFound()`. En `app/kids/[id]/page.tsx`: mantener `generateStaticParams` con `KIDS`, resolver `params`, y renderizar el `KidProfileLoader` con el id.

## Acceptance criteria

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] `/kids/new` replica `agregar-nino.dc.html`: card centrada sin sidebar, header "Cancelar / Agregar niño / Guardar", labels NOMBRE COMPLETO, FECHA DE NACIMIENTO `dd/mm/aaaa`, SALA, ALERGIAS (ETIQUETAS) y NOTAS MÉDICAS con sus placeholders exactos.
- [ ] El selector SALA ofrece exactamente Soles, Lunas y Estrellas, con Soles preseleccionado.
- [ ] Con nombre o fecha vacíos, "Guardar" no agrega ni navega (bloqueo del navegador por `required`); con fecha no parseable muestra un error inline y no agrega.
- [ ] Guardar con datos válidos (alergias y notas vacías) agrega el niño a `/kids`: el contador sube a "9 niños", aparece la tarjeta (avatar con inicial, edad, chip VINCULAR por `parents: []`).
- [ ] Desde `/kids`, click en el niño recién agregado abre `/kids/{id}` con el perfil: nombre, sala elegida, edad y `birthDate` formateada "dd/mm/aaaa → 12 mar 2022"; sin banner de alergias (si no se cargaron).
- [ ] Si se cargan alergias ("Maní, Lactosa"), el listado muestra chip MANÍ y el perfil el banner; con notas médicas se ingresan sin romper el flujo.
- [ ] Recargar la página devuelve los 8 niños originales (estado de sesión, sin persistencia).
- [ ] "Cancelar" y el botón "Agregar niño" de `/kids` navegan entre `/kids` y `/kids/new`.
- [ ] Un `/kids/{id}` inexistente renderiza 404; la `Sidebar` sigue mostrando "Sala Soles" y el feed no cambia (las salas nuevas no se reflejan fuera del form).
- [ ] La consola del navegador no muestra errores ni warnings al recorrer `/kids` → `/kids/new` → guardar → perfil.

## Decisions

- **Yes:** `/kids/new` — rutas en inglés, consistente con las decisiones de SPEC 02 y 03.
- **Yes:** React Context en el layout para la lista compartida — idiomático; listado, form y perfil comparten el mismo estado en sesión. Se descartó un store a nivel de módulo por no ser usable desde Server Components.
- **Yes:** Guardar agrega el niño en memoria y navega a `/kids` — decisión explícita del usuario; la conexión a la base de datos (edición, notas médicas persistentes) se difiere a un spec propio.
- **Yes:** card full-screen sin sidebar — réplica del mockup, precedente de SPEC 03 (login/activate-account). Las notas médicas, aunque sin campo en `Kid`, se piden en el form por fidelidad al mockup; se descartan hasta persistencia.
- **Yes:** `<select>` nativo estilizado con `ROOMS` — el chevron fijo del mockup no justifica un dropdown custom.
- **Yes:** derivación determinista en `createKid` (slug, initial, avatar rotado, edad calculada, `birthDate` en español, `admission` = mes actual, `allergyChip` = primer alérgeno en mayúsculas) — mantiene el patrón de datos tipados del repo.
- **No:** persistencia/BD, edición, vinculación de padres, alergias como chips interactivos ni validación más allá de `required` + parseo de fecha.
- **No:** reflejar Lunas/Estrellas en feed, sidebar o listado — quedan confinadas al selector del form.
- **Nota:** el perfil de un niño agregado solo funciona por navegación SPA; un reload directo sobre esa URL cae en 404 (el estado de sesión se perdió). Es consistente con "sin persistencia".

## Risks

| Risk | Mitigation |
| --- | --- |
| El perfil de un niño agregado depende de Context client; un refresh directo a `/kids/{id-nuevo}` da 404 por perder la sesión | Aceptado por diseño (estado de sesión); el 404 es coherente y no rompe flujos normales de navegación. |
| API de Next 16 (dynamicParams, `params` async, `notFound` desde client) | Verificar contra `node_modules/next/dist/docs/` antes de implementar el paso 6. |
| Drift visual al traducir estilos inline a Tailwind | Reutilizar los tokens ya declarados (SPEC 01–03) y verificar con screenshot lado a lado contra `agregar-nino.dc.html`. |

## What is **not** in this spec

- Base de datos ni persistencia durable (conexión a BD real: otro spec).
- Edición de niños ni vinculación de padres.
- Reflejar las salas Lunas/Estrellas fuera del formulario (feed, sidebar, listado).
- Alergias y notas médicas persistentes (las notas médicas se ingresan pero no se guardan aún).
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.