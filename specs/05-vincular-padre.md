# SPEC 05 — Vincular padre

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 04
> **Date:** 2026-09-24
> **Objective:** Implementar `References/pantallas/vincular-padre.dc.html` como `/kids/[id]/parent` (card full-screen sin sidebar, entrada desde "Vincular otro padre" del perfil) y hacer que «Enviar invitación» agregue el padre como PENDIENTE a la lista en memoria del Context, reutilizando el feedback del perfil: badge PENDIENTE y desaparición del chip VINCULAR.

## Scope

**In:**

- Ruta `/kids/[id]/parent` (`app/kids/[id]/parent/page.tsx`): réplica del mockup, card centrada full-screen sobre `bg-canvas`, sin `Sidebar`, con `generateStaticParams` sobre `KIDS`, `await params` y resolución del niño desde el Context (si no existe, `notFound()`).
- `components/ParentInviteLoader.tsx` (client): busca al niño por `id` en el Context y renderiza el shell de la card (header "Vincular padre · a {nombre}" y CTA) más el formulario; `notFound()` si el niño no existe.
- `components/ParentInviteForm.tsx` (client): inputs NOMBRE DEL PADRE/MADRE (required) y EMAIL (required, `type="email"`), selector PARENTESCO con pills Mamá/Papá/Tutor/a (`useState` default "Mamá") y bloque CÓDIGO DE INVITACIÓN `7K4P9` ("Vence en 7 días", estático). "Enviar invitación" (submit) llama a `addParent` y navega a `/kids/[id]`.
- Context extendido: `KidsProvider` expone `addParent(kidId, input)` que agrega el padre como `status: "pending"` deduplicando su `id` con sufijo numérico si es necesario.
- `lib/kids.ts`: constante `NEW_PARENT_RELATIONS = ["Mamá", "Papá", "Tutor/a"]`, tipo `NewParentInput` y helper `createParent(input)` (slug de id, initial de la primera letra, `avatarClasses` desde una paleta de padres, `status: "pending"`).
- Navegación real: "Vincular otro padre" en `ParentsCard` pasa de `href="#"` a `Link` a `/kids/[id]/parent` (recibe `kid.id` como prop nueva desde `KidProfile`); las X del header navegan a `/kids/[id]`.
- Tokens nuevos en `@theme` de `app/globals.css` (info box, pills de parentesco, borde del código de invitación) e íconos `close` y `send` en `Icon.tsx`.

**Out of scope (for future specs):**

- Envío de correo real con el código ni validación del código de invitación.
- Guardar el email del padre (el modelo `Parent` no tiene ese campo; se descarta hasta persistencia).
- Bloqueo de invitaciones duplicadas, edición o eliminación de un padre vinculado.
- Entrada desde el chip VINCULAR del listado: sigue siendo un `span` inerte que lleva al perfil (decisión explícita del usuario).
- Conversión del padre a `active` (activación de cuenta: SPEC 03 es decorativa) ni persistencia durable.
- Responsive móvil propio: réplica del desktop del template, como `/kids/new`.

## Data model

```ts
// lib/kids.ts — adiciones
export const NEW_PARENT_RELATIONS = ["Mamá", "Papá", "Tutor/a"] as const;
export type NewParentRelation = (typeof NEW_PARENT_RELATIONS)[number];

export interface NewParentInput {
  name: string;       // "Diego Fernández"
  email: string;      // "correo@ejemplo.com" (solo se valida required; no se guarda)
  relation: NewParentRelation; // "Mamá" | "Papá" | "Tutor/a"
}

export function createParent(input: NewParentInput): Parent {
  // id: slug del nombre; initial: primera letra en mayúscula
  // relation: input.relation; status: "pending"
  // avatarClasses: paleta de padres (bg sólido + text-white) rotada por hash del nombre
}
```

```tsx
// components/KidsProvider.tsx — ampliación de contexto
interface KidsContextValue {
  kids: Kid[];
  addKid: (input: NewKidInput) => void;
  addParent: (kidId: string, input: NewParentInput) => void; // busca el kid, crea el padre y lo appendea; dedupe de id con sufijo numérico
}
```

Convenciones: identificadores en inglés (`ParentInviteForm`, `addParent`); textos visibles en español. El `email` se pide por fidelidad al mockup pero no tiene campo en `Parent` — mismo tratamiento que `medicalNotes` en SPEC 04 (pendiente del spec de persistencia).

## Implementation plan

1. **Tokens e íconos (aditivo).** En `app/globals.css`: `--color-info-bg: #e3ecfb` y `--color-info-ink: #3f5694` (info box; el trazo del ícono reusa `announcement-ink`), `--color-pill-bg: #ccd8f4`, `--color-pill-ink: #4e72c8`, `--color-pill-border: #9fb8ec` (pill de parentesco seleccionada), `--color-invite-border: #e6d08a` y `--color-invite-ink: #a88526` (panel del código). En `Icon.tsx` agregar `close` (X, `M18 6 6 18M6 6l12 12`, stroke 2.2) y `send` (avión, `m22 2-7 20-4-9-9-4z` + `M22 2 11 13`).
2. **Modelo y helpers.** En `lib/kids.ts`: `NEW_PARENT_RELATIONS`, `NewParentRelation`, `NewParentInput`, `createParent` y paleta de `avatarClasses` de padres.
3. **Context.** `KidsProvider`: expone `addParent` (busca por `kidId`, appendea `createParent(input)` deduplicando el id como `addKid`).
4. **Ruta `/kids/[id]/parent`.** `ParentInviteForm.tsx` (client): campos requeridos, pills con `useState("Mamá")`, panel `7K4P9` estático, submit → `addParent(kid.id, input)` + `router.push(`/kids/${kid.id}`)`. `ParentInviteLoader.tsx` (client): resuelve el niño desde el Context (o `notFound()`) y monta la card (header con X → `/kids/[id]`, subtítulo "a {nombre}", info box, formulario, CTA). `app/kids/[id]/parent/page.tsx`: shell full-screen (`bg-canvas`, card `max-w-[480px]` igual que `/kids/new`) sin `Sidebar`, con `generateStaticParams` y `await params`.
5. **Entrada desde el perfil.** `ParentsCard` recibe `kidId` (prop desde `KidProfile`) y "Vincular otro padre" pasa a `Link href={`/kids/${kidId}/parent`}`.

## Acceptance criteria

- [ ] `npm run build` y `npm run lint` pasan sin errores.
- [ ] `/kids/[id]/parent` replica `vincular-padre.dc.html`: card centrada full-screen sin sidebar, header "Vincular padre · a {nombre}", info box "Le enviaremos un correo con un código… Solo verá el feed de {nombre}", labels y placeholders exactos (NOMBRE DEL PADRE/MADRE "Ej. Diego Fernández", EMAIL "correo@ejemplo.com", PARENTESCO), panel CÓDIGO DE INVITACIÓN `7K4P9` con "Vence en 7 días", y botón "Enviar invitación".
- [ ] "Vincular otro padre" del perfil navega a `/kids/{id}/parent` (antes era `href="#"`).
- [ ] PARENTESCO inicia con Mamá seleccionada; al clickear se alterna entre Mamá/Papá/Tutor/a con el resaltado del mockup.
- [ ] Con nombre o email vacíos, "Enviar invitación" no agrega ni navega (bloqueo por `required`).
- [ ] Submit válido (ej. Diego Fernández / papá): navega a `/kids/{id}`, el padre aparece en PADRES VINCULADOS con su inicial/avatar, meta "{parentesco} · invitación enviada" y badge PENDIENTE; en `/kids` el niño ya no muestra chip VINCULAR (dejó de tener `parents: []`).
- [ ] Las X del header navegan de vuelta a `/kids/{id}` sin agregar nada.
- [ ] Recargar la página devuelve los 8 niños y padres originales (estado de sesión, sin persistencia).
- [ ] Un `/kids/{id-invalido}/parent` renderiza 404 (`notFound()`).
- [ ] La consola del navegador no muestra errores ni warnings al recorrer `/kids` → perfil → `/kids/[id]/parent` → enviar → perfil.

## Decisions

- **Yes:** `/kids/[id]/parent` — rutas en inglés, consistente con SPEC 02–04.
- **Yes:** agregar el padre como PENDIENTE vía Context (`addParent`) — decisión explícita del usuario; la invitación es funcional dentro de la sesión, con la misma naturaleza que `addKid` de SPEC 04.
- **Yes:** entrada solo desde "Vincular otro padre" del perfil — es el único enlace del mockup; el chip VINCULAR del listado no cambia.
- **Yes:** código `7K4P9` estático y "Vence en 7 días" — réplica del mockup, consistente con SPEC 03; no se genera ni se valida.
- **Yes:** parentesco por defecto Mamá — primera pill ya seleccionada en el mockup.
- **Yes:** card full-screen sin sidebar — precedente de `/kids/new` y SPEC 03.
- **No:** correo real, validación/expiración del código, bloqueo de duplicados, edición/eliminación de padres, ni estado `active` automático.
- **No:** persistir el email — `Parent` no tiene ese campo; pendiente del spec de persistencia (igual que `medicalNotes` en SPEC 04).
- **Nota:** el padre agregado vive solo en sesión; un reload directo sobre `/kids/[id]/parent` de un niño creado en sesión da 404 (consistente con la nota de SPEC 04).

## Risks

| Risk | Mitigation |
| --- | --- |
| Reload directo a `/kids/[id]/parent` de un niño creado en sesión da 404 por perder el Context | Aceptado por diseño (estado de sesión), igual que SPEC 04. |
| Ids duplicados de parents si se invita el mismo nombre dos veces | Dedupe con sufijo numérico en `addParent`, mismo patrón que `addKid`. |
| API Next 16 (parametros dinámicos, `notFound` desde client, `generateStaticParams` con ids de sesión) | Reutilizar el patrón ya verificado de `app/kids/[id]/page.tsx` + `KidProfileLoader`. |
| Drift visual de los nuevos bloques (info box, pills, panel de código) | Tokens declarados en `@theme` y verificación por screenshot contra `vincular-padre.dc.html`. |

## What is **not** in this spec

- Flujo real de invitación (correo, generación/expiración del código, activación).
- Guardar el email del padre ni persistencia durable.
- Bloqueo de duplicados, edición o eliminación de padres vinculados.
- Entrada desde el chip VINCULAR del listado.
- Responsive móvil fuera del template.

Cada uno de esos, si llega, va en su propio spec.