import { FeedHeader } from "@/components/FeedHeader";
import { NewPostComposer } from "@/components/NewPostComposer";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { POSTS } from "@/lib/feed";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <FeedHeader />
          <NewPostComposer />
          <div className="mb-[14px] flex items-center gap-[14px]">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-dimmer">
              PUBLICADO HOY
            </span>
            <span className="h-px flex-1 bg-rule" />
          </div>
          <div className="flex flex-col gap-4">
            {POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}