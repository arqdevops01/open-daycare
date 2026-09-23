import { Icon } from "./Icon";
import { SIDEBAR } from "@/lib/feed";

export function NewPostComposer() {
  return (
    <a
      href="#"
      className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-line bg-card px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,.4)]"
    >
      <div className="flex size-10 flex-none items-center justify-center rounded-full bg-brand-gradient-b font-display text-[16px] font-semibold text-white">
        {SIDEBAR.user.initial}
      </div>
      <span className="flex-1 text-[15px] text-muted">
        Compartí un momento…
      </span>
      <span className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-camera-bg text-action">
        <Icon name="camera" className="size-[19px]" />
      </span>
    </a>
  );
}