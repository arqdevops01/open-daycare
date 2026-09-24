import { KidProfile } from "@/components/KidProfile";
import { Sidebar } from "@/components/Sidebar";
import { KIDS } from "@/lib/kids";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return KIDS.map((kid) => ({ id: kid.id }));
}

export default async function KidPage(props: PageProps<"/kids/[id]">) {
  const { id } = await props.params;
  const kid = KIDS.find((candidate) => candidate.id === id);

  if (!kid) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar active="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <KidProfile kid={kid} />
        </div>
      </main>
    </div>
  );
}