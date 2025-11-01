<<<<<<< HEAD
"use client";
import { useState } from "react";

const contacts = [
  { id: 1, name: "Alice Smith" },
  { id: 2, name: "Bob Johnson" },
  { id: 3, name: "Charlie Lee" },
];

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState<{ [key: number]: string[] }>({});
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [
        ...(prev[selectedContact.id] || []),
        input
      ]
    }));
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        border: "1px solid #ccc",
        overflow: "hidden"
      }}
    >
      {/* Contacts List */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ddd",
          padding: "1rem",
          height: "100vh",
          overflow: "hidden",
          boxSizing: "border-box"
        }}
      >
        <h2>Contacts</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {contacts.map(contact => (
            <li
              key={contact.id}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                background: selectedContact.id === contact.id ? "#cce4ff" : "transparent", // Darker color
                color: selectedContact.id === contact.id ? "#000" : "inherit",             // Black text when selected
                borderRadius: "8px"
              }}
              onClick={() => setSelectedContact(contact)}
            >
              <strong>{contact.name}</strong>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Window */}
      <div
        style={{
          flex: 1,
          padding: "1rem",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
      >
        <h2>Chat with {selectedContact.name}</h2>
        <div
          style={{
            flex: 1,
            marginBottom: "1rem",
            overflowY: "auto"
          }}
        >
          {(messages[selectedContact.id] || []).map((msg, idx) => (
            <div key={idx} style={{ margin: "0.5rem 0", textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#cce4ff",
                  color: "#003366",    
                  padding: "0.5rem 1rem",
                  borderRadius: "16px"
                }}
              >
                {msg}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          />
          <button
            onClick={handleSend}
            style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "#007bff", color: "#fff" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
=======
﻿"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CHATS, type Chat } from "./data";

function statusColor(s: Chat["status"]) {
  switch (s) {
    case "online":
      return "bg-success";
    case "away":
      return "bg-warning";
    case "busy":
      return "bg-error";
    default:
      return "bg-neutral";
  }
}

export default function Messages() {
  const router = useRouter();
  const [chats] = useState<Chat[]>(CHATS);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);

  // expose unread count for header via localStorage
  useEffect(() => {
    const unread = chats.filter((c) => c.unread).length;
    try {
      localStorage.setItem("unread_messages", String(unread));
    } catch (e) {}
  }, [chats]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Chat[];
    return chats.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [query, chats]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (inputRef.current.contains(e.target)) return;
      // click outside input -> hide
      setShowResults(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>

        <div className="card bg-base-100 shadow-lg">
          <div className="p-4 border-b border-base-200 relative">
            <div className="relative" ref={inputRef}>
              <input
                className="input input-bordered w-full"
                placeholder="Search chats or colleagues"
                aria-label="Search chats"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />

              {showResults && results.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full bg-base-100 border border-base-200 rounded-md shadow-lg max-h-64 overflow-auto">
                  {results.map((r) => (
                    <li
                      key={r.id}
                      className="p-3 hover:bg-base-200 cursor-pointer"
                      onClick={() => router.push(`/messages/${r.id}`)}
                    >
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-neutral">{r.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="divide-y divide-base-200">
            {chats.map((c) => (
              <div key={c.id} className="block">
                <div
                  onClick={() => router.push(`/messages/${c.id}`)}
                  className="flex items-center gap-4 p-4 hover:bg-base-200 cursor-pointer"
                >
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    </div>

                    {/* status ping (animated) */}
                    <span className={`absolute bottom-0 right-0 inline-flex h-3 w-3 rounded-full ${statusColor(c.status)}  opacity: 0.9` } />
                    <span className={`absolute bottom-0 right-0 inline-flex h-3 w-3 rounded-full ${statusColor(c.status)} animate-ping`} style={{ opacity: 0.9 }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`${c.unread ? "font-bold" : "font-medium"}`}>{c.name}</div>
                      <div className="flex items-center gap-2">
                        {c.unread && <span className="inline-block h-2 w-2 rounded-full bg-accent animate-bounce" aria-hidden />}
                        <div className="text-xs text-neutral">2:14 PM</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted mt-1 line-clamp-1">{c.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
>>>>>>> ana
  );
}
