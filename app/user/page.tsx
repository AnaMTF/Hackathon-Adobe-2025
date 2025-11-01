"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 p-6">
      <div className="card bg-base-100 shadow-2xl w-full max-w-3xl p-10 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* User Image */}
          <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-primary">
            <Image
              src={user.poza || "/assets/default-avatar.png"}
              alt={user.numeFullName}
              fill
              className="object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold">{user.numeFullName}</h1>
            <p className="text-lg text-gray-600">{user.email}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 mt-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-base font-semibold">{user.departament || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Job Title</p>
                <p className="text-base font-semibold">{user.jobTitle || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-semibold">{user.telefon || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-base font-semibold">{user.location || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/user/edit")}
            className="btn btn-primary btn-lg"
          >
            Change Data
          </button>
        </div>
      </div>
    </main>
  );
}
