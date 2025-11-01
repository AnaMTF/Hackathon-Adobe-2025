"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

// API Post structure
type ApiPost = {
  uuid: string;
  authorUuid: string;
  title: string;
  body: string;
  image?: string | null;
  code?: string | null;
  timestamp: Date | string;
  author?: {
    uuid: string;
    numeFullName: string;
    poza?: string;
    jobTitle?: string;
  };
  likes?: { userUuid: string }[];
  comments?: { userUuid: string; text: string }[];
  favorites?: { userUuid: string }[];
};

// Display Post structure
type Post = {
  id: string;
  title: string;
  body: string;
  img?: string | null;
  code?: string | null;
  createdAt: number;
  author?: string;
  authorName?: string;
  authorPhoto?: string;
  likes?: string[];
};

export default function FeedPage() {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editCode, setEditCode] = useState("");
  const [updating, setUpdating] = useState(false);

  // Transform API post to display format
  const transformApiPost = (apiPost: ApiPost): Post => {
    return {
      id: apiPost.uuid,
      title: apiPost.title,
      body: apiPost.body,
      img: apiPost.image || null,
      code: apiPost.code || null,
      createdAt: new Date(apiPost.timestamp).getTime(),
      author: apiPost.authorUuid,
      authorName: apiPost.author?.numeFullName || "Unknown User",
      authorPhoto: apiPost.author?.poza,
      likes: apiPost.likes?.map((l) => l.userUuid) || [],
    };
  };

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/posts?page=1&limit=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }

      const apiPosts: ApiPost[] = data.data.posts || [];
      const transformedPosts = apiPosts.map(transformApiPost);
      setPosts(transformedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load posts from API on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Like logic - call API
  const handleLike = async (postId: string) => {
    if (!user) {
      setError("You must be logged in to like posts");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const alreadyLiked = post.likes?.includes(user.uuid);
    const action = alreadyLiked ? "unlike" : "like";

    // Optimistic update
    setPosts((prev) => {
      return prev.map((p) => {
        if (p.id === postId) {
          const newLikes = alreadyLiked
            ? p.likes?.filter((l) => l !== user.uuid)
            : [...(p.likes || []), user.uuid];
          return { ...p, likes: newLikes };
        }
        return p;
      });
    });

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          content: {
            userUuid: user.uuid,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update like");
      }

      // Refresh user data to update points
      await refreshUser();

    } catch (err) {
      console.error("Error updating like:", err);
      // Revert optimistic update on error
      setPosts((prev) => {
        return prev.map((p) => {
          if (p.id === postId) {
            const revertedLikes = alreadyLiked
              ? [...(p.likes || []), user.uuid]
              : p.likes?.filter((l) => l !== user.uuid);
            return { ...p, likes: revertedLikes };
          }
          return p;
        });
      });
      setError("Failed to update like");
    }
  };

  //Handle photo edit
  // const handleFileChange = (file: File | null) => {
  //   if (!file) return setImgPreview(null);
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     setImgPreview(reader.result as string);
  //     setEditingPost(
  //       (prev) => prev && { ...prev, img: reader.result as string }
  //     );
  //   };
  //   reader.readAsDataURL(file);
  // };

  // Handle edit button click
  const startEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditCode(post.code || "");
  };

  // Save edited post
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !user) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim(),
          code: editCode || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update post");
      }

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: editTitle, body: editBody, code: editCode || null }
            : p
        )
      );

      setEditingPost(null);
      setEditTitle("");
      setEditBody("");
      setEditCode("");
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditBody("");
    setEditCode("");
  };

  return (
    <main className="container mx-auto px-4 py-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Feed</h1>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-gray-500 text-center">
            No posts yet. Be the first to post!
          </p>
        )}

        {!loading &&
          posts.map((post) => {
            const isOwnPost = user && post.author === user.uuid;
            const likesCount = post.likes?.length || 0;
            const liked = user && post.likes?.includes(user.uuid);

            return (
              <div
                key={post.id}
                className="card bg-base-100 shadow-md border rounded-2xl p-5"
              >
                {/* Author and timestamp */}
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-primary">
                    {post.authorName || "Unknown User"}
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

                {/* Likes and Edit */}
                <div className="flex justify-between items-center text-sm mt-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={!user || !!isOwnPost}
                    className={`flex items-center gap-1 text-sm transition ${
                      liked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    } ${
                      !user || isOwnPost ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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
            onClick={cancelEdit}
          />

          {/* Modal content */}
          <div
            className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-lg relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Body */}
              <div>
                <label className="label">
                  <span className="label-text">Body</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              </div>

              {/* Code snippet */}
              <div>
                <label className="label">
                  <span className="label-text">Code Snippet (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Paste a command or small code snippet"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                />
                {editCode && (
                  <div className="mt-3 mockup-code w-full">
                    {editCode.split("\n").map((line, i) => (
                      <pre key={i} data-prefix="$">
                        <code>{line || "\u00A0"}</code>
                      </pre>
                    ))}
                  </div>
                )}
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelEdit}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${updating ? "loading" : ""}`}
                  disabled={updating}
                >
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
