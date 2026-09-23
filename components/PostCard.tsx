import { Icon } from "./Icon";
import { KIND_STYLES, type Post } from "@/lib/feed";

export function PostCard({ post }: { post: Post }) {
  const kind = KIND_STYLES[post.kind];

  return (
    <article className="rounded-[20px] border border-line bg-card px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,.5)]">
      <header className="mb-[14px] flex items-center gap-3">
        {post.avatarInitial ? (
          <div
            className={`flex size-11 flex-none items-center justify-center rounded-full font-display text-[17px] font-semibold ${post.avatarClasses}`}
          >
            {post.avatarInitial}
          </div>
        ) : (
          <div
            className={`flex size-11 flex-none items-center justify-center rounded-full ${post.avatarClasses}`}
          >
            <Icon name="megaphone" className="size-5" />
          </div>
        )}
        <div className="flex-1">
          <div className="font-display text-[16.5px] font-semibold text-ink">
            {post.author}
          </div>
          <div className="text-[12.5px] text-muted">
            {post.time} · publicado por vos
          </div>
        </div>
        <div
          className={`flex flex-none items-center gap-[7px] rounded-full px-3 py-1.5 ${kind.badge}`}
        >
          <span className={`size-2 rounded-full ${kind.dot}`} />
          <span
            className={`text-[12px] font-extrabold tracking-[0.5px] ${kind.text}`}
          >
            {kind.label}
          </span>
        </div>
      </header>

      <div className="mb-[10px] text-[12.5px] text-muted">
        Para: {post.audience}
      </div>

      <p className="m-0 text-[15.5px] leading-[1.55] text-body">{post.body}</p>

      {post.photoLabel && (
        <a
          href="#"
          className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-line-dashed bg-photo-bg text-photo-ink"
        >
          <Icon name="photo" className="size-[30px]" />
          <span className="text-[13.5px]">{post.photoLabel}</span>
        </a>
      )}

      <footer className="mt-4 flex items-center gap-[18px] border-t border-line-soft pt-[14px]">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-action">
          <Icon name="heart" className="size-[19px]" />
          {post.likes}
        </span>
        <a
          href="#"
          className="flex items-center gap-[7px] text-[14px] font-bold text-soft"
        >
          <Icon name="comment" className="size-[17px]" />
          {post.comments}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-[14px] font-extrabold text-accent-deep">
          Editar
        </a>
      </footer>
    </article>
  );
}