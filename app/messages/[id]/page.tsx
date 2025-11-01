"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CHATS, CONVERSATIONS, Msg } from "../data";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  useEffect(() => {
    // ensure the page scrolls to bottom if needed in real app
  }, [id]);

  const chat = CHATS.find((c) => c.id === id);
  const messages: Msg[] = CONVERSATIONS[id ?? ""] ?? [];

  if (!chat) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Chat not found</p>
          <button
            className="btn btn-sm mt-4"
            onClick={() => router.push("/messages")}
          >
            Back to messages
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 flex flex-col">
      <header className="w-full border-b border-base-300 bg-base-100">
        <div className="container mx-auto flex items-center gap-4 p-3">
          <button
            onClick={() => router.push("/messages")}
            className="btn btn-ghost btn-sm"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {chat.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
            <div>
              <div className="font-bold">{chat.name}</div>
              <div className="text-xs text-neutral">
                {chat.email} • {chat.status}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto container mx-auto p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.from === "me" ? "justify-end" : "justify-start"
              }`}
            >
              {m.from === "them" && (
                <div className="mr-3 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  m.from === "me"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-base-100 text-base-content rounded-tl-none"
                }`}
              >
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-neutral mt-1 text-right">
                  {m.time}
                </div>
              </div>

              {m.from === "me" && <div className="ml-3" />}
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-base-300 bg-base-100 p-4">
        <div className="container mx-auto max-w-3xl flex gap-2">
          <input
            className="input input-bordered flex-1"
            placeholder="Write a message..."
            aria-label="Write a message"
          />
          <button className="btn btn-primary">Send</button>
        </div>
      </footer>
    </main>
  );
}
