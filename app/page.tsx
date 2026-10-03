import { FeedContent } from "@/components/FeedContent";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUserProfile } from "@/lib/users";

export default async function Home() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar userName={profile.fullName} userInitial={profile.initial} />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <FeedContent firstName={profile.firstName} initial={profile.initial} />
        </div>
      </main>
    </div>
  );
}
