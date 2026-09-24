# SPEC 06 — Crear publicación (y publicarla en el feed)

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 04
> **Date:** 2026-09-24
> **Objective:** Implementar `References/pantallas/crear-publicacion.dc.html` como `/posts/new` (card full-screen sin sidebar) accesible desde «Nueva publicación» de la Sidebar y el composer del feed, y hacer que «Publicar» agregue el post al feed en memoria (Context), visible en `/` durante la sesión.

## Scope

**In:**

- Ruta `/posts/new` (`app/posts/new/page.tsx`): réplica del mockup, card centrada `max-w-[580px]` sobre `bg-canvas` full-screen sin `Sidebar` (precedente de `/kids/new`).
- Entrada: botón «Nueva publicación» de `Sidebar` y composer «Compartí un momento…» (`NewPostComposer`) pasan de `href="#"` a `Link href="/posts/new"`.
- `components/PostComposerForm.tsx` (client): header "Cancelar · Nueva publicación · Publicar"; PARA con chips de kids del Context (avatar + inicial, multi-select) + chip «Toda la sala»; TIPO con los 7 pills del mockup (Comida por defecto); DESCRIPCIÓN textarea (required, vacía, placeholder "Contá cómo le fue hoy…"); FOTOS decorativa (miniatura placeholder + tile "Agregar" inerte).
- Reglas de interacción: «Toda la sala» ON sincroniza todos los chips kids y define `audience: "toda la sala"`; al apagarse los kids quedan todos seleccionados y se pueden desmarcar individualmente; el tipo Anuncio fija «Toda la sala» y deshabilita los chips kids (al volver a otro tipo se restaura el PARA previo); «Publicar» es no-op si la descripción está vacía (bloqueo `required`) o si no hay destinatario (submit deshabilitado); «Cancelar» → `/` sin crear.
- Estado compartido: `components/PostsProvider.tsx` (Context, client) montado en `app/layout.tsx` dentro de `KidsProvider`, seed = `POSTS`, expone `posts` y `addPost(post)`.
- Feed dinámico: `components/FeedContent.tsx` (client) lee `posts` del Context y renderiza `FeedHeader`, `NewPostComposer`, "PUBLICADO HOY" y `PostCard`s; `app/page.tsx` queda como shell (`Sidebar` + `FeedContent`). El post publicado aparece al inicio de la lista con hora real `HH:MM` y "publicado por vos".
- `lib/feed.ts`: ampliar `PostKind` a los 7 tipos, `POST_TYPES`, `POST_TYPE_STYLES` (pills del form), ampliar `KIND_STYLES` con los badges nuevos del feed, `NewPostInput` y `createPost(input, kids)`.
- Tokens nuevos en `@theme` de `app/globals.css` (reusando los existentes donde aplique).

**Out of scope (for future specs):**

- Edición de posts (el enlace "Editar" de las cards sigue inerte).
- Subida/visualización real de fotos (bloque FOTOS decorativo, réplica del mockup).
- Persistencia durable: los posts viven en sesión; un reload devuelve los 3 originales.
- Likes/comentarios funcionales, segmentación/entrega real del audience.
- Responsive móvil propio: réplica del desktop del template.

## Data model

```ts
// lib/feed.ts — adiciones
export const POST_TYPES = [
  "food",        // Comida
  "nap",         // Siesta
  "activity",    // Actividad
  "milestone",   // Logro
  "mood",        // Ánimo
  "photo",       // Foto
  "announcement" // Anuncio
] as const;
export type PostType = (typeof POST_TYPES)[number]; // = PostKind ampliado

export interface NewPostInput {
  type: PostKind;
  kidIds: string[];   // ids de kids seleccionados; todos los del Context si es «Toda la sala»
  body: string;       // descripción no vacía
}

export function createPost(input: NewPostInput, kids: Kid[]): Post {
  // kind = input.type
  // Si type === "announcement": author "Anuncio general", avatarInitial "", avatarClasses "bg-announcement-badge text-announcement-ink" (los chips de kids bloqueados)
  // Resto: primer kid de input.kidIds resuelto contra kids → author/avatarInitial/avatarClasses
  //   photoLabel: undefined (fotos decorativas, sin imagen)
  // audience: 1 kid → "familia de {nombre}"; varios → "familia de {a}, {b} y {c}"; «Toda la sala» → "toda la sala"
  // time: hora local HH:MM (24h) del momento; likes: 0; comments: 0
}
```

```tsx
// components/PostsProvider.tsx (client)
interface PostsContextValue {
  posts: Post[];
  addPost: (post: Post) => void; // prepend (unshift), dedupe de id con sufijo numérico como addKid
}
// useState(POSTS); Provider montado en app/layout.tsx dentro de KidsProvider
```

```ts
// lib/feed.ts — estilos
POST_TYPE_STYLES: Record<PostType, { label: string; className: string }> // pills del form
// food: bg-type-food text-white        activity: bg-type-activity text-white
// nap: bg-type-nap text-type-nap-ink   milestone: bg-milestone-badge text-milestone-ink
// mood: bg-link-chip text-link-chip-ink  photo: bg-allergy-chip text-allergy-chip-ink
// announcement: bg-announcement-badge text-announcement-ink
// pill seleccionada agrega ring-2 ring-ink/30 (ver Decisions)

KIND_STYLES: se amplía con food/nap/mood/photo (badges del feed)
// food: bg-pending-badge text-pending-ink   nap: bg-nap-badge text-nap-ink (tokens nuevos)
// mood: bg-link-chip text-link-chip-ink     photo: bg-allergy-chip text-allergy-chip-ink
```

Convenciones: identificadores en inglés; textos de pantalla en español. `Post` reutiliza los campos actuales (`author`, `avatarInitial`, `avatarClasses`, `time`, `audience`, `body`, `likes`, `comments`) — no cambia el render de `PostCard`. El `PostKind` se amplía de 3 a 7 (labels "COMIDA", "SIESTA", "ÁNIMO", "FOTO").

## Implementation plan

1. **Modelo y helpers (aditivo).** En `lib/feed.ts`: ampliar `PostKind`, agregar `POST_TYPES`, `NewPostInput`, `POST_TYPE_STYLES` y `createPost(input, kids)` (reusa el tipo `Kid` de `lib/kids`); ampliar `KIND_STYLES` con los 4 tipos nuevos. Paso aditivo, nada se rompe.
2. **Tokens (aditivo).** En `app/globals.css`: `--color-nap-badge: #e7dcf6` y `--color-nap-ink: #7b5fc0` (badge Siesta); `--color-type-food: #9a7b1e` y `--color-type-nap: #e7dcf6` (pills del form, texto blanco/#7b5fc0). El resto reusa tokens existentes (`pending-badge/ink`, `link-chip/ink`, `allergy-chip/ink`, `announcement-badge/ink`, `milestone-badge/ink`).
3. **PostsProvider.** Crear `components/PostsProvider.tsx` (client) y montarlo en `app/layout.tsx` dentro de `KidsProvider`. Nada se rompe: el seed `POSTS` replica el feed actual.
4. **Feed dinámico.** Crear `components/FeedContent.tsx` (client) leyendo `posts` del Context y renderizando lo que hoy hace `app/page.tsx` (header, composer, "PUBLICADO HOY", cards); `app/page.tsx` queda como shell (`Sidebar` + `FeedContent`). Equivalente funcional al estado actual.
5. **Ruta `/posts/new`.** Crear `components/PostComposerForm.tsx` (client): PARA desde `useKids()` (chips por kid con avatar/inicial, Mateo preseleccionado, multi-toggle, chip "Toda la sala", anuncio fuerza toda la sala); TIPO con los 7 pills; textarea `required`; FOTOS decorativa; submit → `createPost` + `addPost` + `router.push("/")`. Crear `app/posts/new/page.tsx`: card del mockup con header (Link "Cancelar" → `/`, botón submit "Publicar").
6. **Navegación real.** En `Sidebar.tsx` y `NewPostComposer.tsx`, "Nueva publicación"/"Compartí un momento…" pasan a `Link href="/posts/new"` conservando los estilos actuales.

## Acceptance criteria

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] `/posts/new` replica `crear-publicacion.dc.html`: card centrada full-screen sin sidebar, header "Cancelar / Nueva publicación / Publicar", secciones PARA / TIPO / DESCRIPCIÓN / FOTOS con labels (PARA, TIPO, DESCRIPCIÓN, FOTOS) y placeholders exactos.
- [ ] El botón «Nueva publicación» de la Sidebar y el composer «Compartí un momento…» navegan a `/posts/new`.
- [ ] PARA lista los kids del Context (los 8 base + los agregados en sesión) con su inicial/avatar y el chip «Toda la sala»; Mateo viene preseleccionado (estilo activo del mockup).
- [ ] Multi-selección: se pueden activar/desactivar varios chips individualmente; «Toda la sala» activo marca todos los chips; al apagarse quedan todos marcados y pueden desmarcarse uno por uno.
- [ ] Con el tipo Anuncio: PARA queda fijado en «Toda la sala» y los chips de kids se deshabilitan; al cambiar a otro tipo se restaura el PARA previo.
- [ ] TIPO ofrece exactamente Comida, Siesta, Actividad, Logro, Ánimo, Foto y Anuncio, con Comida activo por defecto (pill de color de identidad + ring de selección).
- [ ] Textarea vacía con placeholder "Contá cómo le fue hoy…"; con descripción vacía o sin destinatario, «Publicar» no agrega ni navega.
- [ ] Publicar válido (ej. Actividad, Mateo, "Pintamos…") navega a `/` y el post aparece al inicio de la lista: avatar/nombre de Mateo, hora actual `HH:MM`, "publicado por vos", badge ACTIVIDAD, "Para: familia de Mateo", cuerpo, ❤0 💬0.
- [ ] Publicar un Anuncio produce card con megáfono, "Anuncio general", badge ANUNCIO y "Para: toda la sala".
- [ ] Con 2+ niños seleccionados el audience es plural ("familia de Mateo y Sofía").
- [ ] Cancelar navega a `/` sin agregar nada; recargar devuelve los 3 posts originales (sesión, sin persistencia).
- [ ] La consola del navegador no muestra errores ni warnings al recorrer `/` → `/posts/new` → publicar → `/`.

## Decisions

- **Yes:** `/posts/new` full-screen sin sidebar — precedente de `/kids/new` (SPEC 04) y `/kids/[id]/parent` (SPEC 05).
- **Yes:** agregar el post al feed vía Context (`PostsProvider` + `addPost`) — misma naturaleza de sesión que `addKid` (SPEC 04) y `addParent` (SPEC 05); decisión explícita del usuario.
- **Yes:** PARA multi-select dinámico desde `KidsProvider` — decisión explícita del usuario; «Toda la sala» es un chip sintético que equivale a todos los kids. `Post.audience` queda como string display ("familia de …" / "toda la sala").
- **Yes:** extender `PostKind` a los 7 tipos del mockup — permite publicar y renderizar cualquier tipo en el feed; los badges reusan tokens existentes y solo se agregan nap y food.
- **Yes:** pill seleccionada = color de identidad del tipo (como el mockup) + `ring-2 ring-ink/30` — el mockup no muestra el estado deseleccionado con claridad; el ring es el marcador visible de selección.
- **Yes:** anuncio fija «Toda la sala» — coherente con el feed, donde anuncios muestran megáfono y "Para: toda la sala".
- **Yes:** descripción vacía + `required` (el texto precargado del mockup es solo demo del feed) y hora real `HH:MM` en el post nuevo, en la primera posición de la lista.
- **No:** edición de posts, fotos reales, likes/comentarios, persistencia ni responsive móvil.
- **No:** cambios en el modelo `Kid` (los chips PARA son de solo lectura sobre `kids`).

## Risks

| Risk | Mitigation |
| --- | --- |
| Reload a `/` pierde los posts agregados (estado de sesión) | Aceptado por diseño, igual que SPEC 04/05. |
| `PostKind` ampliado rompe algún switch existente | Solo se extiende `KIND_STYLES` y `POST_TYPE_STYLES`; `PostCard` es agnóstico al kind. |
| Drift visual de pills/badges nuevos | Tokens en `@theme` y verificación por screenshot contra `crear-publicacion.dc.html`. |
| API Next 16 (client components en el feed, Context en server layout) | Patrón ya verificado con `KidsList`/`KidProfileLoader`; verificar contra `node_modules/next/dist/docs/` antes del paso 4. |

## What is **not** in this spec

- Edición de publicaciones ("Editar" inerte, es "editar" → otro spec).
- Detalle de publicación, fotos funcionales, likes y comentarios.
- Persistencia durable / BD (spec futuro, igual que kids y parents).
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.