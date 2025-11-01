"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const strength = passwordStrength(password);

  const handleFile = (file?: File | null) => {
    if (!file) {
      setProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // client-side validation
    if (!fullName.trim()) return setError("Full name is required");
    if (!email.trim()) return setError("Email is required");
    if (!email.endsWith("@xiat.com")) return setError("Email must end with @xiat.com");
    if (!password) return setError("Password is required");
    if (!department.trim()) return setError("Department is required");
    if (!jobTitle.trim()) return setError("Job title is required");

    setLoading(true);
    try {
      // TODO: send data to API route for registration
      await new Promise((res) => setTimeout(res, 800));
      console.log("Registering", { fullName, email, department, jobTitle });
      // after success, navigate to login
      router.push('/auth');
    } catch (err) {
      setError("Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-3xl bg-base-100 shadow-xl p-6 md:p-10">
        <div className="flex items-center gap-4 mb-6">
          <Image src="/assets/logo.jpeg" alt="logo" width={64} height={64} className="rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">Create an XIAT account</h1>
            <p className="text-sm text-neutral">All fields marked with * are required</p>
          </div>
        </div>

        {error && <div role="alert" className="alert alert-error mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Full name *</span></label>
            <input className="input input-bordered" value={fullName} onChange={(e) => setFullName(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Email *</span></label>
            <input
              className="input input-bordered"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@xiat.com"
              required
              aria-required
            />
            <label className="label">
              <span className={`text-xs ${email && !email.endsWith('@xiat.com') ? 'text-error' : 'text-neutral'}`}>
                Must end with @xiat.com
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Password *</span></label>
            <input
              className="input input-bordered"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required
            />
            <div className="mt-2">
              <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full ${strength >= 3 ? 'bg-success' : strength === 2 ? 'bg-warning' : 'bg-error'}`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-neutral">Password strength: {['Very weak','Weak','Okay','Good','Strong'][strength]}</p>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Phone</span></label>
            <input className="input input-bordered" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="optional" />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Department *</span></label>
            <input className="input input-bordered" value={department} onChange={(e) => setDepartment(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Job title *</span></label>
            <input className="input input-bordered" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Location</span></label>
            <input className="input input-bordered" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="optional" />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label"><span className="label-text">Profile picture</span></label>
            <div className="flex items-center gap-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="file-input file-input-bordered"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  handleFile(file || null);
                }}
              />
              {profilePreview ? (
                <div className="w-24 h-24 rounded overflow-hidden">
                  <img src={profilePreview} alt="preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="avatar placeholder w-24 h-24 flex items-center justify-center bg-base-200 text-neutral">Preview</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/auth')}>Back</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </div>
      </form>
    </main>
  );
}
