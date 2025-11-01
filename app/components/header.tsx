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

  // Points balance (stored in localStorage as 'user_points')
  const [userPoints, setUserPoints] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const v = localStorage.getItem('user_points');
        if (v) return Number(v);
        // default initial points
        localStorage.setItem('user_points', String(5000));
        return 5000;
      }
    } catch {
      return 5000;
    }
    return 5000;
  });

  // Cart item count (stored in localStorage as 'cart_items')
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('cart_items');
        if (!raw) return 0;
        const arr = JSON.parse(raw) as Array<{ id: string; qty: number }>;
        return arr.reduce((s, it) => s + (it.qty || 0), 0);
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
      if (e.key === 'user_points' && e.newValue) {
        setUserPoints(Number(e.newValue));
      }
      if (e.key === 'cart_items') {
        try {
          const raw = e.newValue;
          if (!raw) return setCartCount(0);
          const arr = JSON.parse(raw as string) as Array<{ id: string; qty: number }>;
          setCartCount(arr.reduce((s, it) => s + (it.qty || 0), 0));
        } catch {
          setCartCount(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also listen for internal cart updates dispatched as a CustomEvent so
  // changes in the same tab update the header immediately.
  useEffect(() => {
    const onCartUpdated = () => {
      try {
        const raw = localStorage.getItem('cart_items');
        if (!raw) return setCartCount(0);
        const arr = JSON.parse(raw) as Array<{ id: string; qty: number }>;
        setCartCount(arr.reduce((s, it) => s + (it.qty || 0), 0));
      } catch {
        setCartCount(0);
      }
    };

    window.addEventListener('cart_updated', onCartUpdated as EventListener);
    return () => window.removeEventListener('cart_updated', onCartUpdated as EventListener);
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
              <Link className="btn btn-ghost btn-sm" href="/rewards">Rewards</Link>
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

              {/* Points summary and cart */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="px-3 py-1 rounded-full border border-base-300 bg-base-100 text-sm flex items-center gap-2">
                  <span className="text-xs opacity-70">Points</span>
                  <span className="font-semibold">{userPoints}</span>
                </div>

                <Link href="/shop" className="btn btn-ghost btn-sm">
                  <div className="indicator">
                    <span className="indicator-item badge badge-primary">{cartCount}</span>
                    <span aria-hidden className="text-lg">🛒</span>
                    <span className="sr-only">Shopping cart with {cartCount} items</span>
                  </div>
                </Link>
              </div>

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
