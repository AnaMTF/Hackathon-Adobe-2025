"use client";

import { useUserStatus } from "../hooks/useUserStatus";

export default function UserStatusProvider({ children }: { children: React.ReactNode }) {
  // This hook automatically manages user status
  useUserStatus();

  return <>{children}</>;
}
