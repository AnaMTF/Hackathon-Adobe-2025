"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
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
          <a className="btn btn-ghost btn-sm" href="/messages">Messages</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
