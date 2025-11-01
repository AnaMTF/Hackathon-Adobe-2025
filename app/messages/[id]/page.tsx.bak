"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CHATS, CONVERSATIONS, Msg } from "../data";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  useEffect(() => {
    // ensure the page scrolls to bottom if needed in real app
  }, [id]);

  const chat = CHATS.find((c) => c.id === id);
  const messages: Msg[] = CONVERSATIONS[id ?? ""] ?? [];

  // local editable copy so UI can append new messages client-side
  const [localMessages, setLocalMessages] = useState<Msg[]>(messages);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<string>(() =>
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") ?? "light" : "light"
  );

  // keep localMessages in sync when id changes (navigating between chats)
  useEffect(() => {
    setLocalMessages(messages);
  }, [id]);

  // observe theme changes (data-theme attribute) so bubble color can adapt
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setTheme(el.getAttribute("data-theme") ?? "light");
    });
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // helper: scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const newMsg: Msg = {
      id: String(now.getTime()),
      from: "me",
      text,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    } as Msg;
    setLocalMessages((s) => [...s, newMsg]);
    setInputText("");
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((t) => t + emoji);
    setShowEmojiPicker(false);
  };

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
      <header className="sticky top-16 z-30 w-full border-b border-base-300 bg-base-100 shadow-sm backdrop-blur-sm">
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
      <div className="max-w-3xl mx-auto flex flex-col gap-3 pb-24">
            {localMessages.map((m) => (
              <div key={m.id} className={m.from === "me" ? "chat chat-end" : "chat chat-start"}>
                {/* avatar */}
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {/* use a simple initials avatar fallback */}
                    <img
                      alt={m.from === "me" ? "You" : chat.name}
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        m.from === "me" ? "You" : chat.name
                      )}&background=fff&color=000&size=128`}
                    />
                  </div>
                </div>

                {/* header with name and time */}
                <div className="chat-header">
                  {m.from === "me" ? "You" : chat.name}
                  <time className="text-xs opacity-50 ml-2">{m.time}</time>
                </div>

                {/* bubble with color classes */}
                <div
                  className={`chat-bubble ${
                    m.from === "me"
                      ? "chat-bubble-primary text-primary-content"
                      : `chat-bubble-neutral ${theme === "light" ? "text-white" : "text-base-content"}`
                  }`}
                >
                  {m.text}
                </div>

                {/* footer/status */}
                <div className="chat-footer opacity-50">{m.from === "me" ? "Delivered" : ""}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
      </div>

      <footer className="sticky bottom-0 z-40 border-t border-base-300 bg-base-100 shadow-sm backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-3xl flex gap-2 items-end">
          <div className="relative">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowEmojiPicker((s) => !s)}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiSelect={handleEmojiSelect}>
                  <EmojiPicker.Header>
                    <EmojiPicker.Input placeholder="Search emoji" />
                  </EmojiPicker.Header>
                  <EmojiPicker.Group>
                    <EmojiPicker.List />
                  </EmojiPicker.Group>
                </EmojiPicker>
              </div>
            )}
          </div>

          <input
            className="input input-bordered flex-1"
            placeholder="Write a message..."
            aria-label="Write a message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </footer>
    </main>
  );
}
