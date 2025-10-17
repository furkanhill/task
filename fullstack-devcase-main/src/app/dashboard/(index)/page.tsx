"use client";

import UserList from "./components/user-list";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return <UserList />;
}
