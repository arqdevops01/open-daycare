export type PostKind = "milestone" | "activity" | "announcement";

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
  announcement: {
    label: "ANUNCIO",
    badge: "bg-announcement-badge",
    dot: "bg-announcement-ink",
    text: "text-announcement-ink",
  },
};

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