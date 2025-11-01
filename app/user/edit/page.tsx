"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/auth/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await refreshUser();
      router.push("/user");
    } else {
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
