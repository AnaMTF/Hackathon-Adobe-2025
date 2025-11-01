"use client";

import { useState } from "react";
import Image from "next/image";

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

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      // TODO: wire this to your registration API
      await new Promise((res) => setTimeout(res, 600));
      console.log("Register", { username });
    } catch (err) {
      setError("Failed to register");
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
          width={164}
          height={164}
          className="mb-2"
        />
        <h2 className="text-3xl font-bold">Welcome to XIAT Employee Log in Page</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-100 shadow-md p-6"
        aria-labelledby="auth-heading"
      >
        <h1 id="auth-heading" className="text-2xl font-bold mb-4 text-center">
          Sign in
        </h1>

        <div className="form-control mb-3">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered"
            required
            aria-label="username"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered"
            required
            aria-label="password"
          />
        </div>

        {error && <p className="text-sm text-error mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? "Please wait..." : "Log in"}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleRegister}
            disabled={loading}
            aria-disabled={loading}
          >
            Register
          </button>
        </div>

        <p className="text-xs text-center text-neutral mt-4">
          This is a demo UI — wire it to your backend to enable real auth.
        </p>
      </form>
    </main>
  );
}
