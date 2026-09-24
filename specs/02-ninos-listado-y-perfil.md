# SPEC 02 — Niños (listado) y Perfil de niño

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-24
> **Objective:** Implementar `References/pantallas/ninos.dc.html` y `perfil-nino.dc.html` como las rutas `/kids` y `/kids/[id]`, descompuestas en componentes de React con el estilo visual idéntico al mockup, búsqueda por nombre en el cliente y sin backend ni persistencia.

## Scope

**In:**

- Ruta `/kids` (`app/kids/page.tsx`): listado. Header "GESTIÓN / Niños", botón "Agregar niño" (inerte), buscador "Buscar niño…" que filtra por nombre en el cliente, sección "SALA SOLES · 8 niños" y grid de 2 columnas con las 8 tarjetas del mockup.
- Ruta `/kids/[id]` (`app/kids/[id]/page.tsx`): perfil del niño, pre-renderizada con `generateStaticParams`. "Volver a Niños", header (avatar, nombre, "3 años · Sala Soles", botón "Editar" inerte), banner de alergias y notas, card de datos (fecha de nacimiento, sala, ingreso), botón "Resumen del día" inerte y card "PADRES VINCULADOS" con badges de estado y "Vincular otro padre" inerte. `notFound()` para ids inexistentes.
- Componentes nuevos: `KidsList` (client, guarda el query), `KidCard`, `KidProfile` y `ParentsCard`.
- Datos centralizados y tipados en `lib/kids.ts` (tipo `Kid` + `KIDS` con los 8 niños del mockup), compartidos entre listado y perfil.
- Navegación activa solo del par niños/perfil: sidebar "Niños" → `/kids`, tarjetas → `/kids/{id}`, "Volver a Niños" → `/kids`.
- Modificación de `Sidebar` (prop `active`) e `Icon` (4 íconos nuevos).

**Out of scope (for future specs):**

- Backend, base de datos o persistencia; es una constante tipada como en SPEC 01.
- Pantallas de `agregar-nino`, `vincular-padre`, `resumen-dia`, `login`, `avisos` y `mi-cuenta` (hay `.dc.html` de referencia para otras).
- Lógica de "Agregar niño", "Editar", "Vincular otro padre" y "Resumen del día" (botones/links inertes).
- Navegación hacia Feed/Avisos/Mi cuenta desde el sidebar fuera de Feed y Niños.
- Responsive móvil propio: se replica el layout desktop del template (sidebar 248px, scroll en main).

## Data model

```ts
// lib/kids.ts
export type ParentStatus = "active" | "pending";

export interface Parent {
  id: string;          // "lucia" | "diego"
  name: string;        // "Lucía Fernández"
  relation: string;    // "Mamá" | "Papá"
  initial: string;     // "L"
  avatarClasses: string; // tokens bg/text
  status: ParentStatus; // "active" → badge ACTIVA | "pending" → PENDIENTE
}

export interface Kid {
  id: string;           // clave de ruta → "/kids/mateo-fernandez"
  name: string;         // "Mateo Fernández"
  initial: string;      // "M"
  avatarClasses: string; // tokens bg/text del avatar
  age: number;          // 3
  room: string;         // "Soles"
  birthDate: string;    // "12 mar 2022" (texto ya formateado del mockup)
  admission: string;    // "feb 2025"
  allergyChip?: string; // "MANÍ" | "LACTOSA" → chip del listado, solo si aplica
  allergies?: string;   // nota del banner del perfil ("Alergia al maní…"); banner solo si existe
  parents: Parent[];    // meta del listado: "2 padres vinculados" | "sin padres vinculados"
}

export const KIDS: Kid[] = [
  // Mateo Fernández (3, MANÍ, 2 padres), Sofía Méndez (2, 1), Benjamín Ruiz (3, 2),
  // Valentina Soto (2, 0 → chip VINCULAR), Tomás Díaz (3, LACTOSA, 1),
  // Emma Castro (2, 1), Lucas Romero (3, 1), Olivia Vega (2, 1)
];
```

Convenciones: nombres, ids y variables de código en inglés (regla de `AGENTS.md`); textos visibles en pantalla en español. Valores exactos del mockup (edades, fechas, relación de padres, badges). Los padres de niños sin perfil de referencia llevan nombres de muestra marcados como placeholders (los reemplazará el futuro spec de persistencia/vinculación). El adorno del listado es: chip de alérgeno si `allergyChip`, chip "VINCULAR" si `parents` está vacío, y chevron en el resto.

## Implementation plan

1. **Tokens de tema y modelo de datos.** En `app/globals.css` agregar a `@theme`: variantes de avatar (pink `#f4b8cc/#c44a7a`, green `#b9dec4/#3e8b62`, yellow `#f4dc8e/#9a7b1e`, purple `#c9b6e8/#7b5fc0`, blue `#a9c7e8`), chips de alérgeno `#fbd8cc/#d9684a` y de vincular `#f9d2de/#c56486`, banner de alerta `#fbdad6/#c5413a/#b25249` (+ ícono `#f4a8a0`), badge pendiente `#f7e7a6/#9a7b1e`, placeholder `#b6a99b`, chevron `#cbb89f` y anillo punteado `#d8cbba`. Crear `lib/kids.ts` con `Kid`, `Parent`, `ParentStatus` y `KIDS` (8 niños del mockup). Paso aditivo, nada se rompe.
2. **Ampliar `Icon.tsx`.** Añadir a `ICON_NAMES`/`ICONS`: `search` (lupa), `chevron-left` (volver), `chevron-right` (tarjetas sin badge) y `alert` (triángulo del banner) con los paths de los mockups.
3. **`Sidebar` activo por ruta.** Añadir prop `active?: "feed" | "kids"` (default `"feed"`); el ítem activo se deriva del prop en vez del booleano fijo; hrefs reales para Feed (`/`) y Niños (`/kids`); el resto inerte. `app/page.tsx` no cambia (default feed).
4. **Listado `/kids`.** `components/KidCard.tsx` (avatar, nombre, meta "3 años · 2 padres vinculados", badge de alérgeno / chip VINCULAR / chevron, enlace a `/kids/{id}`). `components/KidsList.tsx` (client): `useState` con el query, input "Buscar niño…", filtro por nombre case-insensitive, sección "SALA SOLES · N niños", grid 2 columnas y estado vacío "No se encontró ningún niño…". `app/kids/page.tsx`: shell `Sidebar active="kids"` + main con `KidsList` y botón "Agregar niño" inerte.
5. **Perfil `/kids/[id]`.** `components/ParentsCard.tsx` ("PADRES VINCULADOS", avatar inicial, "Mamá · activa", badge ACTIVA/PENDIENTE, "Vincular otro padre" inerte). `components/KidProfile.tsx` (prop `Kid`: "Volver a Niños", avatar+nombre+"3 años · Sala Soles"+Editar inerte, banner de alergias solo si `allergies`, card de fechas, "Resumen del día" inerte, `ParentsCard`). `app/kids/[id]/page.tsx`: `generateStaticParams` con los 8 ids, `await params`, `notFound()` si no existe.

## Acceptance criteria

- [ ] `npm run build` y `npm run lint` pasan sin errores. <!-- FAIL: npm run lint pasa (exit 0) pero npm run build falla por entorno: falta el paquete `@vercel/turbopack-next` (Module not found al resolver `next/font/google` desde `app/layout.tsx`); el paquete no está instalado, no figura en package-lock.json y no existe en el registro público npm. `app/layout.tsx` no cambió en este spec; el fallo es pre-existente (scaffold/SPEC 01). -->
- [x] `/kids` es visualmente idéntico a `ninos.dc.html` (sidebar "Niños" resaltado, header GESTIÓN, buscador, sección "SALA SOLES · 8 niños" y las 8 tarjetas en grid 2 columnas con avatar, nombre, meta y badge/chevron correctos por niño).
- [x] Escribir en el buscador filtra las tarjetas por nombre en vivo (case-insensitive); al borrar vuelven los 8; con cero resultados se muestra el estado vacío "No se encontró ningún niño…".
- [x] Click en una tarjeta navega a `/kids/{id}` y muestra el perfil; el de Mateo (`/kids/mateo-fernandez`) es visualmente idéntico a `perfil-nino.dc.html` (banner de alergia al maní, filas fecha nac. 12 mar 2022 / Sala Soles / feb 2025, Lucía Fernández ACTIVA y Diego Fernández PENDIENTE, botón Resumen del día).
- [x] Un id inexistente renderiza 404 (`notFound()`).
- [x] "Volver a Niños" regresa a `/kids`; el sidebar muestra "Feed" o "Niños" resaltado según la ruta activa y navegan entre sí.
- [x] Quedan inertes (`href="#"`) Agregar niño, Editar, Resumen del día, Vincular otro padre, Nueva publicación, Avisos, Mi cuenta, logout y el logo.
- [x] La consola del navegador no muestra errores ni warnings al cargar `/kids` y `/kids/[id]`.

## Decisions

- **Yes:** rutas en inglés `/kids` y `/kids/[id]` — decisión explícita del usuario (sin nombres de página en español).
- **Yes:** modelo central `lib/kids.ts` compartido por listado y perfil — mismo patrón que `lib/feed.ts`; el render no cambia cuando llegue persistencia.
- **Yes:** búsqueda en el cliente (estado local en `KidsList`) — solo frontend, sin backend; filtro únicamente por nombre.
- **Yes:** ruta dinámica con `generateStaticParams` + `await params` + `notFound()` — los 8 niños se pre-renderizan en build (convención de Next.js 16).
- **Yes:** `Sidebar` pasa a recibir `active` — se reutiliza en las próximas pantallas sin hardcodear el resaltado.
- **Yes:** botones de las pantallas hijas (agregar/editar/vincular/resumen) inertes — pertenecen a otros specs.
- **No:** backend, API, login y persistencia — se posponen; los datos son constante tipada.
- **No:** rutas ni navegación hacia Avisos / Mi cuenta / crear publicación.
- **No:** búsqueda por sala, alérgenos o estado de padres.
- **No:** responsivo móvil propio — réplica del desktop del template.
- **Nota:** los nombres de padres de niños sin perfil de referencia y el texto del estado vacío de búsqueda son marcadores de muestra (no hay referencia visual para ellos); el estado vacío se decidió porque el filtro es funcional.

## Risks

| Risk | Mitigation |
| --- | --- |
| API nueva de rutas dinámicas en Next 16 (`params` asíncrono, `generateStaticParams`, `notFound`) | Verificado contra `node_modules/next/dist/docs/` (dynamic-routes + page); el paso 5 lo aplica tal cual. |
| Drift visual al pasar estilos inline a tokens de Tailwind | Todos los colores exactos del mockup declarados en `@theme` y verificados por screenshot lado a lado. |
| Datos placeholder para niños/padres sin referencia | Marcados explícitamente como muestras en `lib/kids.ts`; el spec de persistencia los reemplaza. |

## What is **not** in this spec

- Backend, API o persistencia (datos como constante tipada).
- Pantallas de agregar niño, vincular padre, resumen del día, login, avisos y mi cuenta.
- Lógica funcional de "Agregar niño", "Editar", "Vincular otro padre" y "Resumen del día".
- Navegación hacia Avisos/Mi cuenta/crear publicación.
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.