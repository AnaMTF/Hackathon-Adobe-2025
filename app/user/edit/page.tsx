"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function EditUserPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    numeFullName: "",
    departament: "",
    jobTitle: "",
    telefon: "",
    location: "",
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(user?.poza || null);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        numeFullName: user.numeFullName || "",
        departament: user.departament || "",
        jobTitle: user.jobTitle || "",
        telefon: user.telefon || "",
        location: user.location || "",
      });
    }
  }, [user]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file?: File | null) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64String = reader.result as string;
    setProfileBase64(base64String); // will be sent to API
    setProfilePreview(base64String); // show preview
  };
  reader.readAsDataURL(file);
};

  // ← Add or replace your handleSubmit here
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/update", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: user!.email, ...formData, ...(profileBase64 ? { poza: profileBase64 } : {}) }),
});

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update profile");
        return;
      }

      // Refresh user context
      await refreshUser();
      router.push("/user");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 p-6">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-2xl bg-base-100 shadow-xl p-10 space-y-6"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Your Data</h1>

        <div className="flex flex-col items-center mb-6">
            <div
                className="w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-primary"
                onClick={() => fileInputRef.current?.click()}
                >
                {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
            <div className="w-full h-full flex items-center justify-center bg-base-200 text-gray-500">Click to add photo</div> )}
        </div>

        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        </div>


        {/* Full Name */}
        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text text-lg font-medium">Full Name</span>
          </label>
          <input
            className="input input-bordered input-lg w-full"
            name="numeFullName"
            value={formData.numeFullName}
            onChange={handleChange}
          />
        </div>

        {/* Department */}
        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text text-lg font-medium">Department</span>
          </label>
          <input
            className="input input-bordered input-lg w-full"
            name="departament"
            value={formData.departament}
            onChange={handleChange}
          />
        </div>

        {/* Job Title */}
        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text text-lg font-medium">Job Title</span>
          </label>
          <input
            className="input input-bordered input-lg w-full"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text text-lg font-medium">Phone</span>
          </label>
          <input
            className="input input-bordered input-lg w-full"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
          />
        </div>

        {/* Location */}
        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text text-lg font-medium">Location</span>
          </label>
          <input
            className="input input-bordered input-lg w-full"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            className="btn btn-outline btn-lg"
            onClick={() => router.push("/user")}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg">
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
