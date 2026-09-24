# SPEC 03 — Login y activación de cuenta

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-24
> **Objective:** Implementar `References/pantallas/login.dc.html` y `activar-cuenta.dc.html` como las rutas `/login` y `/activate-account`, réplica visual sin backend, sin el selector Personal/Familia y con navegación a `/` al presionar los botones principales.

## Scope

**In:**

- Ruta `/login` (`app/login/page.tsx`): réplica del mockup **sin el bloque "INGRESO COMO"** (Personal/Familia). Split desktop `grid 1.05fr/1fr`: panel izquierdo con gradiente hero, logo `Icon name="sun"`, titular y footer "🌿 Guardería Sala Soles"; formulario a la derecha con email prefilled `caro@opendaycare.com`, contraseña, "¿Olvidaste tu contraseña?" inerte, botón "Iniciar sesión" → `/`, link "Activá tu cuenta" → `/activate-account`.
- Ruta `/activate-account` (`app/activate-account/page.tsx`): réplica completa del mockup. Card "Te invitaron a seguir a Mateo · Sala Soles", código `7K4P9`, email `lucia.fernandez@gmail.com`, contraseña, checkbox de autorización de fotos marcado por defecto y alternable con `useState`, botón "Activar mi cuenta" → `/`, link "Iniciar sesión" → `/login`.
- Componentes client nuevos: `LoginForm` y `ActivateAccountForm` (estado local, sin validación).
- Navegación real solo entre `/login` y `/activate-account`; ambos enlaces cruzados funcionan.
- Tokens nuevos en `@theme` de `app/globals.css` para los colores que aun no existen.
- Sin `Sidebar` ni layout persistente: las dos pantallas son full-screen como en los mockups.

**Out of scope (for future specs):**

- Autenticación real, sesiones, backend y validación de credenciales.
- Selector de rol Personal/Familia (decisión explícita del usuario: no se usa).
- Recuperación de contraseña ("¿Olvidaste tu contraseña?" inerte; no hay pantalla de referencia).
- Flujo real de invitación: el código `7K4P9` es decorativo, no se valida.
- Feed de familia (`familia-feed.dc.html`): no existe en la app; los CTA navegan a `/`.
- Responsive móvil propio: réplica del desktop del template.

## Data model

Este spec no introduce estructuras de datos persistentes. Los valores de ejemplo (email, código de invitación, checkbox marcado) son estado local de los componentes client (`useState`), replicando el mockup. No se crea `lib/`.

## Implementation plan

1. **Tokens de tema (aditivo).** En `app/globals.css` agregar a `@theme`: `--color-paper: #fbf4ec` (fondo de ambas pantallas), `--color-field-border: #eadfd0` (borde de inputs), `--color-field-focus: #f2a78e` (borde del campo enfocado en activación), `--color-success: #5fb97e` (checkbox verificado), `--color-invite-bg: #fbf1d6`, `--color-invite-ink: #8a7234` (panel de autorización), `--color-hero-grad-a: #f6a98e` y `--color-hero-grad-c: #ec7e62` (extremos del gradiente del split; el medio `#f2937a` ya es `brand-gradient-b`). El chip celeste de la card de invitación reusa `avatar-bg`/`avatar-ink`. Paso aditivo, nada se rompe.
2. **`/login`.** Crear `components/LoginForm.tsx` (client) con estado local `email`/`password` (email `defaultValue="caro@opendaycare.com"`), span "¿Olvidaste tu contraseña?" sin navegación, botón CTA como `Link href="/"` y "Activá tu cuenta" como `Link href="/activate-account"`. Crear `app/login/page.tsx`: shell full-screen `bg-paper` con split de 2 columnas (izquierda gradiente, derecha `LoginForm`). Sin bloque de roles.
3. **`/activate-account`.** Crear `components/ActivateAccountForm.tsx` (client): card de invitación, campos prefilled del mockup, checkbox de autorización con `useState` iniciado en `true`, botón "Activar mi cuenta" como `Link href="/"` y "Iniciar sesión" como `Link href="/login"`. Crear `app/activate-account/page.tsx`: shell centrado full-screen `bg-paper` con `ActivateAccountForm`.

## Acceptance criteria

- [x] `npm run build` y `npm run lint` pasan sin errores.
- [x] `/login` replica `login.dc.html` **excepto** el bloque "INGRESO COMO": en su lugar se ve `bg-paper` y el formulario queda centrado, sin vacío entre el titular y el campo EMAIL; no se renderiza ningún botón "Personal" ni "Familia".
- [x] En `/login`, el email muestra `caro@opendaycare.com`, los campos son editables y al clickear "¿Olvidaste tu contraseña?" se permanece en `/login` (no navega).
- [x] "Iniciar sesión" navega a `/` siempre, sin importar los valores ingresados.
- [x] "Activá tu cuenta" en `/login` navega a `/activate-account`.
- [x] `/activate-account` replica `activar-cuenta.dc.html`: card "Te invitaron a seguir a Mateo · Sala Soles", código `7K4P9`, email `lucia.fernandez@gmail.com`, checkbox de autorización marcado por defecto.
- [x] Clickear el checkbox de autorización lo des/marca; el estado marcado usa `#5FB97E`.
- [x] "Activar mi cuenta" navega a `/`; "Iniciar sesión" navega a `/login`.
- [x] La consola del navegador no muestra errores ni warnings al cargar `/login` y `/activate-account`.

## Decisions

- **Yes:** rutas `/login` y `/activate-account` en inglés — consistente con la decisión de rutas del SPEC 02.
- **Yes:** sin selector Personal/Familia; el login apunta fijo a `/` (feed staff) — decisión explícita del usuario; el feed familia es otro spec.
- **Yes:** CTA "Iniciar sesión" y "Activar mi cuenta" navegan sin validar — navegación real como en SPEC 02; la auth real se pospone.
- **Yes:** estado local con `useState` para el checkbox y valores prefilled del mockup — réplica navegable sin lógica de auth.
- **No:** validación de campos, fuerza de contraseña ni verificación del código de invitación — no hay backend que lo respalde.
- **No:** recuperación de contraseña — no existe pantalla de referencia.
- **No:** persistencia/sesión/rol (p.ej. localStorage) — llegará con el flujo de auth real.
- **No:** tocar `Icon.tsx` ni `layout.tsx` — el logo sol ya existe y las fuentes ya están cargadas.

## Risks

| Risk | Mitigation |
| --- | --- |
| Comparación visual de `/login` distinta del mockup por la ausencia del bloque de roles | El criterio de aceptación lo explicita: réplica excepto ese bloque; el verifier no debe exigir que aparezca. |
| Valores prefilled del mockup parecen "datos de usuario reales" | Son estado local decorativo; el spec de auth real los reemplaza. |

## What is **not** in this spec

- Autenticación, sesiones, roles y `localStorage`.
- Selector Personal/Familia en el login.
- Recuperación de contraseña.
- Validación del código de invitación.
- Feed de familia ni flujo completo de activación real.
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.