"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { POSTS, type Post } from "@/lib/feed";

interface PostsContextValue {
  posts: Post[];
  addPost: (post: Post) => void;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(POSTS);

  const addPost = (post: Post) => {
    setPosts((current) => {
      if (!current.some((existing) => existing.id === post.id)) {
        return [post, ...current];
      }
      let suffix = 2;
      let id = `${post.id}-${suffix}`;
      while (current.some((existing) => existing.id === id)) {
        suffix += 1;
        id = `${post.id}-${suffix}`;
      }
      return [{ ...post, id }, ...current];
    });
  };

  return (
    <PostsContext.Provider value={{ posts, addPost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return ctx;
}