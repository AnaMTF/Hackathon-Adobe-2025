"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: wire this to your auth API
      await new Promise((res) => setTimeout(res, 600));
      console.log("Logging in", { username });
      // on success, redirect or update app state
    } catch (err) {
      setError("Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="absolute top-8 flex flex-col items-center">
        <Image
          src="/assets/logo.jpeg"
          alt="App Logo"
          width={120}
          height={120}
          className="mb-2 rounded-full"
        />
        <h2 className="text-3xl font-extrabold tracking-tight text-shadow-lg">XIAT Employee Portal</h2>
        <p className="text-sm text-gray-400 text-shadow-lg">Secure access for our XIAT team members</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-xl bg-base-100 shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        aria-labelledby="auth-heading"
      >
        <div className="px-2">
          <h1 id="auth-heading" className="text-2xl text-shadow-lg font-bold mb-4">
            Sign in
          </h1>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-shadow-lg">Username</span>
            </label>
            <input
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input input-bordered w-full"
              required
              aria-label="username"
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-shadow-lg">Password</span>
            </label>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
              aria-label="password"
            />
          </div>

          {error && <p className="text-sm text-error mb-3 text-shadow-lg">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? "Please wait..." : "Log in"}
            </button>

            <Link href="/register" className="btn btn-outline flex-1 text-center">
              Register
            </Link>
          </div>

          <p className="text-xs text-shadow-lg text-neutral mt-4">This is a demo UI — wire it to your backend to enable real auth.</p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center p-4">
            <div className="w-full flex items-center justify-center mb-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-accent text-white w-full text-center">
              <h3 className="text-lg font-bold text-shadow-lg">Welcome back!</h3>
              <p className="text-sm opacity-90 text-shadow-lg">Enter your credentials to access the XIAT internal tools.</p>
            </div>
          </div>
          <div className="w-full mt-4">
            <ul className="text-sm list-disc list-inside text-gray-400 text-shadow-lg">
              <li>Secure connection</li>
              <li>Company-only access</li>
              <li>Need an account? Click Register</li>
            </ul>
          </div>
        </div>
      </form>
    </main>
  );
}
