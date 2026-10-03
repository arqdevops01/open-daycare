import { KidProfileLoader } from "@/components/KidProfileLoader";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUserProfile } from "@/lib/users";

export default async function KidPage(props: PageProps<"/kids/[id]">) {
  const profile = await getCurrentUserProfile();

  const { id } = await props.params;

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar active="kids" userName={profile.fullName} userInitial={profile.initial} />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <KidProfileLoader id={id} />
        </div>
      </main>
    </div>
  );
}