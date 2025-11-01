"use client";

import { useEffect, useState, useRef } from "react";

type Post = {
  id: string;
  title: string;
  body: string;
  img?: string | null;
  code?: string | null;
  createdAt: number;
  author?: string;
  likes?: string[];
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const loggedInUser = "you"; // simulate logged-in user
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);


  // Load posts from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("feed_posts");
    const arr: Post[] = raw ? JSON.parse(raw) : [];
    setPosts(arr);
  }, []);

  // Listen for new posts in real time
  useEffect(() => {
    const handleFeedUpdate = (e: CustomEvent) => {
      setPosts((prev) => [e.detail, ...prev]);
    };
    window.addEventListener("feed_updated", handleFeedUpdate as EventListener);
    return () =>
      window.removeEventListener("feed_updated", handleFeedUpdate as EventListener);
  }, []);

  useEffect(() => {
  if (editingPost?.img) {
    setImgPreview(editingPost.img);
  } else {
    setImgPreview(null);
  }
}, [editingPost]);

  // Like logic
  const handleLike = (id: string) => {
    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id === id) {
          const alreadyLiked = post.likes?.includes(loggedInUser);
          const newLikes = alreadyLiked
            ? post.likes?.filter((l) => l !== loggedInUser)
            : [...(post.likes || []), loggedInUser];
          return { ...post, likes: newLikes };
        }
        return post;
      });
      localStorage.setItem("feed_posts", JSON.stringify(updated));
      return updated;
    });
  };

  //Handle photo edit
  const handleFileChange = (file: File | null) => {
  if (!file) return setImgPreview(null);
  const reader = new FileReader();
  reader.onload = () => {
    setImgPreview(reader.result as string);
    setEditingPost((prev) => prev && { ...prev, img: reader.result as string });
  };
  reader.readAsDataURL(file);
};


  // Handle edit button click
  const startEdit = (post: Post) => {
    setEditingPost(post);
    setImgPreview(post.img || null);
  };

  // Save edited post
  const handleSaveEdit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingPost) return;

  setPosts((prev) =>
    prev.map((post) =>
      post.id === editingPost.id ? { ...post, ...editingPost } : post
    )
  );

  localStorage.setItem(
    "feed_posts",
    JSON.stringify(
      posts.map((post) =>
        post.id === editingPost.id ? { ...post, ...editingPost } : post
      )
    )
  );

  setEditingPost(null);
};

  return (
    <main className="container mx-auto px-4 py-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Feed</h1>

        {posts.length === 0 && (
          <p className="text-gray-500 text-center">
            No posts yet. Be the first to post!
          </p>
        )}

        {posts.map((post) => {
          const isOwnPost = post.author === loggedInUser || !post.author;
          const likesCount = post.likes?.length || 0;
          const liked = post.likes?.includes(loggedInUser);

          return (
            <div
              key={post.id}
              className="card bg-base-100 shadow-md border rounded-2xl p-5"
            >
              {/* Author and timestamp */}
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-primary">
                  {post.author ?? "You"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Post content */}
              <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
              <p className="mb-3">{post.body}</p>

              {post.img && (
                <div className="overflow-hidden rounded-md border mb-3">
                  <img
                    src={post.img}
                    alt="Post image"
                    className="w-full object-cover max-h-72"
                  />
                </div>
              )}

              {post.code && (
                <div className="mockup-code mb-3 w-full">
                  {post.code.split("\n").map((line, i) => (
                    <pre key={i} data-prefix="$">
                      <code>{line || "\u00A0"}</code>
                    </pre>
                  ))}
                </div>
              )}

              {/* Likes or Edit */}
              <div className="flex justify-between items-center text-sm mt-3">
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={isOwnPost}
                  className={`flex items-center gap-1 text-sm transition ${
                    liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  } ${isOwnPost ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
                  <span>{likesCount}</span>
                </button>

                {isOwnPost && (
                  <button
                    className="btn btn-ghost btn-xs text-primary"
                    onClick={() => startEdit(post)}
                  >
                    Edit Post
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingPost && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black opacity-30"
      onClick={() => setEditingPost(null)}
    />

    {/* Modal content */}
    <div
      className="bg-base-100 p-6 rounded-sm shadow-lg w-full max-w-lg relative z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

      <form onSubmit={handleSaveEdit} className="space-y-4">
        {/* Title */}
        <input
          className="input input-bordered w-full"
          value={editingPost.title}
          onChange={(e) =>
            setEditingPost({ ...editingPost, title: e.target.value })
          }
        />
        {/* Body */}
        <textarea
          className="textarea textarea-bordered w-full h-24 pr-2 pt-1 pb-1 rounded-md"
          value={editingPost.body}
          onChange={(e) =>
            setEditingPost({ ...editingPost, body: e.target.value })
          }
        />
        {/* Code snippet */}
        <textarea
          className="textarea textarea-bordered w-full h-24 pr-2 pt-1 pb-1 rounded-md"
          value={editingPost.code || ""}
          onChange={(e) =>
            setEditingPost({ ...editingPost, code: e.target.value || null })
          }
        />

        {/* Image input */}
        <div>
          <label className="label">
            <span className="label-text">Image (optional)</span>
          </label>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {imgPreview && (
          <div className="mt-3 overflow-hidden rounded-md border">
            <img
              src={imgPreview}
              alt="Preview"
              className="w-full object-cover max-h-60"
            />
          </div>
        )}
      </div>

        {/* Save / Cancel buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditingPost(null)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </main>
  );
}
