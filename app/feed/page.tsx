"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  body: string;
  img?: string | null;
  code?: string | null;
  createdAt: number;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  // Load posts from localStorage when page mounts
  useEffect(() => {
    const raw = localStorage.getItem("feed_posts");
    const arr: Post[] = raw ? JSON.parse(raw) : [];
    setPosts(arr);
  }, []);

  // Listen for newly created posts in real-time
  useEffect(() => {
    const handleFeedUpdate = (e: CustomEvent) => {
      setPosts(prev => [e.detail, ...prev]);
    };
    window.addEventListener("feed_updated", handleFeedUpdate as EventListener);
    return () => window.removeEventListener("feed_updated", handleFeedUpdate as EventListener);
  }, []);

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      {posts.length === 0 && (
        <p className="text-gray-500 text-center">No posts yet. Be the first to post!</p>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="card bg-base-100 shadow p-4">
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <p className="mb-2">{post.body}</p>

            {post.img && (
              <div className="overflow-hidden rounded-md border mb-2">
                <img src={post.img} alt="Post image" className="w-full object-cover max-h-72" />
              </div>
            )}

            {post.code && (
              <div className="mockup-code mb-2 w-full">
                {post.code.split("\n").map((line, i) => (
                  <pre key={i} data-prefix="$">
                    <code>{line || "\u00A0"}</code>
                  </pre>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}