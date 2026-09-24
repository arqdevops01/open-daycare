"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { useKids } from "./KidsProvider";
import { usePosts } from "./PostsProvider";
import {
  POST_TYPES,
  POST_TYPE_STYLES,
  createPost,
  type PostType,
} from "@/lib/feed";

const labelClass =
  "mb-[10px] block text-[12px] font-extrabold tracking-[0.7px] text-soft";

function initialSelection(kids: { id: string }[]): string[] {
  const mateo = kids.find((kid) => kid.id === "mateo-fernandez");
  return mateo ? [mateo.id] : [];
}

export function PostComposerForm() {
  const router = useRouter();
  const { kids } = useKids();
  const { addPost } = usePosts();
  const [selectedType, setSelectedType] = useState<PostType>("food");
  const [selected, setSelected] = useState<string[]>(() => initialSelection(kids));
  const [entireRoom, setEntireRoom] = useState(false);
  const [body, setBody] = useState("");
  const savedPara = useRef<{ selected: string[]; entireRoom: boolean } | null>(null);

  const allKidIds = kids.map((kid) => kid.id);
  const isAnnouncement = selectedType === "announcement";
  const hasRecipient = entireRoom || selected.length > 0;

  const handleTypeChange = (type: PostType) => {
    if (type === "announcement") {
      if (!isAnnouncement) {
        savedPara.current = { selected, entireRoom };
        setEntireRoom(true);
        setSelected(allKidIds);
      }
    } else if (isAnnouncement && savedPara.current) {
      const restored = savedPara.current;
      setEntireRoom(restored.entireRoom);
      setSelected(restored.selected);
      savedPara.current = null;
    }
    setSelectedType(type);
  };

  const toggleKid = (id: string) => {
    if (entireRoom) {
      return;
    }
    setSelected((current) =>
      current.includes(id)
        ? current.filter((kidId) => kidId !== id)
        : [...current, id]
    );
  };

  const toggleEntireRoom = () => {
    if (isAnnouncement) {
      return;
    }
    if (entireRoom) {
      setEntireRoom(false);
    } else {
      setEntireRoom(true);
      setSelected(allKidIds);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !hasRecipient) {
      return;
    }
    const kidIds = entireRoom ? allKidIds : selected;
    addPost(createPost({ type: selectedType, kidIds, body: text }, kids));
    router.push("/");
  };

  const kidChip = (active: boolean, disabled: boolean) =>
    `flex items-center gap-2 rounded-full border-[1.5px] py-[6px] pl-[6px] pr-[14px] text-[14px] font-bold ${
      active ? "border-ink bg-ink text-white" : "border-line bg-card text-nav-ink"
    } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <form
      id="new-post-form"
      onSubmit={handleSubmit}
      className="bg-paper px-[26px] pb-6 pt-6"
    >
      <div className={labelClass}>PARA</div>
      <div className="mb-[22px] flex flex-wrap gap-[9px]">
        {kids.map((kid) => {
          const active = selected.includes(kid.id);
          return (
            <button
              key={kid.id}
              type="button"
              disabled={isAnnouncement}
              onClick={() => toggleKid(kid.id)}
              className={kidChip(active, isAnnouncement)}
            >
              <span
                className={`flex size-[26px] items-center justify-center rounded-full font-display text-[13px] font-semibold ${kid.avatarClasses}`}
              >
                {kid.initial}
              </span>
              {kid.name}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isAnnouncement}
          onClick={toggleEntireRoom}
          className={kidChip(entireRoom, isAnnouncement)}
        >
          Toda la sala
        </button>
      </div>

      <div className={labelClass}>TIPO</div>
      <div className="mb-[22px] flex flex-wrap gap-[9px]">
        {POST_TYPES.map((type) => {
          const style = POST_TYPE_STYLES[type];
          const active = type === selectedType;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`rounded-full px-4 py-2 text-[13.5px] font-extrabold ${style.className} ${
                active ? "ring-2 ring-ink/30" : ""
              }`}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      <div className={labelClass}>DESCRIPCIÓN</div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Contá cómo le fue hoy…"
        required
        className="mb-[22px] w-full min-h-[120px] resize-y rounded-[14px] border-[1.5px] border-field-border bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-ink outline-none focus:border-field-focus"
      />

      <div className={labelClass}>FOTOS</div>
      <div className="flex gap-3">
        <div className="flex size-[96px] items-center justify-center rounded-[14px] border border-line bg-photo-bg text-chevron">
          <Icon name="photo" className="size-[26px]" />
        </div>
        <div className="flex size-[96px] cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[14px] border-[1.5px] border-dashed border-line-dashed bg-photo-bg text-photo-ink">
          <Icon name="plus" className="size-[22px] text-accent-deep" />
          <span className="text-[12px]">Agregar</span>
        </div>
      </div>
    </form>
  );
}