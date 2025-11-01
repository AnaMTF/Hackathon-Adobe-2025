"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  
  // Initialize state with localStorage value
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('unread_messages');
        return val ? Number(val) : 0;
      }
    } catch {
      return 0;
    }
    return 0;
  });

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'unread_messages' && e.newValue) {
        setUnreadCount(Number(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render auth-dependent UI while loading
  if (loading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-base-300 bg-base-200 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm gap-2 items-center">
              <Image src="/assets/logo.jpeg" alt="logo" width={36} height={36} className="rounded-full" />
              <span className="font-semibold">XIAT</span>
            </button>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-300 bg-base-200 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm gap-2 items-center">
            <Image src="/assets/logo.jpeg" alt="logo" width={36} height={36} className="rounded-full" />
            <span className="font-semibold">XIAT</span>
          </button>
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link className="btn btn-ghost btn-sm" href="/feed">Feed</Link>
              <Link className="btn btn-ghost btn-sm" href="/fun-activities">Fun Corner</Link>
              <Link className="btn btn-ghost btn-sm" href="/calendar">Calendar</Link>
              
              <Link className="btn btn-ghost btn-sm relative" href="/messages" aria-label="Messages">
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-error animate-bounce shadow-md" aria-hidden />
                    <span className="sr-only">{unreadCount} unread messages</span>
                  </span>
                )}
              </Link>

              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                  {user.poza ? (
                    <Image 
                      src={user.poza} 
                      alt={user.numeFullName} 
                      width={24} 
                      height={24} 
                      className="rounded-full" 
                    />
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-6">
                        <span className="text-xs">{user.numeFullName?.charAt(0) || user.email?.charAt(0) || '?'}</span>
                      </div>
                    </div>
                  )}
                  <span className="hidden md:inline">{user.numeFullName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}</span>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                  <li><Link href="/user">Profile</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" href="/auth">Login</Link>
              <Link className="btn btn-primary btn-sm" href="/register">Register</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
