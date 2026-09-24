import { FeedContent } from "@/components/FeedContent";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <FeedContent />
        </div>
      </main>
    </div>
  );
}