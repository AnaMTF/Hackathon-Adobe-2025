"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";
import { useAuth } from "../../contexts/AuthContext";

type UserStatus = "online" | "away" | "busy" | "offline";

type User = {
  uuid: string;
  numeFullName: string;
  email: string;
  poza?: string;
  status?: UserStatus;
};

type Message = {
  uuid: string;
  senderUuid: string;
  recipientUuid: string;
  text: string;
  readAt: string | null;
  createdAt: string;
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const partnerId = params?.id as string | undefined;

  const [partner, setPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);
  const [theme, setTheme] = useState<string>(() =>
    typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") ?? "light" : "light"
  );

  // Fetch partner info
  useEffect(() => {
    if (!partnerId) return;
    
    async function fetchPartner() {
      try {
        const response = await fetch(`/api/users/${partnerId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Partner data received:', data); // Debug log
          if (data.success && data.data.user) {
            setPartner(data.data.user);
          } else if (data.success && data.data) {
            // Handle case where user data is directly in data
            setPartner(data.data);
          } else {
            console.error('Unexpected partner data structure:', data);
          }
        } else {
          console.error('Failed to fetch partner:', response.status);
        }
      } catch (error) {
        console.error('Error fetching partner:', error);
      }
    }
    
    fetchPartner();
  }, [partnerId]);

  // Mark unread messages as read
  const markMessagesAsRead = useCallback(async (msgs: Message[]) => {
    if (!user) return;
    
    const unreadMessages = msgs.filter(m => m.recipientUuid === user.uuid && !m.readAt);
    
    for (const msg of unreadMessages) {
      try {
        await fetch(`/api/messages/${msg.uuid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-read' })
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  }, [user]);

  // Fetch messages
  useEffect(() => {
    if (!user?.uuid || !partnerId) return;
    
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messages?user=${user!.uuid}&with=${partnerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.messages) {
            // Sort messages by createdAt ascending (oldest first)
            const sortedMessages = [...data.data.messages].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMessages);
            // Mark messages as read
            markMessagesAsRead(sortedMessages);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    
    fetchMessages();
  }, [user, partnerId, markMessagesAsRead]);

  // Setup SSE for real-time messages + polling fallback
  useEffect(() => {
    if (!user?.uuid || !partnerId) return;

    let eventSource: EventSource | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    // Try to establish SSE connection
    try {
      console.log('Setting up SSE connection for user:', user.uuid, 'in conversation with:', partnerId);
      eventSource = new EventSource('/api/messages/sse');
      
      eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully');
      };
      
      const handleMessage = (event: MessageEvent) => {
        console.log('📨 SSE RAW event received:', event);
        console.log('📨 SSE event data:', event.data);
        
        // Skip heartbeat messages
        if (event.data.includes('heartbeat')) {
          console.log('💓 Heartbeat received');
          return;
        }
        
        try {
          const data = JSON.parse(event.data);
          console.log('📨 SSE parsed data:', data);
          
          if (data.type === 'connected') {
            console.log('✅ SSE connection confirmed');
            return;
          }
          
          if (data.type === 'messageCreated') {
            console.log('📬 New message event received, message data:', data.data);
            const messageData = data.data;
            
            // Check if this message is relevant to the current conversation
            const isRelevant = 
              (messageData.senderUuid === user.uuid && messageData.recipientUuid === partnerId) ||
              (messageData.senderUuid === partnerId && messageData.recipientUuid === user.uuid);
            
            console.log('🔍 Is message relevant to this conversation?', isRelevant, {
              messageSender: messageData.senderUuid,
              messageRecipient: messageData.recipientUuid,
              currentUser: user.uuid,
              chatPartner: partnerId
            });
            
            if (isRelevant) {
              console.log('✅ Message is relevant, refreshing messages...');
              refreshMessages();
            }
          }
          
          if (data.type === 'userStatusChanged' || data.type === 'user-status-changed') {
            console.log('👤 User status changed event');
            // Refresh partner info to update status
            fetch(`/api/users/${partnerId}`)
              .then(res => res.json())
              .then(fetchData => {
                if (fetchData.success && fetchData.data.user) {
                  setPartner(fetchData.data.user);
                }
              })
              .catch(console.error);
          }
        } catch (error) {
          console.error('❌ Error parsing SSE event:', error, 'Raw data:', event.data);
        }
      };

      eventSource.onmessage = handleMessage;

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('SSE readyState:', eventSource?.readyState);
      };
    } catch (error) {
      console.error('❌ Failed to create SSE connection:', error);
    }

    // Polling fallback - check for new messages every 3 seconds
    const refreshMessages = async () => {
      try {
        const response = await fetch(`/api/messages?user=${user.uuid}&with=${partnerId}`);
        if (response.ok) {
          const fetchData = await response.json();
          if (fetchData.success && fetchData.data.messages) {
            const sortedMessages = [...fetchData.data.messages].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            if (sortedMessages.length !== lastMessageCountRef.current) {
              console.log('🔄 Messages changed, updating UI');
              lastMessageCountRef.current = sortedMessages.length;
              setMessages(sortedMessages);
              markMessagesAsRead(sortedMessages);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    };

    pollingInterval = setInterval(refreshMessages, 3000);
    console.log('⏱️ Polling fallback activated (every 3 seconds)');

    return () => {
      console.log('🔌 Cleaning up: Closing SSE and stopping polling');
      if (eventSource) {
        eventSource.close();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [user, partnerId, markMessagesAsRead]);

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
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !user || !partnerId || isSending) return;
    
    setIsSending(true);
    try {
      const requestBody = {
        action: 'create',
        fields: {
          senderUuid: user.uuid,
          recipientUuid: partnerId,
          text
        }
      };
      console.log('Sending message with body:', requestBody);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        data = {};
      }
      
      console.log('Parsed response data:', data);

      if (response.ok) {
        if (data.success && data.data) {
          // Always refetch to ensure we have the latest messages
          await refetchMessages();
        } else {
          console.error('Unexpected response structure:', data);
          // Refetch messages as fallback
          await refetchMessages();
        }
      } else {
        console.error('Response not OK:', response.status, data);
        await refetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      await refetchMessages();
    } finally {
      setIsSending(false);
    }
  };

  const refetchMessages = async () => {
    if (!user || !partnerId) return;
    
    try {
      const refreshResponse = await fetch(`/api/messages?user=${user.uuid}&with=${partnerId}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.data.messages) {
          const sortedMessages = [...refreshData.data.messages].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
        }
      }
      setInputText("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error refetching messages:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((t) => t + emoji);
    setShowEmojiPicker(false);
  };

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Show loading only briefly, then show UI even if partner is null
  const [showLoading, setShowLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!partner && showLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  // Use partner data if available, otherwise use partnerId as fallback
  const displayName = partner?.numeFullName || "User";
  const displayEmail = partner?.email || "";
  const displayStatus = partner?.status || "offline";

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
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
            <div>
              <div className="font-bold">{displayName}</div>
              <div className="text-xs text-neutral">
                {displayEmail && `${displayEmail} • `}{displayStatus}
              </div>
            </div>
          </div>
        </div>
      </header>

    <div className="flex-1 overflow-auto container mx-auto p-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-3 pb-24">
            {messages.length === 0 && (
              <div className="text-center text-neutral py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.filter(m => m && m.uuid && m.senderUuid).map((m) => {
              const isMe = m.senderUuid === user?.uuid;
              const partnerName = partner?.numeFullName || "User";
              return (
              <div key={m.uuid} className={isMe ? "chat chat-end" : "chat chat-start"}>
                {/* avatar */}
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {/* use a simple initials avatar fallback */}
                    <img
                      alt={isMe ? "You" : partnerName}
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        isMe ? "You" : partnerName
                      )}&background=fff&color=000&size=128`}
                    />
                  </div>
                </div>

                {/* header with name and time */}
                <div className="chat-header">
                  {isMe ? "You" : partnerName}
                  <time className="text-xs opacity-50 ml-2">{formatTime(m.createdAt)}</time>
                </div>

                {/* bubble with color classes */}
                <div
                  className={`chat-bubble ${
                    isMe
                      ? "chat-bubble-primary text-primary-content"
                      : `chat-bubble-neutral ${theme === "light" ? "text-white" : "text-base-content"}`
                  }`}
                >
                  {m.text}
                </div>

                {/* footer/status */}
                <div className="chat-footer opacity-50">{isMe ? (m.readAt ? "Read" : "Delivered") : ""}</div>
              </div>
              );
            })}
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

          <button className="btn btn-primary" onClick={sendMessage} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </main>
  );
}
