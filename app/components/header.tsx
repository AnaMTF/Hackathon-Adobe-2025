"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // read unread count from localStorage (set by messages page)
  useEffect(() => {
    try {
      const val = localStorage.getItem('unread_messages');
      if (val) setUnreadCount(Number(val));
    } catch (e) {}
  }, []);
  return (
    <header className="w-full border-b border-base-300 bg-base-200">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm gap-2 items-center">
            <Image src="/assets/logo.jpeg" alt="logo" width={36} height={36} className="rounded-full" />
            <span className="font-semibold">XIAT</span>
          </button>
        </div>

        <nav className="flex items-center gap-3">
          <a className="btn btn-ghost btn-sm" href="/feed">Feed</a>
          <a className="btn btn-ghost btn-sm" href="/calendar">Calendar</a>

          <a className="btn btn-ghost btn-sm relative" href="/messages" aria-label="Messages">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center">
                <span className="inline-block h-2 w-2 rounded-full bg-error animate-bounce shadow-md" aria-hidden />
                <span className="sr-only">{unreadCount} unread messages</span>
              </span>
            )}
          </a>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
