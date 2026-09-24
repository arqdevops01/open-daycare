export const ROOMS = ["Soles", "Lunas", "Estrellas"] as const;
export type Room = (typeof ROOMS)[number];

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
] as const;

const KID_AVATAR_PALETTE: string[] = [
  "bg-avatar-bg text-avatar-ink",
  "bg-avatar-pink-bg text-avatar-pink-ink",
  "bg-avatar-green-bg text-avatar-green-ink",
  "bg-avatar-yellow-bg text-avatar-yellow-ink",
  "bg-avatar-purple-bg text-avatar-purple-ink",
];

export type ParentStatus = "active" | "pending";

export interface Parent {
  id: string;
  name: string;
  relation: string;
  initial: string;
  avatarClasses: string;
  status: ParentStatus;
}

export interface Kid {
  id: string;
  name: string;
  initial: string;
  avatarClasses: string;
  age: number;
  room: string;
  birthDate: string;
  admission: string;
  allergyChip?: string;
  allergies?: string;
  parents: Parent[];
}

// Sample placeholder values (birth dates, admissions and non-reference parents)
// will be replaced by the future persistence/linking spec.

export interface NewKidInput {
  name: string;
  birthDate: string; // "dd/mm/aaaa" en bruto
  room: Room;
  allergies?: string;
  medicalNotes?: string;
}

export const NEW_PARENT_RELATIONS = ["Mamá", "Papá", "Tutor/a"] as const;
export type NewParentRelation = (typeof NEW_PARENT_RELATIONS)[number];

export interface NewParentInput {
  name: string; // "Diego Fernández"
  email: string; // "correo@ejemplo.com" (solo se valida required; no se guarda)
  relation: NewParentRelation; // "Mamá" | "Papá" | "Tutor/a"
}

const PARENT_AVATAR_PALETTE: string[] = [
  "bg-avatar-bg text-white",
  "bg-avatar-pink-bg text-white",
  "bg-avatar-green-bg text-white",
  "bg-avatar-yellow-bg text-white",
  "bg-avatar-purple-bg text-white",
  "bg-avatar-blue-bg text-white",
];

export function createParent(input: NewParentInput): Parent {
  const name = input.name.trim();
  return {
    id: slugify(name),
    name,
    initial: name.charAt(0).toUpperCase(),
    relation: input.relation,
    avatarClasses: pickParentAvatar(name),
    status: "pending",
  };
}

export function createKid(input: NewKidInput): Kid {
  const name = input.name.trim();
  const [day, month, year] = input.birthDate.split("/").map(Number);
  const birth = new Date(year, month - 1, day);

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  const allergyChip = input.allergies
    ?.split(/[,\s]+/)
    .find(Boolean)
    ?.toUpperCase();

  return {
    id: slugify(name),
    name,
    initial: name.charAt(0).toUpperCase(),
    avatarClasses: pickAvatar(name),
    age,
    room: input.room,
    birthDate: `${birth.getDate()} ${MONTHS[birth.getMonth()]} ${birth.getFullYear()}`,
    admission: `${MONTHS[today.getMonth()]} ${today.getFullYear()}`,
    allergyChip,
    allergies: input.allergies,
    parents: [],
  };
}

function slugify(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pickAvatar(name: string): string {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return KID_AVATAR_PALETTE[hash % KID_AVATAR_PALETTE.length];
}

function pickParentAvatar(name: string): string {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PARENT_AVATAR_PALETTE[hash % PARENT_AVATAR_PALETTE.length];
}

export const KIDS: Kid[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    initial: "M",
    avatarClasses: "bg-avatar-bg text-avatar-ink",
    age: 3,
    room: "Soles",
    birthDate: "12 mar 2022",
    admission: "feb 2025",
    allergyChip: "MANÍ",
    allergies: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    parents: [
      {
        id: "lucia",
        name: "Lucía Fernández",
        relation: "Mamá",
        initial: "L",
        avatarClasses: "bg-avatar-purple-bg text-white",
        status: "active",
      },
      {
        id: "diego",
        name: "Diego Fernández",
        relation: "Papá",
        initial: "D",
        avatarClasses: "bg-avatar-blue-bg text-white",
        status: "pending",
      },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    initial: "S",
    avatarClasses: "bg-avatar-pink-bg text-avatar-pink-ink",
    age: 2,
    room: "Soles",
    birthDate: "10 abr 2024",
    admission: "ene 2025",
    parents: [
      {
        id: "carolina",
        name: "Carolina Méndez",
        relation: "Mamá",
        initial: "C",
        avatarClasses: "bg-avatar-purple-bg text-white",
        status: "active",
      },
    ],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initial: "B",
    avatarClasses: "bg-avatar-green-bg text-avatar-green-ink",
    age: 3,
    room: "Soles",
    birthDate: "22 jul 2022",
    admission: "mar 2024",
    parents: [
      {
        id: "valeria",
        name: "Valeria Ruiz",
        relation: "Mamá",
        initial: "V",
        avatarClasses: "bg-avatar-pink-bg text-white",
        status: "active",
      },
      {
        id: "andres",
        name: "Andrés Ruiz",
        relation: "Papá",
        initial: "A",
        avatarClasses: "bg-avatar-green-bg text-white",
        status: "pending",
      },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    avatarClasses: "bg-avatar-yellow-bg text-avatar-yellow-ink",
    age: 2,
    room: "Soles",
    birthDate: "5 sep 2023",
    admission: "ago 2024",
    parents: [],
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    initial: "T",
    avatarClasses: "bg-avatar-purple-bg text-avatar-purple-ink",
    age: 3,
    room: "Soles",
    birthDate: "30 nov 2022",
    admission: "feb 2024",
    allergyChip: "LACTOSA",
    parents: [
      {
        id: "paula",
        name: "Paula Díaz",
        relation: "Mamá",
        initial: "P",
        avatarClasses: "bg-avatar-yellow-bg text-white",
        status: "active",
      },
    ],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    avatarClasses: "bg-avatar-pink-bg text-avatar-pink-ink",
    age: 2,
    room: "Soles",
    birthDate: "18 ene 2024",
    admission: "may 2024",
    parents: [
      {
        id: "martina",
        name: "Martina Castro",
        relation: "Mamá",
        initial: "M",
        avatarClasses: "bg-avatar-purple-bg text-white",
        status: "active",
      },
    ],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    avatarClasses: "bg-avatar-bg text-avatar-ink",
    age: 3,
    room: "Soles",
    birthDate: "14 jun 2022",
    admission: "ene 2024",
    parents: [
      {
        id: "gaston",
        name: "Gastón Romero",
        relation: "Papá",
        initial: "G",
        avatarClasses: "bg-avatar-blue-bg text-white",
        status: "active",
      },
    ],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    avatarClasses: "bg-avatar-green-bg text-avatar-green-ink",
    age: 2,
    room: "Soles",
    birthDate: "9 mar 2024",
    admission: "oct 2024",
    parents: [
      {
        id: "florencia",
        name: "Florencia Vega",
        relation: "Mamá",
        initial: "F",
        avatarClasses: "bg-avatar-pink-bg text-white",
        status: "active",
      },
    ],
  },
];