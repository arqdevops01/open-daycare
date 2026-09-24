import { type Kid } from "@/lib/kids";

export const POST_TYPES = [
  "food", // Comida
  "nap", // Siesta
  "activity", // Actividad
  "milestone", // Logro
  "mood", // Ánimo
  "photo", // Foto
  "announcement", // Anuncio
] as const;

export type PostType = (typeof POST_TYPES)[number];

export type PostKind = PostType;

export interface Post {
  id: string;
  kind: PostKind;
  author: string;
  avatarInitial: string;
  avatarClasses: string;
  time: string;
  audience: string;
  body: string;
  photoLabel?: string;
  likes: number;
  comments: number;
}

export interface NewPostInput {
  type: PostKind;
  kidIds: string[];
  body: string;
}

export interface SidebarData {
  roomName: string;
  user: {
    name: string;
    role: string;
    initial: string;
  };
}

export interface FeedHeaderData {
  eyebrow: string;
  greeting: string;
  meta: string;
}

export interface KindStyle {
  label: string;
  badge: string;
  dot: string;
  text: string;
}

export const SIDEBAR: SidebarData = {
  roomName: "Sala Soles",
  user: {
    name: "Caro Giménez",
    role: "Maestra · Soles",
    initial: "C",
  },
};

export const FEED_HEADER: FeedHeaderData = {
  eyebrow: "GUARDERÍA · SALA SOLES",
  greeting: "Buenas, Caro",
  meta: "12 niños · martes 17 jun",
};

export const KIND_STYLES: Record<PostKind, KindStyle> = {
  food: {
    label: "COMIDA",
    badge: "bg-pending-badge",
    dot: "bg-pending-ink",
    text: "text-pending-ink",
  },
  nap: {
    label: "SIESTA",
    badge: "bg-nap-badge",
    dot: "bg-nap-ink",
    text: "text-nap-ink",
  },
  milestone: {
    label: "LOGRO",
    badge: "bg-milestone-badge",
    dot: "bg-milestone-ink",
    text: "text-milestone-ink",
  },
  activity: {
    label: "ACTIVIDAD",
    badge: "bg-activity-badge",
    dot: "bg-activity-ink",
    text: "text-activity-ink",
  },
  mood: {
    label: "ÁNIMO",
    badge: "bg-link-chip",
    dot: "bg-link-chip-ink",
    text: "text-link-chip-ink",
  },
  photo: {
    label: "FOTO",
    badge: "bg-allergy-chip",
    dot: "bg-allergy-chip-ink",
    text: "text-allergy-chip-ink",
  },
  announcement: {
    label: "ANUNCIO",
    badge: "bg-announcement-badge",
    dot: "bg-announcement-ink",
    text: "text-announcement-ink",
  },
};

export const POST_TYPE_STYLES: Record<PostType, { label: string; className: string }> = {
  food: { label: "Comida", className: "bg-type-food text-white" },
  nap: { label: "Siesta", className: "bg-type-nap text-type-nap-ink" },
  activity: { label: "Actividad", className: "bg-type-activity text-white" },
  milestone: { label: "Logro", className: "bg-milestone-badge text-milestone-ink" },
  mood: { label: "Ánimo", className: "bg-link-chip text-link-chip-ink" },
  photo: { label: "Foto", className: "bg-allergy-chip text-allergy-chip-ink" },
  announcement: { label: "Anuncio", className: "bg-announcement-badge text-announcement-ink" },
};

export function createPost(input: NewPostInput, kids: Kid[]): Post {
  const kind = input.type;

  if (kind === "announcement") {
    return {
      id: `post-${kind}`,
      kind,
      author: "Anuncio general",
      avatarInitial: "",
      avatarClasses: "bg-announcement-badge text-announcement-ink",
      time: formatTime(new Date()),
      audience: "toda la sala",
      body: input.body,
      likes: 0,
      comments: 0,
    };
  }

  const selectedKids = kids.filter((kid) => input.kidIds.includes(kid.id));
  const firstKid = selectedKids[0];
  const allKidsSelected = selectedKids.length === kids.length;
  const audience = allKidsSelected
    ? "toda la sala"
    : formatAudience(selectedKids.map((kid) => kid.name));

  return {
    id: `post-${slugify(firstKid?.name ?? kind)}`,
    kind,
    author: firstKid?.name ?? "",
    avatarInitial: firstKid?.initial ?? "",
    avatarClasses: firstKid?.avatarClasses ?? "",
    time: formatTime(new Date()),
    audience,
    body: input.body,
    likes: 0,
    comments: 0,
  };
}

function formatAudience(names: string[]): string {
  if (names.length === 0) {
    return "toda la sala";
  }
  if (names.length === 1) {
    return `familia de ${names[0]}`;
  }
  if (names.length === 2) {
    return `familia de ${names[0]} y ${names[1]}`;
  }
  return `familia de ${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function slugify(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const POSTS: Post[] = [
  {
    id: "post-logro",
    kind: "milestone",
    author: "Mateo",
    avatarInitial: "M",
    avatarClasses: "bg-avatar-bg text-avatar-ink",
    time: "14:20",
    audience: "familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  {
    id: "post-actividad",
    kind: "activity",
    author: "Mateo",
    avatarInitial: "M",
    avatarClasses: "bg-avatar-bg text-avatar-ink",
    time: "09:40",
    audience: "familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    likes: 5,
    comments: 2,
  },
  {
    id: "post-anuncio",
    kind: "announcement",
    author: "Anuncio general",
    avatarInitial: "",
    avatarClasses: "bg-announcement-badge text-announcement-ink",
    time: "07:50",
    audience: "toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    comments: 0,
  },
];