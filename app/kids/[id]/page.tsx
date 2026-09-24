import { KidProfileLoader } from "@/components/KidProfileLoader";
import { Sidebar } from "@/components/Sidebar";
import { KIDS } from "@/lib/kids";

export function generateStaticParams() {
  return KIDS.map((kid) => ({ id: kid.id }));
}

export default async function KidPage(props: PageProps<"/kids/[id]">) {
  const { id } = await props.params;

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar active="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <KidProfileLoader id={id} />
        </div>
      </main>
    </div>
  );
}