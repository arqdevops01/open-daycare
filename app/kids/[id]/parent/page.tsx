import { ParentInviteLoader } from "@/components/ParentInviteLoader";
import { requireUser } from "@/lib/supabase/session";

export default async function ParentInvitePage(
  props: PageProps<"/kids/[id]/parent">
) {
  await requireUser();

  const { id } = await props.params;

  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-6 py-10">
      <ParentInviteLoader id={id} />
    </div>
  );
}