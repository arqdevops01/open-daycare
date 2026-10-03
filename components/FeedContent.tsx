"use client";

import { FeedHeader } from "./FeedHeader";
import { NewPostComposer } from "./NewPostComposer";
import { PostCard } from "./PostCard";
import { usePosts } from "./PostsProvider";

interface FeedContentProps {
  firstName: string;
  initial: string;
}

export function FeedContent({ firstName, initial }: FeedContentProps) {
  const { posts } = usePosts();

  return (
    <>
      <FeedHeader firstName={firstName} />
      <NewPostComposer initial={initial} />
      <div className="mb-[14px] flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-dimmer">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-rule" />
      </div>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}