"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/auth/supabaseClient";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

function getInitials(email?: string, name?: string) {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export default function UserStatus() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <div className="flex items-center h-10 text-title p-2">Not logged in</div>;

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const name = user.user_metadata?.full_name;
  const initials = getInitials(user.email, name);

  return (
    <div className="flex items-center gap-2 h-10">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-8 w-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center">
          {initials}
        </div>
      )}

      <span className="opacity-70">{name ?? user.email}</span>
      {/* Logout */}
      <button
        className="btn"
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        Logout
      </button>
    </div>
  );
}
