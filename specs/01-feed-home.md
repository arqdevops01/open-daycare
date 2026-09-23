# SPEC 01 — Réplica estática del feed como HOME

> **Status:** Implementado
> **Date:** 2026-09-23
> **Objective:** Implementar `References/pantallas/feed.dc.html` como la ruta `/` (HOME) descompuesta en componentes de React, con estilo visual idéntico al mockup, sin autenticación ni base de datos.

## Scope

**In:**

- Ruta `/` (`app/page.tsx`) mostrando el feed del mockup al 100% estático.
- Descomposición del layout en componentes: `Sidebar`, `FeedHeader`, `NewPostComposer`, `PostCard` y `Icon`.
- Datos de los 3 posts y metadatos del feed como constante tipada en `lib/feed.ts`.
- Fuentes Fredoka (títulos) y Nunito (texto) cargadas con `next/font/google`.
- Paleta cálida definida como tokens en `@theme` de `app/globals.css`.
- Iconos SVG centralizados en un componente `Icon` reutilizable.

**Out of scope (for future specs):**

- Autenticación / login (hay `login.dc.html` de referencia, otro spec).
- Base de datos o persistencia; los datos son una constante en memoria.
- Rutas distintas a `/` (Niños, Avisos, Mi cuenta, crear publicación, detalle, etc.).
- Navegación funcional: los enlaces se renderizan inertes (`href="#"`).
- Responsive móvil propio: se replica el layout del template tal cual (sidebar fija 248px, scroll solo en main).
- Interacción con likes/comentarios o cualquier estado.

## Data model

```ts
// lib/feed.ts
export type PostKind = "milestone" | "activity" | "announcement";

export interface Post {
  id: string;
  kind: PostKind;
  author: string;          // "Mateo" | "Anuncio general"
  avatarInitial: string;   // "M"
  avatarClasses: string;   // tokens bg/text del avatar
  time: string;            // "14:20"
  audience: string;        // "familia de Mateo" | "toda la sala"
  body: string;
  photoLabel?: string;     // solo "activity" → "Foto · pintando con témperas"
  likes: number;
  comments: number;
}

export const POSTS: Post[] = [/* los 3 posts en orden del mockup */];

export const SIDEBAR = { roomName: "Sala Soles", user: { name: "Caro Giménez", role: "Maestra · Soles", initial: "C" } };
export const FEED_HEADER = { eyebrow: "GUARDERÍA · SALA SOLES", greeting: "Buenas, Caro", meta: "12 niños · martes 17 jun" };
export const KIND_STYLES: Record<PostKind, { label: string; badge: string; dot: string; text: string }> = { ... };
```

Convenciones: identificadores y nombres de código en inglés (regla de `AGENTS.md`); los nombres que se muestran en pantalla (badges, avisos) van en español. El badge de tipo usa `KIND_STYLES` (milestone → verde, activity → azul, announcement → índigo). La card de announcement muestra megáfono en lugar de inicial. No hay nuevas estructuras de datos runtime; es una constante declarativa.

## Implementation plan

1. **Layout y tema base.** En `app/layout.tsx`: importar `Fredoka` y `Nunito` de `next/font/google`, quitar Geist, `lang="es"`, metadata `OpenDayCare`. En `app/globals.css`: reemplazar el tema por defecto con `@theme inline` usando el fondo `#F6ECDF`, texto `#3F362E` y las dos familias tipográficas.
2. **`components/Icon.tsx`.** Map de nombre → SVG para: logo sol, plus, home, users, bell, user, logout, camera, heart, comment, megaphone y photo. Propiedades `className`/`fill`.
3. **`lib/feed.ts`.** Tipos, `POSTS` (3 posts del mockup con sus valores exactos: likes 3/5/8, comentarios 1/2/0), constantes de `SIDEBAR`, `FEED_HEADER` y `KIND_STYLES`.
4. **`components/Sidebar.tsx`.** Layout de 248px fija, sticky, `bg #FFFDF9`; logo + sala, botón "Nueva publicación", nav (Feed activo, Niños, Avisos, Mi cuenta), footer de usuario + logout. Enlaces con `href="#"`.
5. **`components/FeedHeader.tsx` y `components/NewPostComposer.tsx`.** Eyebrow + saludo + meta; caja "Compartí un momento…" (avatar + texto placeholder + icono cámara).
6. **`components/PostCard.tsx`.** Card genérica para los 3 tipos: header (avatar/ícono, nombre, hora "publicado por vos", badge), "Para: …", cuerpo, foto placeholder (solo actividad), footer con corazones/comentarios/Editar.
7. **Componer la ruta en `app/page.tsx`.** Shell flex `min-h-screen` con `Sidebar` + `<main>` scrollable (`max-width:760px`): `FeedHeader`, `NewPostComposer`, sección "PUBLICADO HOY" y `POSTS.map(PostCard)`.

## Acceptance criteria

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] `/` muestra el feed idéntico al `feed.dc.html` (comparación visual lado a lado, incluyendo medidas de la sidebar, tipografías y colores exactos).
- [ ] Sidebar muestra: logo "OpenDayCare · Sala Soles", botón "Nueva publicación", nav con "Feed" resaltado (bg `#FBE3D8`, texto `#D9583C`) y footer "Caro Giménez · Maestra · Soles" con ícono de logout.
- [ ] Header muestra "GUARDERÍA · SALA SOLES", "Buenas, Caro" y "12 niños · martes 17 jun".
- [ ] Se renderiza el composer "Compartí un momento…".
- [ ] Los 3 posts se ven en orden: logro (❤3 💬1), actividad con placeholder de foto (❤5 💬2), anuncio (❤8 💬0).
- [ ] Ningún enlace navega (todos los `<a>` son `href="#"`).
- [ ] La consola del navegador no muestra errores ni warnings al cargar `/`.

## Decisions

- **Yes:** descomposición en componentes — el sidebar y PostCard se reutilizan en futuros specs (aviso, niños, etc.).
- **Yes:** datos hardcodeados pero tipados y centralizados en `lib/feed.ts` — el futuro spec de persistencia reemplaza la constante por datos reales sin tocar el render.
- **Yes:** enlaces inertes (`href="#"`), sin rutas placeholder — este spec es solo el diseño de la pantalla.
- **Yes:** `next/font/google` (Fredoka/Nunito) + tokens `@theme` en globals.css — sistema de diseño del repo en un solo lugar.
- **Yes:** componente `Icon` centralizado — ~12 SVGs reutilizables en el resto del layout.
- **No:** auth, DB, rutas extra y navegación — se posponen a specs propios.
- **No:** breakpoint móvil dedicado — se replica el diseño desktop del template.
- **No:** datos dinámicos (fecha actual) — réplica exacta del mockup.

## Risks

| Risk | Mitigation |
| --- | --- |
| Métricas de fuente distintas entre el `<link>` de Google Fonts y `next/font/google` (self-hosting) | Mismas familias y pesos; la comparación visual tolera diferencias de 1-2px de métrica (AA) siempre que el layout general coincida. |
| Drift visual al traducir estilos inline a tokens de Tailwind | Los colores exactos del mockup (`#F6ECDF`, `#3F362E`, `#FFFDF9`, badges, etc.) se declaran en `@theme` y se verifican por screenshot. |

## What is **not** in this spec

- Autenticación (pantalla de login).
- Base de datos o persistencia de publicaciones.
- Rutas para Niños, Avisos, Mi cuenta, publicar o detalle.
- Navegación funcional de cualquier enlace.
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.