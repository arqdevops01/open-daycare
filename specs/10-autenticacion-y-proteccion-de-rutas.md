# SPEC 10 — Autenticación por email y contraseña con protección de rutas

> **Status:** Aprobado
> **Depends on:** SPEC 03, SPEC 09
> **Date:** 2026-09-26
> **Objective:** Conectar `/login` a Supabase Auth con email y contraseña reales y exigir sesión en todas las rutas de la app salvo `/login` y `/activate-account`, con verificación en `proxy.ts` y en cada página protegida.

## Por qué existe este spec

SPEC 03 dejó `/login` y `/activate-account` como mockups navegables: el botón "Iniciar sesión" era un `Link href="/"` sin validar nada. SPEC 09 creó la tabla `public.users` con un único usuario staff real, pero sin policies RLS, así que la app todavía no puede leer esa tabla y no tiene forma de saber quién entra.

Este spec cierra las dos mitades: una sesión real administrada por Supabase Auth y la primera barrera de rutas de la app. Deja explícito que la autorización por tenant (roles, policies RLS, lectura de `public.users`) es trabajo de specs posteriores.

## Scope

**In:**

- `proxy.ts` (raíz): verificación optimista de sesión. Lee los claims con `supabase.auth.getClaims()` y, si no hay sesión y la ruta no es pública, redirige a `/login`. Agrega `config.matcher` con negative lookahead para excluir `_next/static`, `_next/image`, `favicon.ico` y assets estáticos.
- Lista de rutas públicas dentro de `proxy.ts`: `/login` y `/activate-account`. Son las únicas dos.
- `lib/supabase/session.ts` (nuevo): capa de datos de sesión con dos funciones, `getSessionClaims()` y `requireUser()`, construidas sobre el cliente de `lib/supabase/server.ts` y `getClaims()`.
- `app/actions/auth.ts` (nuevo): Server Actions `login(prevState, formData)` y `logout()`. `login` llama a `supabase.auth.signInWithPassword({ email, password })`; `logout` llama a `supabase.auth.signOut()`.
- `components/LoginForm.tsx`: pasa de estado local a Server Action. `useActionState(login, ...)`, inputs sinControlled con `name="email"` y `name="password"`, ambos `required`, y un párrafo de error inline.
- `app/login/page.tsx`: Server Component async. Si hay sesión, `redirect("/")` y el formulario no se ve.
- `components/Sidebar.tsx`: el ícono "Cerrar sesión" deja de ser `<a href="#">` y pasa a `<form action={logout}>` con `<button type="submit">`, conservando clases y `title`.
- `requireUser()` al inicio de las seis páginas protegidas: `app/page.tsx`, `app/kids/page.tsx`, `app/kids/[id]/page.tsx`, `app/kids/new/page.tsx`, `app/kids/[id]/parent/page.tsx` y `app/posts/new/page.tsx`.
- `generateStaticParams()` se elimina de `app/kids/[id]/page.tsx` y de `app/kids/[id]/parent/page.tsx`: al leer cookies esas páginas dejan de ser prerenderizables.
- Copy de error único y genérico: "No pudimos iniciar sesión. Revisá tu email y contraseña."

**Out of scope (for future specs):**

- Registro, `signUp`, `invitations` y el flujo real de activación: `/activate-account` sigue siendo el mockup de SPEC 03.
- Recuperación de contraseña: "¿Olvidaste tu contraseña?" sigue siendo un `<span>` inerte.
- Lectura de `public.users` (rol, `full_name`) y cualquier cambio en la base. La Sidebar sigue mostrando el mock `SIDEBAR.user` de `lib/feed.ts`.
- Rutas por rol: todo usuario autenticado entra por `/`, igual que fijó SPEC 03. No hay feed de familia.
- `lib/database.types.ts` y los tipos generados de TypeScript: este spec no consulta ninguna tabla.
- Google/OAuth, magic link, login por teléfono, 2FA y cualquier otro proveedor de Supabase Auth.
- `?next=` y retorno a la ruta que originó el redirect.
- Route group `app/(app)/` con layout propio: la verificación va en cada página.
- Cambios de visibilidad en el refresh token o en la expiración de sesión.

## Data model

Este spec no introduce estructuras de datos persistentes ni tablas nuevas. La sesión vive en las cookies httpOnly que escribe Supabase Auth; la app no la persiste en ningún lado.

Lo único que se tipa son las firmas de los helpers y el estado de la Server Action:

```ts
// lib/supabase/session.ts
// JwtPayload de @supabase/auth-js: sub, email, session_id, role ("authenticated"),
// aud, iss, exp, iat, aal, amr, user_metadata, app_metadata.
// El claim `role` es el rol de Postgres, NO el rol de negocio de public.users.
export async function getSessionClaims(): Promise<JwtPayload | null>;
export async function requireUser(): Promise<JwtPayload>; // redirect("/login") si no hay claims
```

```ts
// app/actions/auth.ts
export const LOGIN_ERROR = "No pudimos iniciar sesión. Revisá tu email y contraseña.";
export type LoginState = { error: string | null };
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState>;
export async function logout(): Promise<void>; // redirect("/login")
```

`login` devuelve `{ error }` ante fallo y nunca retorna en el caso exitoso: hace `redirect("/")`. El estado inicial que pasa `useActionState` es `{ error: null }`.

No hay migración: la historia de migraciones del proyecto sigue con las dos entradas de SPEC 08 y SPEC 09.

## Implementation plan

Cada paso es un commit por sí solo y deja la app funcionando. El orden importa: la protección del proxy entra en el paso 6, **después** de que el login real funcione. Si se invirtiera, el paso 6 dejaría al mock de SPEC 03 naveguje a `/`, que rebotaría de vuelta a `/login`.

### 1. `lib/supabase/session.ts` (nuevo) — capa de datos de sesión

- `'server-only'` no hace falta: el módulo no se importa desde ningún Client Component, y `cookies()` ya lanza si se usa en el cliente.
- `getSessionClaims(): Promise<JwtPayload | null>` — `const supabase = createClient(await cookies())`, luego `const { data, error } = await supabase.auth.getClaims()`. Devuelve `data.claims` si no hay `error`, si no `null`. Nunca `getSession()`.
- `requireUser(): Promise<JwtPayload>` — `const claims = await getSessionClaims()`; si es `null`, `redirect("/login")` de `next/navigation`; si no, lo devuelve.
- Tipo de retorno `JwtPayload` importado de `@supabase/auth-js`.
- **Verificación:** `npm run build` pasa; `grep -rn "getSession(" lib/` no devuelve nada.

### 2. `app/actions/auth.ts` (nuevo) — Server Actions

- `'use server'` obligatorio en la primera línea. Sin ese pragma el archivo no exporta acciones.
- `export const LOGIN_ERROR = "No pudimos iniciar sesión. Revisá tu email y contraseña."` — constante única, la usan la acción y la verificación.
- `export type LoginState = { error: string | null }`.
- `login(prevState: LoginState, formData: FormData): Promise<LoginState>`:
  - Lee `formData.get("email")` y `formData.get("password")`; si alguno no es `string` o viene vacío (`String(value).trim() === ""`), devuelve `{ error: LOGIN_ERROR }` sin llamar a Supabase.
  - `const { error } = await supabase.auth.signInWithPassword({ email, password })`.
  - Si `error` es truthy, devuelve `{ error: LOGIN_ERROR }`. No se loguea el mensaje crudo de Supabase ni se muestra al usuario.
  - Si no hay `error`, `redirect("/")`. La función nunca retorna en el caso exitoso.
  - `prevState` no se lee: la firma lo exige por contrato de `useActionState` y se marca con `_prevState` si el linter se queja.
- `logout(): Promise<void>` — `await supabase.auth.signOut()` y después `redirect("/login")`. Sin argumentos: se usa como `action` de un `<form>`.
- Ambas usan `createClient(await cookies())` de `lib/supabase/server.ts`. Ninguna toca `supabase.from(...)` ni `public.users`.
- **Verificación:** `npm run build` pasa; el archivo existe pero nadie lo importa todavía, así que la app no cambia.

### 3. `components/LoginForm.tsx` — login real

- Hoy el componente **no tiene `<form>`**: es un `div` con dos inputs controlados por `useState` y un `<Link href="/">`. Ese es el cambio estructural de este paso.
- Importar `useActionState` de `react` y `login` de `@/app/actions/auth`. Borrar los dos `useState` y el `value`/`onChange` de los inputs.
- `const [state, formAction, isPending] = useActionState(login, { error: null })`.
- Envolver en `<form action={formAction}>` únicamente: label EMAIL, input, label CONTRASEÑA, input, caja de error y CTA. El `<span>` de "¿Olvidaste tu contraseña?" y el `<p>` con el link a `/activate-account` quedan **fuera** del form.
- Inputs no controlados: `name="email"` `type="email"` `required` y `name="password"` `type="password"` `required` placeholder `"••••••••"`. Se elimina el `defaultValue` con `caro@opendaycare.com`. Se conservan las clases de borde, fondo y padding del mockup.
- Caja de error: se copia el patrón exacto de `components/AddKidForm.tsx:66-73` — `<div role="alert" className="mb-4 rounded-[12px] border border-alert-icon/50 bg-alert-bg px-4 py-3 text-[13.5px] font-bold text-alert-title">`, con `role="alert"` para que un lector de pantalla lo anuncie. Es el precedente del repo para errores inline; no se inventan tokens de color nuevos.
- CTA: el `<Link href="/">` se reemplaza por `<button type="submit">` con **el mismo** gradiente `bg-linear-to-b from-brand-btn-a to-brand-btn-b`, el mismo padding y la misma sombra del mockup. Texto normal "Iniciar sesión"; con `isPending`, "Iniciando…" y `disabled:opacity-60`. `w-full` para conservar el ancho.
- **Verificación:** con la cuenta real, "Iniciar sesión" navega a `/`. Con contraseña incorrecta aparece la caja de error y el email conserva lo tipeado. Enviar vacío no dispara la acción.

### 4. `app/login/page.tsx` — sin formulario si ya hay sesión

- `LoginPage` pasa a `async`. Primera línea del cuerpo: `const claims = await getSessionClaims()`; si no es `null`, `redirect("/")`.
- El JSX del split (gradiente, logo, titular, footer "🌿 Guardería Sala Soles") no se toca. El componente `LoginForm` se sigue importando igual.
- Efecto lateral esperado: leer cookies vuelve esta ruta dinámica. Es correcto y no requiere `export const dynamic`.
- **Verificación:** sin sesión, `/login` se ve igual que en SPEC 03. Con sesión, `/login` aterriza en `/`.

### 5. `components/Sidebar.tsx` — logout

- Importar `logout` de `@/app/actions/auth`. `Sidebar` sigue siendo Server Component: un Server Component puede renderizar `<form action={serverAction}>` sin `"use client"`.
- Reemplazar el `<a href="#" title="Cerrar sesión">` por `<form action={logout}>` conteniendo `<button type="submit" title="Cerrar sesión" className="...">` con las mismas clases (`flex size-8 flex-none items-center justify-center rounded-[10px] bg-canvas text-soft`) y el mismo `<Icon name="logout" className="size-4" />` dentro.
- Agregar `type="submit"` explícito y `cursor-pointer` si hace falta; nada más del bloque de avatar/nombre/rol se modifica.
- **Verificación:** desde `/` o `/kids`, el ícono cierra sesión y lands en `/login`. Recargar `/` después muestra el feed otra vez (la protección todavía no está activa).

### 6. `proxy.ts` — protección optimista de rutas

- Agregar `NextResponse` al import de `next/server` (hoy solo está `import type { NextRequest }`).
- Declarar arriba del archivo: `const PUBLIC_ROUTES = ["/login", "/activate-account"];`
- El chequeo va **después** del `await supabase.auth.getClaims()` que ya existe, sin ninguna línea en medio entre `createClient` y `getClaims()` (la doc de Supabase advierte que código en ese medio causa deslogueos aleatorios).
- Lógica: si `data?.claims` es falsy y el pathname no está en `PUBLIC_ROUTES` (comparar por igualdad o por `startsWith(`${route}/`)` para tolerar la barra final), clonar `request.nextUrl`, poner `pathname = "/login"`, y devolver `NextResponse.redirect(url)` **con `redirectResponse.cookies.setAll(supabaseResponse.cookies.getAll())` antes del return**. Devolver el objeto de redirect sin copiar las cookies es el error que corta la sesión.
- Si hay claims o la ruta es pública, se devuelve `supabaseResponse` sin cambios, como hoy.
- Agregar `export const config` con el matcher literal `'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'`. Tiene que ser un literal en el archivo: Next lo analiza en build y descarta variables.
- **Verificación:** sin cookies, `/` y `/kids` caen en `/login`; `/login` y `/activate-account` cargan; con sesión, las seis rutas cargan; el CSS y el JS de una ruta protegida se sirven sin errores 404 ni loop de redirect.

### 7. `requireUser()` en las cuatro páginas sin params

- Convertir a `async` y llamar `await requireUser()` antes del `return` en `app/page.tsx`, `app/kids/page.tsx`, `app/kids/new/page.tsx` y `app/posts/new/page.tsx`.
- Solo se agrega el import y la llamada. Ningún JSX cambia, así que `/` sigue mostrando el feed con los 3 posts del seed y los formularios siguen igual.
- **Verificación:** `npm run build` pasa; con sesión, las cuatro rutas renderizan; sin sesión, el proxy redirige antes de que la página corra.

### 8. `requireUser()` en las dos páginas `[id]` y limpieza del prerender

- Mismo cambio en `app/kids/[id]/page.tsx` y `app/kids/[id]/parent/page.tsx`: `async`, `await requireUser()` antes del return.
- Borrar el `export function generateStaticParams()` completo de los dos archivos, y el `import { KIDS } from "@/lib/kids"` que queda sin uso. Es obligatorio: con `generateStaticParams` presente, leer cookies hace fallar `npm run build`.
- `await props.params` se mantiene igual: los params siguen siendo una promesa, solo deja de haber samples de build.
- **Verificación:** `npm run build` pasa; `/kids/mateo` y `/kids/mateo/parent` cargan con sesión y rebotan a `/login` sin ella; `grep -rn "generateStaticParams" app/` no devuelve nada.

### 9. Modo de render de las rutas afectadas

- `npm run build` y `npm run lint` en limpio.
- En la tabla de rutas del build, las siete rutas que ahora leen cookies (`/`, `/login`, `/kids`, `/kids/new`, `/kids/[id]`, `/kids/[id]/parent`, `/posts/new`) tienen que aparecer como dinámicas (ƒ) y ninguna como estática prerenderizada (○). Si alguna queda en ○, es que una página se está saltando `requireUser()` o todavía declara `generateStaticParams`.
- `git status --short` no muestra archivos fuera de `lib/supabase/`, `app/`, `components/`, `proxy.ts` y `specs/`. `supabase/migrations/` intacto y la historia de migraciones del proyecto con las mismas dos entradas.

## Acceptance criteria

- [ ] `grep -rn "getSession(" lib/ app/` no devuelve resultados: la verificación de sesión usa `getClaims()` en los tres lugares (proxy, `getSessionClaims`, verificación de la acción).
- [ ] La caja de error del login replica el patrón de `components/AddKidForm.tsx:66-73`: `role="alert"` y clases `bg-alert-bg` / `text-alert-title`; no se agregaron tokens de color nuevos a `app/globals.css`.
- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] Sin cookies de sesión, una visita a `/` termina en `/login`.
- [ ] Sin cookies de sesión, una visita a `/kids`, `/kids/new`, `/kids/<cualquier-id>`, `/kids/<id>/parent` y `/posts/new` termina en `/login`.
- [ ] Con sesión válida, las seis rutas renderizan su contenido actual sin redirección.
- [ ] `/login` y `/activate-account` cargan sin sesión y sin redirección.
- [ ] Con sesión válida, entrar a `/login` redirige a `/` y el formulario no llega a renderizarse.
- [ ] Con `jpisfil@netcloudsensei.com` y la contraseña real, "Iniciar sesión" navega a `/`, las cookies de sesión quedan escritas y un reload de `/` no vuelve a `/login`.
- [ ] Con un email existente y una contraseña incorrecta, no navega, muestra "No pudimos iniciar sesión. Revisá tu email y contraseña." y el campo de email conserva lo tipeado.
- [ ] Con un email inexistente y una contraseña cualquiera, se muestra el mismo mensaje genérico, sin distinguir el caso del anterior.
- [ ] Enviar el formulario con los campos vacíos no dispara la Server Action: los dos inputs son `required`.
- [ ] Mientras la acción corre, el botón queda deshabilitado y muestra "Iniciando…".
- [ ] El ícono "Cerrar sesión" de la Sidebar es un `<form action>` con `<button type="submit">`, no un `<a href="#">`.
- [ ] Clickear "Cerrar sesión" borra la sesión, lands en `/login` y `/` vuelve a redirigir a `/login`.
- [ ] Ninguna de las dos páginas `app/kids/[id]/*` declara `generateStaticParams`.
- [ ] `app/login/page.tsx` y las seis páginas protegidas no contienen llamadas a `supabase.from(...)`: este spec no lee ninguna tabla.
- [ ] La historia de migraciones del proyecto sigue teniendo exactamente dos entradas; no se crea ningún archivo en `supabase/migrations/`.
- [ ] `app/login/page.tsx` ya no muestra `caro@opendaycare.com`: los dos inputs arrancan vacíos.
- [ ] Recargar una ruta protegida con sesión válida carga CSS y JS sin errores de assets ni loop de redirección.
- [ ] La consola del navegador no muestra errores ni warnings en el recorrido `/login` → login exitoso → `/` → cerrar sesión → `/login`.

## Decisions

- **Sí:** verificación en dos capas, `proxy.ts` más `requireUser()` en cada página. La guía de Next 16 dice que Proxy es chequeo optimista y que la mayoría de las verificaciones debe estar cerca de la fuente de datos; Supabase pone lo mismo. Con las dos capas, un fallo del proxy no abre la app.
- **Sí:** `getClaims()` y nunca `getSession()`. `getSession()` lee la cookie sin revalidar y la doc de Supabase lo prohíbe explícitamente en código de servidor. `getClaims()` verifica la firma en cada llamada.
- **Sí:** `/login` y `/activate-account` como únicas rutas públicas, declaradas en una constante `PUBLIC_ROUTES` dentro de `proxy.ts`. Una sola fuente de verdad; el `matcher` se queda con literales porque Next exige que sea analizable en build.
- **Sí:** redirect simple a `/login`, sin `?next=`. Es el patrón de la guía oficial de Supabase y evita validar un parámetro que puede convertirse en open redirect.
- **Sí:** con sesión válida, `/login` redirige a `/`. Evita mostrar el formulario a quien ya entró.
- **Sí:** `requireUser()` en cada una de las seis páginas, en vez de un route group `app/(app)/`. El route group es más limpio a futuro, pero mueve seis archivos y cambia los tipos de ruta generadas (`PageProps<"/kids/[id]">` pasa a `PageProps<"/(app)/kids/[id]">`). El diff chico y explícito vale más ahora.
- **Sí:** eliminar `generateStaticParams()` de las dos páginas `[id]`. Al leer cookies dejan de poder prerenderizarse, y la doc de Next 16 avisa que el build falla si una ruta con `generateStaticParams` accede a datos de runtime. Hoy los datos vienen del mock `KIDS`, así que el prerender no aportaba nada.
- **Sí:** Server Action en `app/actions/auth.ts` y no en `app/login/actions.ts`. `logout` lo consume la Sidebar, que se renderiza en rutas distintas a `/login`.
- **Sí:** `useActionState` con un único mensaje genérico. Distinguir `invalid_credentials` de `email_not_confirmed` confirma al atacante que una cuenta existe con ese email.
- **Sí:** inputs no controlados con `name` y `required` en vez de `useState`. El `required` nativo bloquea el envío vacío sin una petición de red, y tras un error el navegador conserva lo tipeado.
- **Sí:** la Sidebar sigue mostrando el mock `SIDEBAR.user`. Leer el perfil real exige una policy RLS y es un spec aparte.
- **Sí:** `lib/database.types.ts` no se genera. Sin consultas a tablas no hay tipos que usar, y sumarlos ahora es ruido.
- **No:** signup, invitaciones, activación real y recuperación de contraseña. `/activate-account` y "¿Olvidaste tu contraseña?" quedan exactamente como están.
- **No:** rutas por rol. Todo usuario autenticado entra por `/`, como fijó SPEC 03.
- **No:** refresh token customization, remember-me ni expiración de sesión.
- **No:** logout en las rutas full-screen sin Sidebar (`/kids/new`, `/kids/[id]/parent`, `/posts/new`). Se cierres sesión desde el feed, que es donde está la Sidebar.

## Risks

| Risk | Mitigation |
| --- | --- |
| El redirect del proxy se lleva las cookies renovadas y la sesión termina antes de tiempo | La respuesta de redirect se construye con `NextResponse.redirect(url)` y se le copian las cookies con `supabaseResponse.cookies.getAll()` antes de retornarla, tal como exige la guía oficial. Si se devuelve un objeto nuevo sin copiar cookies, el usuario aparece deslogueado en la request siguiente. |
| Loop de redirección si `/login` no queda en la lista de públicas | La lista es una constante explícita y el criterio de aceptación obliga a que `/login` cargue sin sesión. |
| El POST de logout pasa por el proxy, que refresca la sesión justo antes de que la action la borre | Se verifica end-to-end con la cuenta staff: tras cerrar sesión no debe quedar cookie de sesión y `/` debe redirigir a `/login`. Si las cookies sobreviven, el arreglo es hacer `signOut()` y construir la respuesta sin reescribir cookies, no cambiar el ícono. |
| El proxy también corre sobre rutas prefetcheadas, así que un redirect puede disparar navegación antes de que el usuario cliquee | Es el comportamiento documentado de Proxy y la razón por la que existe `requireUser()`: el DAL es la defensa real. La sesión válida no produce redirect, así que el efecto solo aparece sin sesión, que es justo cuando redirigir es lo correcto. |
| Usar `getSession()` por costumbre devolvería claims del JWT sin revalidar | La spec lo prohíbe explícitamente y los dos helpers usan `getClaims()`. El criterio de aceptación no lo cubre, pero el review del diff sí. |
| La Sidebar muestra un nombre mock mientras la sesión real es otra persona | Aceptado y declarado en el scope. Se resuelve cuando exista el spec de RLS que permita leer `public.users`. |
| `useActionState` re-renderiza el client component y puede pisar lo tipeado | Los inputs no controlados conservan su valor en el re-render. Se verifica en el criterio de aceptación del email mal escrito. |
| Un logout en las rutas sin Sidebar no es alcanzable | Fuera de alcance y anotado en el scope. Ninguna de esas rutas es un destino de navegación prolonged. |

## What is **not** in this spec

- Registro, invitaciones, activación real de cuenta y recuperación de contraseña.
- Cualquier lectura de `public.users`, policies RLS, autorización por tenant o rutas por rol.
- `lib/database.types.ts` y los tipos generados de TypeScript.
- Google/OAuth, magic link, login por teléfono y 2FA.
- `?next=` y retorno a la ruta original tras el login.
- Route group `app/(app)/` y layout protegido.
- Logout en `/kids/new`, `/kids/[id]/parent` y `/posts/new` (no tienen Sidebar).
- El feed de familia.
- Cambios en la base de datos de cualquier tipo.

Cada uno de esos, si llega, va en su propio spec.
