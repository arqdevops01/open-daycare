import { LoginForm } from "@/components/LoginForm";
import { Icon } from "@/components/Icon";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-paper grid-cols-[1.05fr_1fr]">
      <div className="relative flex overflow-hidden flex-col justify-between bg-[linear-gradient(155deg,var(--color-hero-grad-a)_0%,var(--color-brand-gradient-b)_45%,var(--color-hero-grad-c)_100%)] px-[60px] py-14 text-white">
        <div className="pointer-events-none absolute -top-[140px] -right-[120px] size-[420px] rounded-full bg-white/12" />
        <div className="pointer-events-none absolute -bottom-[110px] -left-[80px] size-[300px] rounded-full bg-white/10" />

        <div className="relative flex items-center gap-[13px]">
          <div className="flex size-[46px] items-center justify-center rounded-[14px] bg-white/22">
            <Icon name="sun" className="size-[26px]" />
          </div>
          <span className="font-display text-[21px] font-semibold tracking-[0.5px]">
            OpenDayCare
          </span>
        </div>

        <div className="relative">
          <h1 className="mb-[18px] font-display text-[42px] leading-[1.12] font-semibold">
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p className="m-0 max-w-[430px] text-[17px] leading-[1.6] text-white/92">
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        <div className="relative text-[14px] text-white/90">
          🌿 Guardería Sala Soles
        </div>
      </div>

      <div className="flex items-center justify-center p-10">
        <LoginForm />
      </div>
    </div>
  );
}