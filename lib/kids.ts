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