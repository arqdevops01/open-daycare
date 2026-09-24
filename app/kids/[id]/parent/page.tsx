import { ParentInviteLoader } from "@/components/ParentInviteLoader";
import { KIDS } from "@/lib/kids";

export function generateStaticParams() {
  return KIDS.map((kid) => ({ id: kid.id }));
}

export default async function ParentInvitePage(
  props: PageProps<"/kids/[id]/parent">
) {
  const { id } = await props.params;

  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-6 py-10">
      <ParentInviteLoader id={id} />
    </div>
  );
}