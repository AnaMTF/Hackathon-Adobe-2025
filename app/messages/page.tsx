"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

type UserStatus = "online" | "away" | "busy" | "offline";

type User = {
  uuid: string;
  numeFullName: string;
  email: string;
  poza?: string;
  status?: UserStatus;
};

type Conversation = {
  partner: User;
  lastMessage: {
    text: string;
    createdAt: string;
    senderUuid: string;
  } | null;
  unreadCount: number;
};

function statusColor(s: UserStatus) {
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
  const { user } = useAuth();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const inputRef = useRef<HTMLDivElement | null>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user?.uuid) return;
    
    async function fetchConversations() {
      try {
        const response = await fetch(`/api/messages/conversations?user=${user!.uuid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.conversations) {
            setChats(data.data.conversations);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    }
    
    fetchConversations();
  }, [user]);

  // Search all users
  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.users) {
            const filtered = data.data.users.filter((u: User) => u.uuid !== user?.uuid);
            setSearchResults(filtered);
          }
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, user]);

  // Update unread count for header
  useEffect(() => {
    const unread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
    try {
      localStorage.setItem("unread_messages", String(unread));
    } catch {
      // Ignore localStorage errors
    }
  }, [chats]);

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!user?.uuid) return;

    const eventSource = new EventSource('/api/messages/sse');
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Messages list SSE event:', data);
        
        if (data.type === 'messageCreated' || data.type === 'unreadCountUpdate') {
          console.log('Message or unread count update, refreshing conversations...');
          // Refresh conversations when new message arrives or unread count changes
          fetch(`/api/messages/conversations?user=${user.uuid}`)
            .then(res => res.json())
            .then(fetchData => {
              if (fetchData.success && fetchData.data.conversations) {
                setChats(fetchData.data.conversations);
              }
            })
            .catch(console.error);
        }
        
        if (data.type === 'userStatusChanged') {
          console.log('User status changed, refreshing conversations...');
          // Refresh conversations to update status indicators
          fetch(`/api/messages/conversations?user=${user.uuid}`)
            .then(res => res.json())
            .then(fetchData => {
              if (fetchData.success && fetchData.data.conversations) {
                setChats(fetchData.data.conversations);
              }
            })
            .catch(console.error);
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onmessage = handleMessage;

    return () => eventSource.close();
  }, [user]);

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

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

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

              {showResults && searchResults.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full bg-base-100 border border-base-200 rounded-md shadow-lg max-h-64 overflow-auto">
                  {searchResults.map((r) => (
                    <li
                      key={r.uuid}
                      className="p-3 hover:bg-base-200 cursor-pointer"
                      onClick={() => {
                        router.push(`/messages/${r.uuid}`);
                        setShowResults(false);
                        setQuery("");
                      }}
                    >
                      <div className="font-medium">{r.numeFullName}</div>
                      <div className="text-xs text-neutral">{r.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="divide-y divide-base-200">
            {chats.length === 0 && (
              <div className="p-8 text-center text-neutral">
                <p>No conversations yet. Search for colleagues above to start chatting!</p>
              </div>
            )}
            {chats.map((c) => (
              <div key={c.partner.uuid} className="block">
                <div
                  onClick={() => router.push(`/messages/${c.partner.uuid}`)}
                  className="flex items-center gap-4 p-4 hover:bg-base-200 cursor-pointer"
                >
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                        {c.partner.numeFullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    </div>

                    {/* status ping (animated) */}
                    <span className={`absolute bottom-0 right-0 inline-flex h-3 w-3 rounded-full ${statusColor(c.partner.status || 'offline')}`} style={{ opacity: 0.9 }} />
                    <span className={`absolute bottom-0 right-0 inline-flex h-3 w-3 rounded-full ${statusColor(c.partner.status || 'offline')} animate-ping`} style={{ opacity: 0.9 }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`${c.unreadCount > 0 ? "font-bold" : "font-medium"}`}>{c.partner.numeFullName}</div>
                      <div className="flex items-center gap-2">
                        {c.unreadCount > 0 && <span className="inline-block h-2 w-2 rounded-full bg-accent animate-bounce" aria-hidden />}
                        <div className="text-xs text-neutral">{c.lastMessage ? formatTime(c.lastMessage.createdAt) : ''}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted mt-1 line-clamp-1">{c.lastMessage?.text || 'No messages yet'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
