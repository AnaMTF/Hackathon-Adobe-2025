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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const strength = passwordStrength(password);

  const handleFile = async (file?: File | null) => {
    if (!file) {
      setProfilePreview(null);
      setProfileBase64(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setProfilePreview(url);

    // Convert to base64
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileBase64(base64String);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // client-side validation
    if (!fullName.trim()) return setError("Full name is required");
    if (!email.trim()) return setError("Email is required");
    if (!email.endsWith("@xiat.com")) return setError("Email must end with @xiat.com");
    if (!password) return setError("Password is required");
    if (!confirmPassword) return setError("Please confirm your password");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!department.trim()) return setError("Department is required");
    if (!jobTitle.trim()) return setError("Job title is required");

    setLoading(true);
    try {
      // Send data to API route for registration
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeFullName: fullName,
          email: email,
          parola: password,
          departament: department,
          jobTitle: jobTitle,
          telefon: phone || '',
          location: location || '',
          poza: profileBase64 || '', // Use base64 string instead of preview URL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // After successful registration, user is automatically logged in
      // Navigate to feed
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
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
            <h1 className="text-2xl font-bold text-shadow-lg">Create an XIAT account</h1>
            <p className="text-sm text-neutral text-shadow-lg">All fields marked with * are required</p>
          </div>
        </div>

  {error && <div role="alert" className="alert alert-error mb-4 text-shadow-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Full name *</span></label>
            <input className="input input-bordered" value={fullName} onChange={(e) => setFullName(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Email *</span></label>
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
              <span className={`text-xs text-shadow-lg ${email && !email.endsWith('@xiat.com') ? 'text-error' : 'text-neutral'}`}>
                Must end with @xiat.com
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Password *</span></label>
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
              <p className="text-xs mt-1 text-neutral text-shadow-lg">Password strength: {['Very weak','Weak','Okay','Good','Strong'][strength]}</p>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Confirm Password *</span></label>
            <input
              className="input input-bordered"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required
            />
            {confirmPassword && password !== confirmPassword && (
              <label className="label">
                <span className="text-xs text-error text-shadow-lg">
                  Passwords do not match
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Phone</span></label>
            <input className="input input-bordered" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="optional" />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Department *</span></label>
            <input className="input input-bordered" value={department} onChange={(e) => setDepartment(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Job title *</span></label>
            <input className="input input-bordered" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required aria-required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-shadow-lg">Location</span></label>
            <input className="input input-bordered" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="optional" />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label"><span className="label-text text-shadow-lg">Profile picture</span></label>
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
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img src={profilePreview} alt="preview" className="w-full h-full object-cover rounded-full" />
                </div>
              ) : (
                <div className="avatar placeholder w-24 h-24 flex items-center justify-center bg-base-200 text-neutral text-shadow-lg rounded-full">Preview</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" className="btn btn-ghost text-shadow-lg" onClick={() => router.push('/auth')}>Back</button>
          <button type="submit" className="btn btn-primary text-shadow-lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </div>
      </form>
    </main>
  );
}
