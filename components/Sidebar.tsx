import { Icon, type IconName } from "./Icon";
import { SIDEBAR } from "@/lib/feed";

interface NavItem {
  label: string;
  icon: IconName;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Feed", icon: "home", active: true },
  { label: "Niños", icon: "users" },
  { label: "Avisos", icon: "bell" },
  { label: "Mi cuenta", icon: "user" },
];

const baseNavClass =
  "flex items-center gap-3 rounded-[12px] px-3 py-[11px] text-[14.5px]";
const activeNavClass = "bg-nav-active-bg font-extrabold text-nav-active-ink";
const idleNavClass = "bg-transparent font-semibold text-nav-ink";

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col border-r border-line bg-card px-4 py-6">
      <a href="#" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <div className="flex size-[38px] flex-none items-center justify-center rounded-[12px] bg-linear-to-br from-brand-gradient-a to-brand-gradient-b text-white">
          <Icon name="sun" className="size-[21px]" />
        </div>
        <div>
          <div className="font-display text-[17px] font-semibold leading-none text-ink">
            OpenDayCare
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted">
            {SIDEBAR.roomName}
          </div>
        </div>
      </a>

      <a
        href="#"
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-linear-to-b from-brand-btn-a to-brand-btn-b py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,.75)]"
      >
        <Icon name="plus" className="size-[17px]" />
        Nueva publicación
      </a>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`${baseNavClass} ${
              item.active ? activeNavClass : idleNavClass
            }`}
          >
            <Icon name={item.icon} className="size-[19px] flex-none" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-[10px] border-t border-line pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <div className="flex size-[38px] flex-none items-center justify-center rounded-full bg-brand-gradient-b font-display text-[16px] font-semibold text-white">
            {SIDEBAR.user.initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-ink">
              {SIDEBAR.user.name}
            </div>
            <div className="text-[12px] text-muted">{SIDEBAR.user.role}</div>
          </div>
          <a
            href="#"
            title="Cerrar sesión"
            className="flex size-8 flex-none items-center justify-center rounded-[10px] bg-canvas text-soft"
          >
            <Icon name="logout" className="size-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}