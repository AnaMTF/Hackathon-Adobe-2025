"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
          {user ? (
            <>
              <a className="btn btn-ghost btn-sm" href="/feed">Feed</a>
              <a className="btn btn-ghost btn-sm" href="/calendar">Calendar</a>
              <a className="btn btn-ghost btn-sm" href="/messages">Messages</a>
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
                        <span className="text-xs">{user.numeFullName.charAt(0)}</span>
                      </div>
                    </div>
                  )}
                  <span className="hidden md:inline">{user.numeFullName.split(' ')[0]}</span>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                  <li><a href="/user">Profile</a></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <a className="btn btn-ghost btn-sm" href="/auth">Login</a>
              <a className="btn btn-primary btn-sm" href="/register">Register</a>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
